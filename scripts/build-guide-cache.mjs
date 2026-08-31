/**
 * Work out a form's guidance once, so nobody pays for it again.
 *
 * An official form is the same document for every person who opens it. This
 * walks a form's own PDF, asks the running app to explain each box or line and
 * each page, and writes the answers to
 * `public/guide-cache/<formId>.<language>.json`. After that those explanations
 * are free and instant for everyone, and can be read and corrected by hand.
 *
 * Usage, with the dev server running and GEMINI_API_KEY set:
 *
 *   npm run dev                      # in one terminal
 *   node scripts/build-guide-cache.mjs nhs_hc1
 *   node scripts/build-guide-cache.mjs asf1_asylum_support --dari
 *
 * It is resumable: anything already in the file is skipped, so a run that
 * stops part way can simply be run again. Nothing is deleted.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const formId = process.argv[2];
const language = process.argv.includes('--dari') ? 'dari' : 'farsi';
const baseUrl = process.env.APP_URL || 'http://localhost:3000';

if (!formId) {
  console.error('Which form? e.g. node scripts/build-guide-cache.mjs nhs_hc1');
  process.exit(1);
}

// Same normalisation as src/data/guideCache.ts, or the app will miss every key.
const cacheKey = (text) => (text || '').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 300);

// The registry is TypeScript; read the two fields we need without compiling it.
const formsSource = fs.readFileSync(path.join(root, 'src/data/officialForms.ts'), 'utf8');
const formStart = formsSource.indexOf(`id: '${formId}'`);
if (formStart === -1) {
  console.error(`No form with id "${formId}" in src/data/officialForms.ts`);
  process.exit(1);
}
const formBlock = formsSource.slice(formStart);
const pdfPath = formBlock.match(/pdfPath: '([^']+)'/)?.[1];
const titleEn = formBlock.match(/titleEn: '([^']+)'/)?.[1] || formId;
if (!pdfPath) {
  console.error(`No pdfPath for "${formId}" in src/data/officialForms.ts`);
  process.exit(1);
}

const outDir = path.join(root, 'public/guide-cache');
const outFile = path.join(outDir, `${formId}.${language}.json`);
fs.mkdirSync(outDir, { recursive: true });

const cache = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : {};
cache.fields ??= {};
cache.pages ??= {};

const pdfjs = await import(
  pathToFileURL(path.join(root, 'node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href
);

const file = path.join(root, pdfPath);
if (!fs.existsSync(file)) {
  console.error(`Missing PDF: ${pdfPath}`);
  process.exit(1);
}
const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(file)) }).promise;
console.log(`${titleEn}, ${language}: ${doc.numPages} pages`);

const post = async (route, body) => {
  const res = await fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${route} returned ${res.status}`);
  return res.json();
};

let asked = 0;
let skipped = 0;
let failed = 0;

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const textContent = await page.getTextContent();
  const pageText = textContent.items
    .map((i) => i.str || '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!pageText) continue;

  const annotations = await page.getAnnotations();
  const widgets = annotations.filter((a) => a.subtype === 'Widget' && a.fieldName);

  // Whole page: the answer behind the "what does this page say" button.
  if (cache.pages[String(p - 1)]) {
    skipped++;
  } else {
    try {
      const data = await post('/api/form/explain-page', {
        pageText,
        formTitle: titleEn,
        pageNumber: p,
        userLanguage: language,
      });
      if (data.answerFa) cache.pages[String(p - 1)] = data.answerFa;
      asked++;
    } catch (err) {
      failed++;
      console.warn(`\npage ${p} failed: ${err.message}`);
    }
  }

  // Each box, or each printed line when the PDF has no boxes.
  const targets = widgets.length
    ? widgets.map((w) => ({
        name: String(w.fieldName),
        type: w.fieldType === 'Btn' ? 'choice' : 'text',
      }))
    : groupLines(textContent.items).map((line) => ({ name: line, type: 'text' }));

  for (const target of targets) {
    const key = cacheKey(target.name);
    if (!key || cache.fields[key]) {
      skipped++;
      continue;
    }
    try {
      const data = await post('/api/form/explain-field', {
        fieldName: target.name,
        fieldType: target.type,
        pageContext: pageText,
        formTitle: titleEn,
        userLanguage: language,
      });
      if (data.meaningFa) {
        cache.fields[key] = {
          labelFa: data.labelFa || '',
          meaningFa: data.meaningFa,
          whatToWriteFa: data.whatToWriteFa || '',
          ...(data.exampleAnswer ? { exampleAnswer: data.exampleAnswer } : {}),
          ...(data.cautionFa ? { cautionFa: data.cautionFa } : {}),
        };
      }
      asked++;
    } catch (err) {
      failed++;
      console.warn(`\nfield "${target.name.slice(0, 40)}" failed: ${err.message}`);
    }
  }

  // Written after every page, so stopping the run loses nothing.
  fs.writeFileSync(outFile, JSON.stringify(cache, null, 2));
  process.stdout.write(`page ${p}/${doc.numPages} `);
}

const size = (fs.statSync(outFile).size / 1024).toFixed(0);
console.log(`\nasked ${asked}, already had ${skipped}${failed ? `, ${failed} failed` : ''}.`);
console.log(`Written to public/guide-cache/${formId}.${language}.json (${size} KB).`);
console.log('Read through it before shipping - it is the wording every user will see.');
if (failed) console.log('Run it again to retry whatever failed.');

function groupLines(items) {
  const rows = [];
  let current = null;
  for (const item of items) {
    const text = (item.str || '').trim();
    if (!text) continue;
    const y = Math.round(item.transform[5]);
    if (current && Math.abs(current.y - y) < 4) current.parts.push(text);
    else {
      if (current) rows.push(current.parts.join(' '));
      current = { y, parts: [text] };
    }
  }
  if (current) rows.push(current.parts.join(' '));
  return rows.map((r) => r.replace(/\s+/g, ' ').trim()).filter((r) => r.length > 2);
}
