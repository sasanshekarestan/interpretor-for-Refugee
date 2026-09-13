/**
 * One-off: move a file's raw Tailwind colours onto the design system.
 *
 * This is deliberately not clever. It rewrites colour utility classes and
 * nothing else, it never touches a comment (a comment saying "this used to be
 * slate-900" has to stay true), and every file it changes is looked at
 * afterwards. A regex pass over .tsx files has gone wrong on this project
 * before, when a whitespace tidy mangled template literals across the whole
 * app, so the rule learned from that is: change one exact kind of token, leave
 * everything else alone, and check with your eyes.
 *
 *   node scripts/map-to-tokens.mjs src/components/Foo.tsx [...]
 *   node scripts/map-to-tokens.mjs --dry src/components/Foo.tsx
 *
 * What it cannot decide, it leaves: gradients, anything on a dark ground, and
 * colours whose meaning is ambiguous. Those are listed at the end for a person
 * to deal with.
 */
import fs from 'node:fs';

const MAP = [
  // Structure -------------------------------------------------------------
  [/\bbg-white\b/g, 'bg-surface'],
  [/\bbg-(?:slate|gray|grey|zinc|neutral|stone)-(?:50|100)(\/\d{1,3})?\b/g, 'bg-page'],
  [/\bbg-(?:slate|gray|grey|zinc|neutral|stone)-(?:200|300)(\/\d{1,3})?\b/g, 'bg-page'],
  [/\bborder-(?:slate|gray|grey|zinc|neutral|stone)-(?:100|200)(\/\d{1,3})?\b/g, 'border-edge'],
  [/\bborder-(?:slate|gray|grey|zinc|neutral|stone)-(?:300|400)(\/\d{1,3})?\b/g, 'border-edge-control'],
  [/\bdivide-(?:slate|gray|grey|zinc|neutral|stone)-\d{2,3}(\/\d{1,3})?\b/g, 'divide-edge'],
  [/\btext-(?:slate|gray|grey|zinc|neutral|stone)-(?:800|900|950)(\/\d{1,3})?\b/g, 'text-ink'],
  [/\btext-(?:slate|gray|grey|zinc|neutral|stone)-(?:400|500|600|700)(\/\d{1,3})?\b/g, 'text-ink-muted'],
  [/\bplaceholder-(?:slate|gray|grey|zinc|neutral|stone)-\d{2,3}(\/\d{1,3})?\b/g, 'placeholder-ink-muted'],

  // The app acting --------------------------------------------------------
  [/\bbg-teal-(?:600|700|800|900)\b/g, 'bg-primary'],
  [/\bbg-teal-(?:50|100|200)(\/\d{1,3})?\b/g, 'bg-page'],
  [/\btext-teal-(?:600|700|800|900|950)(\/\d{1,3})?\b/g, 'text-primary'],
  [/\bborder-teal-(?:100|200|300)(\/\d{1,3})?\b/g, 'border-edge'],
  [/\bborder-teal-(?:500|600|700|800)(\/\d{1,3})?\b/g, 'border-primary'],
  [/\bring-teal-\d{2,3}(\/\d{1,3})?\b/g, 'ring-primary'],
  [/\baccent-teal-\d{2,3}\b/g, 'accent-primary'],
  [/\bfill-teal-\d{2,3}\b/g, 'fill-primary'],

  // Read this before you continue ----------------------------------------
  [/\bbg-amber-(?:50|100|200)(\/\d{1,3})?\b/g, 'bg-attention-bg'],
  [/\bbg-amber-(?:400|500|600|700|800|900)(\/\d{1,3})?\b/g, 'bg-attention'],
  [/\btext-amber-\d{2,3}(\/\d{1,3})?\b/g, 'text-attention'],
  [/\bborder-amber-\d{2,3}(\/\d{1,3})?\b/g, 'border-attention'],
  [/\bring-amber-\d{2,3}(\/\d{1,3})?\b/g, 'ring-attention'],
  [/\bfill-amber-\d{2,3}\b/g, 'fill-attention'],

  // Something went wrong --------------------------------------------------
  [/\bbg-(?:rose|red)-(?:50|100|200)(\/\d{1,3})?\b/g, 'bg-fault-bg'],
  [/\bbg-(?:rose|red)-(?:500|600|700|800)(\/\d{1,3})?\b/g, 'bg-fault'],
  [/\btext-(?:rose|red)-\d{2,3}(\/\d{1,3})?\b/g, 'text-fault'],
  [/\bborder-(?:rose|red)-\d{2,3}(\/\d{1,3})?\b/g, 'border-fault'],
  [/\bring-(?:rose|red)-\d{2,3}(\/\d{1,3})?\b/g, 'ring-fault'],

  // One shadow ------------------------------------------------------------
  [/\bshadow-(?:teal|rose|amber|slate)-\d{2,3}(\/\d{1,3})?\b/g, 'shadow-hamyar'],
  [/\bshadow-(?:2xs|xs|sm|md|lg|xl|2xl)\b/g, 'shadow-hamyar'],
];

/** Anything below needs a person: it carries meaning a map cannot read. */
const LEAVE = [
  [/\b(?:from|via|to)-[a-z]+-\d{2,3}(\/\d{1,3})?\b/, 'a gradient (design.md: flat fills only)'],
  [/\bbg-(?:slate|gray|grey|zinc|neutral|stone)-(?:700|800|900|950)(\/\d{1,3})?\b/, 'a dark ground'],
  [/\bborder-(?:slate|gray|grey|zinc|neutral|stone)-(?:600|700|800|900)(\/\d{1,3})?\b/, 'a dark border'],
  [/\btext-(?:slate|gray|grey|zinc|neutral|stone)-(?:100|200|300)(\/\d{1,3})?\b/, 'light text, so probably on a dark ground'],
  [/\btext-teal-(?:100|200|300|400|500)(\/\d{1,3})?\b/, 'light teal text, so probably on a dark ground'],
  [/\bbg-teal-(?:300|400|500)(\/\d{1,3})?\b/, 'a mid teal'],
];

/** Split into code and comment, and only ever rewrite the code. */
const mapOutsideComments = (text) => {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const block = text.indexOf('/*', i);
    const line = text.indexOf('//', i);
    const next =
      block === -1 ? line : line === -1 ? block : Math.min(block, line);
    if (next === -1) {
      out += rewrite(text.slice(i));
      break;
    }
    out += rewrite(text.slice(i, next));
    if (next === block) {
      const end = text.indexOf('*/', next + 2);
      const stop = end === -1 ? text.length : end + 2;
      out += text.slice(next, stop);
      i = stop;
    } else {
      const end = text.indexOf('\n', next);
      const stop = end === -1 ? text.length : end;
      out += text.slice(next, stop);
      i = stop;
    }
  }
  return out;
};

const rewrite = (chunk) => MAP.reduce((acc, [re, to]) => acc.replace(re, to), chunk);

const dry = process.argv.includes('--dry');
const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const after = mapOutsideComments(before);
  const changed = before !== after;
  if (changed && !dry) fs.writeFileSync(file, after);

  const left = [];
  for (const [re, why] of LEAVE) {
    const hits = after.split('\n').filter((l) => !l.trim().startsWith('//') && re.test(l));
    if (hits.length) left.push(`${hits.length} x ${why}`);
  }
  console.log(
    `${changed ? 'mapped' : '  same'}  ${file}${left.length ? `\n          left for a person: ${left.join('; ')}` : ''}`
  );
}
