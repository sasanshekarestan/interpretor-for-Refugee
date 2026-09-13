/**
 * The design system, checked rather than asserted.
 *
 * design.md says the palette lives in tokens.css and nowhere else, that
 * nothing sits below 14px, and that no two languages share a line. Most of the
 * app does not obey it yet: the system reached the home page, the form
 * library, My Documents, the back bar and the cookie notice, and never reached
 * the letter reader, the form companion internals, the interpreter card or the
 * audio input. The handover said the design system had landed. It had not, and
 * this file exists so that claim can never again rest on somebody's memory of
 * a session.
 *
 * It works as a ratchet, not a pass/fail. Today's counts are the ceiling. A
 * change that adds one more `slate-700` fails. A change that removes fifty
 * passes and lowers the ceiling. That way the sweep can happen screen by
 * screen, over weeks, without anyone having to hold the whole thing in their
 * head, and without the debt quietly growing back while attention is
 * elsewhere.
 *
 * The hard rules below are different. They are at zero and they stay at zero.
 *
 *   node tests/design-guard.mjs             check
 *   node tests/design-guard.mjs --accept    lower the ceiling to what is there
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.join(here, '..');
const src = path.join(repo, 'src');
const CEILING_FILE = path.join(here, 'design-ceiling.json');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.(tsx|ts)$/.test(e.name) ? [full] : [];
  });

/**
 * Comments are not code.
 *
 * A comment saying "this used to be slate-900, which is not in tokens.css" is
 * how the next person knows why a thing changed, and counting it as debt
 * punishes exactly the explanation that stops the debt coming back. The first
 * version of this file counted them, and the answer was to reword the comments
 * until the number fell, which is the tail wagging the dog.
 *
 * Block comments go entirely. Line comments go only when the // starts the
 * line, so a URL in the middle of a line survives.
 */
const withoutComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

const files = walk(src).map((f) => ({
  path: path.relative(repo, f),
  text: withoutComments(fs.readFileSync(f, 'utf8')),
}));

/** Counted, and allowed to shrink but never grow. */
const COUNTED = {
  'off-system neutrals': {
    why: 'slate, gray, zinc, neutral and stone are not in tokens.css. Use ink, ink-muted, edge, surface, page.',
    re: /\b(?:slate|gray|grey|zinc|neutral|stone)-\d{2,3}\b/g,
  },
  'off-system colours': {
    why: 'Tailwind palette colours outside the five that carry meaning. Use primary, emphasis, attention, fault.',
    re: /\b(?:teal|rose|amber|emerald|sky|indigo|violet|orange|red|green|blue|yellow|purple|pink|cyan|lime|fuchsia)-\d{2,3}\b/g,
  },
  'hardcoded hex': {
    why: 'A colour in a component. Every value belongs in tokens.css.',
    re: /#[0-9a-fA-F]{6}\b/g,
  },
  'arbitrary type sizes': {
    why: 'text-[13.5px] and friends. The scale is in tokens.css; 16px is the floor for anything read.',
    re: /text-\[[0-9.]+px\]/g,
  },
  'arrow glyphs': {
    why: 'A typed arrow is not an icon. design.md: Lucide only.',
    re: /➔/g,
  },
};

/** At zero, and staying there. */
const HARD = {
  'phantom direction classes': {
    why: 'dir-rtl and dir-ltr are not classes in Tailwind or anywhere else. Use the dir attribute.',
    find: (text) => [...text.matchAll(/className=[^>]*?\b(dir-(?:rtl|ltr))\b/g)].map((m) => m[1]),
  },
  'NHS blue in the interface': {
    why: '#005EB8 belongs to the NHS. It survives only inside a rendered document, never on our own chrome.',
    find: (text, file) =>
      file.endsWith('tokens.css') ? [] : [...text.matchAll(/#005EB8/gi)].map((m) => m[0]),
  },
};

let failures = 0;
const fail = (why) => {
  console.log(`FAIL: ${why}`);
  failures++;
};

// ---- Hard rules ---------------------------------------------------------
for (const [name, rule] of Object.entries(HARD)) {
  const hits = files.flatMap((f) => rule.find(f.text, f.path).map((h) => `${f.path}: ${h}`));
  if (hits.length) {
    fail(`${name} (${hits.length}). ${rule.why}`);
    for (const h of hits.slice(0, 8)) console.log(`        ${h}`);
  } else {
    console.log(`ok   no ${name}`);
  }
}

// ---- Every declared document is actually there --------------------------
{
  const data = fs.readFileSync(path.join(src, 'data', 'officialForms.ts'), 'utf8');
  const declared = [...data.matchAll(/pdfPath: '([^']+)'/g)].map((m) => m[1]);
  const missing = declared.filter((p) => !fs.existsSync(path.join(repo, p)));
  if (missing.length) {
    // This is how School Application came to show a parent the words "Invalid
    // PDF structure": the entry claimed a file that was not in the repository,
    // the SPA fallback served index.html in its place, and pdf.js said what
    // pdf.js says.
    fail(`${missing.length} form(s) declare a document that does not exist: ${missing.join(', ')}`);
  } else {
    console.log(`ok   all ${declared.length} declared documents exist`);
  }
}

// ---- Counted, with a ceiling --------------------------------------------
const counts = {};
const byFile = {};
for (const [name, rule] of Object.entries(COUNTED)) {
  let total = 0;
  const per = [];
  for (const f of files) {
    if (f.path.endsWith('tokens.css')) continue;
    const n = (f.text.match(rule.re) || []).length;
    if (n) per.push([f.path, n]);
    total += n;
  }
  counts[name] = total;
  byFile[name] = per.sort((a, b) => b[1] - a[1]);
}

const accept = process.argv.includes('--accept');
const ceiling = fs.existsSync(CEILING_FILE) ? JSON.parse(fs.readFileSync(CEILING_FILE, 'utf8')) : {};

if (accept) {
  fs.writeFileSync(CEILING_FILE, JSON.stringify(counts, null, 2) + '\n');
  console.log('\nCeiling written:');
  for (const [k, v] of Object.entries(counts)) console.log(`     ${String(v).padStart(4)}  ${k}`);
  process.exit(0);
}

console.log('');
for (const [name, total] of Object.entries(counts)) {
  const limit = ceiling[name];
  if (limit === undefined) {
    console.log(`ok   ${String(total).padStart(4)}  ${name} (no ceiling recorded yet)`);
  } else if (total > limit) {
    fail(`${name} rose from ${limit} to ${total}. ${COUNTED[name].why}`);
    for (const [file, n] of byFile[name].slice(0, 6)) console.log(`        ${n}  ${file}`);
  } else if (total < limit) {
    console.log(
      `ok   ${String(total).padStart(4)}  ${name}, down from ${limit}. Run --accept to lower the ceiling.`
    );
  } else {
    console.log(`ok   ${String(total).padStart(4)}  ${name}, unchanged`);
  }
}

// The worst files, so the sweep has somewhere obvious to start.
if (!failures) {
  const worst = byFile['off-system neutrals'].slice(0, 5);
  if (worst.length) {
    console.log('\nMost off-system neutrals:');
    for (const [file, n] of worst) console.log(`     ${String(n).padStart(4)}  ${file}`);
  }
}

console.log(
  failures === 0
    ? '\nThe debt did not grow.'
    : `\n${failures} failure(s).`
);
process.exit(failures === 0 ? 0 : 1);
