/**
 * Every suite, against a fresh build, in one command.
 *
 * These suites used to live in a scratch directory outside the repository.
 * That meant only whoever happened to be in that session could run them, and
 * when the session ended they were gone: CLAUDE.md went on telling people to
 * run eleven suites nobody could find. They live here now because a test that
 * is not in the repository does not exist.
 *
 *   npm test                  build, then run everything
 *   npm test -- cookie back   run only the suites whose names contain these
 *   npm test -- --no-build    against whatever is already in dist/
 *
 * The design guard runs first. It is the cheap one, it needs no browser, and
 * it fails fastest.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4173;

const args = process.argv.slice(2);
const noBuild = args.includes('--no-build');
const filters = args.filter((a) => !a.startsWith('--'));

// design-guard first, then the browser suites in the order they were written.
const ORDER = [
  'design-guard',
  'library-test',
  'cookie-test',
  'back-test',
  'cursor-test',
  'docs-test',
  'favicon-test',
  'cache-test',
  'gp-cache-test',
  'hc5-test',
  'error-test',
  'speech-test',
  'export-test',
];

const all = fs
  .readdirSync(here)
  .filter((f) => f.endsWith('.mjs') && f !== 'run-all.mjs' && f !== 'serve.mjs')
  .map((f) => f.replace(/\.mjs$/, ''))
  .sort((a, b) => {
    const ia = ORDER.indexOf(a);
    const ib = ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });

const suites = filters.length ? all.filter((s) => filters.some((f) => s.includes(f))) : all;

if (!suites.length) {
  console.error(`No suite matches ${filters.join(', ')}. Available:\n  ${all.join('\n  ')}`);
  process.exit(1);
}

const run = (cmd, cmdArgs, env = {}) =>
  new Promise((resolve) => {
    const child = spawn(cmd, cmdArgs, {
      cwd: path.join(here, '..'),
      stdio: 'inherit',
      env: { ...process.env, ...env },
    });
    child.on('close', (code) => resolve(code ?? 1));
  });

if (!noBuild) {
  console.log('Building.\n');
  // A measurement ID has to exist at build time or the cookie notice compiles
  // itself out and cookie-test has nothing to test. VITE_ values are baked in
  // by Vite, so this cannot be set later. It is a fake ID: every other suite
  // seeds the choice as "rejected", and the one suite that presses Accept is
  // asserting that a request was attempted, not that Google answered.
  const code = await run('npx', ['vite', 'build', '--logLevel', 'warn'], {
    VITE_GA_MEASUREMENT_ID: process.env.VITE_GA_MEASUREMENT_ID || 'G-TESTONLY00',
    // A fake Clarity id too, so cookie-test exercises the real gate: it checks
    // that nothing reaches clarity.ms before a choice, and Clarity has to be
    // configured for there to be anything to hold back.
    VITE_CLARITY_ID: process.env.VITE_CLARITY_ID || 'testonly00',
  });
  if (code !== 0) {
    console.error('\nThe build failed, so there is nothing honest to test.');
    process.exit(1);
  }
}

if (!fs.existsSync(path.join(here, '..', 'dist', 'index.html'))) {
  console.error('No dist/index.html. Run without --no-build.');
  process.exit(1);
}

const server = await serve(PORT);
const results = [];

for (const suite of suites) {
  console.log(`\n${'-'.repeat(66)}\n${suite}\n${'-'.repeat(66)}`);
  const code = await run('node', [path.join(here, `${suite}.mjs`)], {
    HAMYAR_TEST_URL: `http://localhost:${PORT}`,
    PLAYWRIGHT_CHROMIUM: process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium',
  });
  results.push([suite, code === 0]);
}

server.close();

const failed = results.filter(([, ok]) => !ok);
console.log(`\n${'='.repeat(66)}`);
for (const [suite, ok] of results) console.log(`${ok ? 'pass' : 'FAIL'}  ${suite}`);
console.log(
  failed.length === 0
    ? `\nAll ${results.length} suites pass.`
    : `\n${failed.length} of ${results.length} suites failed: ${failed.map(([s]) => s).join(', ')}`
);
process.exit(failed.length === 0 ? 0 : 1);
