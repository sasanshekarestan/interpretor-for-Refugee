/**
 * Build a form's guide-cache file from the hand-written Persian in
 * scripts/guide-source/, without asking the model anything.
 *
 * The generated route (build-guide-cache.mjs) is still there for forms nobody
 * has written up yet. This one is for the forms we have written by hand: it
 * costs nothing to run, it is repeatable, and what it produces can be checked
 * against the paper line by line.
 *
 *   node scripts/build-guide-cache-written.mjs nhs_hc1
 *
 * It reports which boxes it could not describe. Those are left out on purpose:
 * an unmatched box falls back to being explained on demand, which is better
 * than a confident guess about a box whose meaning is not clear.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const formId = process.argv[2];
const language = process.argv.includes('--dari') ? 'dari' : 'farsi';

if (!formId) {
  console.error('Which form? e.g. node scripts/build-guide-cache-written.mjs nhs_hc1');
  process.exit(1);
}

// Same normalisation as src/data/guideCache.ts, or the app will miss every key.
const cacheKey = (text) => (text || '').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 300);

const formsSource = fs.readFileSync(path.join(root, 'src/data/officialForms.ts'), 'utf8');
const formStart = formsSource.indexOf(`id: '${formId}'`);
if (formStart === -1) {
  console.error(`No form with id "${formId}" in src/data/officialForms.ts`);
  process.exit(1);
}
const pdfPath = formsSource.slice(formStart).match(/pdfPath: '([^']+)'/)?.[1];

const load = async (suffix) => {
  const file = path.join(__dirname, 'guide-source', `${formId}.${suffix}.${language}.js`);
  if (!fs.existsSync(file)) return null;
  return (await import(pathToFileURL(file).href)).default;
};

const pages = await load('pages');
const explainField = await load('fields');

if (!pages && !explainField) {
  console.error(`Nothing written yet for ${formId} in ${language}. Look in scripts/guide-source/.`);
  process.exit(1);
}

const cache = { fields: {}, pages: {} };

for (const [index, text] of Object.entries(pages || {})) {
  cache.pages[String(index)] = String(text).trim();
}

const unmatched = [];

if (explainField && pdfPath) {
  const pdfjs = await import(
    pathToFileURL(path.join(root, 'node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href
  );
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(fs.readFileSync(path.join(root, pdfPath))),
  }).promise;

  const seen = new Set();
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const widgets = (await page.getAnnotations()).filter((a) => a.subtype === 'Widget' && a.fieldName);
    for (const widget of widgets) {
      const name = String(widget.fieldName);
      if (seen.has(name)) continue;
      seen.add(name);

      const written = explainField(name);
      if (written) cache.fields[cacheKey(name)] = written;
      else unmatched.push(name);
    }
  }
  console.log(`${seen.size} boxes: ${seen.size - unmatched.length} written, ${unmatched.length} left to the assistant`);
}

const outDir = path.join(root, 'public/guide-cache');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${formId}.${language}.json`);
fs.writeFileSync(outFile, JSON.stringify(cache, null, 2));

const size = (fs.statSync(outFile).size / 1024).toFixed(0);
console.log(
  `${Object.keys(cache.pages).length} pages, ${Object.keys(cache.fields).length} boxes` +
    ` -> public/guide-cache/${formId}.${language}.json (${size} KB)`
);

if (unmatched.length && process.argv.includes('--list-gaps')) {
  console.log('\nNot described here, so explained on demand:');
  unmatched.forEach((n) => console.log(`  ${n}`));
}
