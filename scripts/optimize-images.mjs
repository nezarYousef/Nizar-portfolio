/* Re-encodes every source image to WebP at a sensible ceiling and writes the
   result into public/. The originals live in assets/images-src/, which is not
   served, so no PNG or JPEG ever reaches a visitor. next/image negotiates
   AVIF from these WebP sources for browsers that accept it.

   Run with: npm run optimize:images
*/
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import sharp from "sharp";

const SRC_ROOT = "assets/images-src";
const OUT_ROOT = "public/images";

/* Ceilings chosen from how each image is actually displayed. Galleries open
   at up to ~780 CSS px in the modal, so 1600 covers 2x. */
const RULES = [
  { match: /^profile\//, width: 960, quality: 82 },
  { match: /^other-experience\//, width: 900, quality: 78 },
  { match: /ba\.(png|jpe?g)$/i, width: 1200, quality: 78 },
  { match: /.*/, width: 1600, quality: 78 }
];

const ruleFor = (relPath) =>
  RULES.find((rule) => rule.match.test(relPath.replace(/\\/g, "/"))) ??
  RULES[RULES.length - 1];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
      yield full;
    }
  }
}

let sourceBytes = 0;
let outputBytes = 0;
let count = 0;

for await (const file of walk(SRC_ROOT)) {
  const rel = relative(SRC_ROOT, file).replace(/\\/g, "/");
  const rule = ruleFor(rel);
  const outPath = join(OUT_ROOT, rel.replace(new RegExp(`${extname(rel)}$`), ".webp"));

  await mkdir(dirname(outPath), { recursive: true });

  const buffer = await sharp(file)
    .rotate()
    .resize({ width: rule.width, withoutEnlargement: true })
    .webp({ quality: rule.quality, effort: 6 })
    .toBuffer();

  await writeFile(outPath, buffer);

  sourceBytes += (await stat(file)).size;
  outputBytes += buffer.length;
  count += 1;
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);
console.log(`${count} images`);
console.log(`source: ${mb(sourceBytes)} MB -> output: ${mb(outputBytes)} MB`);
console.log(
  `saved ${mb(sourceBytes - outputBytes)} MB (${(
    (1 - outputBytes / sourceBytes) *
    100
  ).toFixed(1)}%)`
);
