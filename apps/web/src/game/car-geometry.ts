import { BufferGeometry, Float32BufferAttribute } from 'three';

// Cross sections run from tail to nose; +Z is the vehicle's forward axis.
export function coachwork(
  sections: readonly (readonly [number, number, number, number])[],
): BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  const count = 24;
  sections.forEach(([z, width, bottom, top]) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const c = Math.cos(a),
        s = Math.sin(a);
      vertices.push(
        width * Math.sign(c) * Math.abs(c) ** 0.45,
        (bottom + top) / 2 + ((top - bottom) / 2) * Math.sign(s) * Math.abs(s) ** 0.45,
        z,
      );
    }
  });
  for (let ring = 0; ring < sections.length - 1; ring++) {
    for (let i = 0; i < count; i++) {
      const a = ring * count + i,
        b = ring * count + ((i + 1) % count);
      indices.push(a, b, b + count, a, b + count, a + count);
    }
  }
  for (let i = 1; i < count - 1; i++) {
    indices.push(0, i + 1, i);
    const end = (sections.length - 1) * count;
    indices.push(end, end + i, end + i + 1);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
