import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
const require = createRequire(new URL('../apps/web/package.json', import.meta.url));
const dir = new URL('../apps/web/public/models/', import.meta.url);
await mkdir(dir, { recursive: true });
const file = new URL('ferrari.glb', dir);
const expected = '435197c5f9b56e08c114505ee019dedbc3d033a3';
function hash(bytes) {
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}
let bytes;
try {
  bytes = await readFile(file);
} catch {
  /* First build downloads the versioned model. */
}
if (!bytes || hash(bytes) !== expected) {
  const response = await fetch(
    'https://raw.githubusercontent.com/mrdoob/three.js/r175/examples/models/gltf/ferrari.glb',
    { signal: AbortSignal.timeout(60000) },
  );
  if (!response.ok) throw new Error(`Car model download failed: ${response.status}`);
  bytes = Buffer.from(await response.arrayBuffer());
  if (hash(bytes) !== expected) throw new Error('Car model checksum mismatch');
  await writeFile(file, bytes);
}
const decoder = new URL('draco/', dir);
await mkdir(decoder, { recursive: true });
const threeRoot = dirname(dirname(require.resolve('three')));
for (const name of ['draco_decoder.js', 'draco_wasm_wrapper.js', 'draco_decoder.wasm']) {
  await copyFile(join(threeRoot, 'examples/jsm/libs/draco/gltf', name), new URL(name, decoder));
}
console.log('Verified Ferrari model and local Draco decoder are ready.');
