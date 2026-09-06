/**
 * The app's icon, generated from the wordmark rather than drawn beside it.
 *
 * Hamyar had no favicon at all, so every tab showed a browser default and the
 * app looked unowned in a phone's tab strip and on a home screen. The icon is
 * the H from public/brand/hamyar-wordmark.svg, white on the brand teal, and it
 * is taken from that file at build time: if the wordmark is ever redrawn, the
 * icon is one command behind rather than a separate thing to remember.
 *
 * A letter and not a picture because the job of a favicon is to be recognised
 * at sixteen pixels. At that size an illustration is four grey dots, and the
 * people using this app are often on an old phone with a dim screen.
 *
 * Run: node scripts/build-favicons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const wordmark = readFileSync(join(root, 'public/brand/hamyar-wordmark.svg'), 'utf8');

/** The first glyph in the wordmark is the H. */
const paths = [...wordmark.matchAll(/<path class="cls-1" d="([^"]+)"/g)].map((m) => m[1]);
if (paths.length === 0) throw new Error('No glyph paths found in the wordmark.');
const H = paths[0];

// Measured from the path itself, not guessed.
const GLYPH = { x: 0, y: 0.46, w: 73.35, h: 79.5 };

const TEAL = '#0E6E64';

/**
 * @param size    the square's side
 * @param cover   how much of that side the glyph's height takes
 * @param radius  corner radius, 0 for a full-bleed square
 */
const icon = (size, cover, radius) => {
  const scale = (size * cover) / GLYPH.h;
  const tx = (size - GLYPH.w * scale) / 2 - GLYPH.x * scale;
  const ty = (size - GLYPH.h * scale) / 2 - GLYPH.y * scale;
  const shape =
    radius > 0
      ? `<rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${TEAL}"/>`
      : `<rect width="${size}" height="${size}" fill="${TEAL}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <title>Hamyar</title>
  ${shape}
  <g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})">
    <path d="${H}" fill="#ffffff"/>
  </g>
</svg>
`;
};

/*
 * Three shapes, because the platforms crop differently.
 *
 *   browser   a rounded square, 58% glyph: the tab strip shows it as drawn.
 *             Compared against 50, 54 and 62 at a true sixteen pixels; below
 *             this the letter floats, above it the corners crowd it
 *   maskable  full bleed, 40% glyph: Android crops to a circle, and anything
 *             outside the middle 80% can be cut away
 *   apple     full bleed, 56%: iOS applies its own rounding, and a rounded
 *             icon inside that mask gets a pale halo at the corners
 */
const browser = icon(512, 0.58, 112);
const maskable = icon(512, 0.4, 0);
const apple = icon(512, 0.56, 0);

writeFileSync(join(root, 'public/favicon.svg'), browser);

const png = (svg, size, name) => {
  execFileSync(
    'python3',
    [
      '-c',
      `import cairosvg,sys;cairosvg.svg2png(bytestring=sys.stdin.buffer.read(),write_to=sys.argv[1],output_width=${size},output_height=${size})`,
      join(root, 'public', name),
    ],
    { input: svg }
  );
};

png(browser, 192, 'icon-192.png');
png(browser, 512, 'icon-512.png');
png(maskable, 512, 'icon-maskable-512.png');
png(apple, 180, 'apple-touch-icon.png');

// The .ico still matters: bookmarks bars, older Windows, and anything that
// ignores the SVG link. Three sizes in one file.
execFileSync(
  'python3',
  [
    '-c',
    `import cairosvg, io, sys
from PIL import Image
svg = sys.stdin.buffer.read()
frames = []
for s in (16, 32, 48):
    buf = io.BytesIO()
    cairosvg.svg2png(bytestring=svg, write_to=buf, output_width=s, output_height=s)
    buf.seek(0)
    frames.append(Image.open(buf).convert('RGBA'))
frames[0].save(sys.argv[1], format='ICO', sizes=[(f.width, f.height) for f in frames], append_images=frames[1:])`,
    join(root, 'public/favicon.ico'),
  ],
  { input: browser }
);

console.log('favicon.svg, favicon.ico, apple-touch-icon.png, icon-192, icon-512, icon-maskable-512');
