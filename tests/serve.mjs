/**
 * The smallest static server that behaves like the deployed app.
 *
 * Two details matter and both have cost real time before.
 *
 * It falls back to index.html for unknown paths, exactly as Vercel does. That
 * is what makes a missing file silently succeed: a guidance JSON that is not
 * in dist/ comes back as an HTML page with status 200, the app decides the
 * cache is unavailable and quietly asks the model instead. Tests that assert
 * "nothing reached the model" are the only thing that catches it.
 *
 * It serves from dist/, never from src/, so what the suites walk is what a
 * person would be served. Run `npm run build` first, or run `npm test`, which
 * does it for you.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', 'dist');

const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
};

export const serve = (port) =>
  new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      let file = path.join(root, url);
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        file = path.join(root, 'index.html');
      }
      res.writeHead(200, {
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(port, () => resolve(server));
  });

// `node tests/serve.mjs 4173` to poke at a build by hand.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] || 4173);
  if (!fs.existsSync(root)) {
    console.error('No dist/ to serve. Run `npm run build` first.');
    process.exit(1);
  }
  serve(port).then(() => console.log(`serving dist/ on http://localhost:${port}`));
}
