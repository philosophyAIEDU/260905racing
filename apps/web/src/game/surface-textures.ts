import { DataTexture, RepeatWrapping, RGBAFormat, SRGBColorSpace } from 'three';

export function asphaltTexture(): DataTexture {
  const size = 256;
  const bytes = new Uint8Array(size * size * 4);
  let seed = 617;
  for (let i = 0; i < size * size; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const value = 65 + (seed % 30);
    bytes.set([value, value + 2, value + 4, 255], i * 4);
  }
  const texture = new DataTexture(bytes, size, size, RGBAFormat);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
