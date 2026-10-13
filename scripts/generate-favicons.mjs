import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const source = fileURLToPath(new URL('../src/assets/favicon.png', import.meta.url));
const output = new URL('../public/', import.meta.url);
const background = '#c2410c';

await mkdir(output, { recursive: true });

for (const [filename, size, opaque] of [
  ['favicon-16x16.png', 16, false],
  ['favicon-32x32.png', 32, false],
  ['apple-touch-icon.png', 180, true],
  ['android-chrome-192x192.png', 192, true],
  ['android-chrome-512x512.png', 512, true],
]) {
  const icon = sharp(source).resize(size, size);
  if (opaque) icon.flatten({ background });
  await icon.png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL(filename, output)));
  console.log(`${filename}: ${size}x${size}`);
}

const frames = await Promise.all([16, 32, 48].map(async (size) => ({
  size,
  data: await sharp(source).resize(size, size).png({ compressionLevel: 9 }).toBuffer(),
})));

const directory = Buffer.alloc(6 + frames.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(frames.length, 4);

let offset = directory.length;
for (const [index, { size, data }] of frames.entries()) {
  const entry = 6 + index * 16;
  directory.writeUInt8(size, entry);
  directory.writeUInt8(size, entry + 1);
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(data.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += data.length;
}

await writeFile(new URL('favicon.ico', output), Buffer.concat([directory, ...frames.map(({ data }) => data)]));
console.log('favicon.ico: 16x16, 32x32, 48x48');
