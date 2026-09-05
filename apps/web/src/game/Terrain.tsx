import { useMemo } from 'react';
import { Color, Float32BufferAttribute, PlaneGeometry } from 'three';
import { TRACK_POINTS } from '@drivetalk/game-core';

export function terrainHeight(x: number, z: number): number {
  let distance = Infinity;
  for (const p of TRACK_POINTS) distance = Math.min(distance, Math.hypot(x - p.x, z - p.z));
  const edge = Math.max(0, Math.min(1, (distance - 17) / 35));
  return -0.06 + edge * edge * (5 + 4 * Math.sin(x * 0.037) * Math.cos(z * 0.029));
}

export function Terrain(): React.JSX.Element {
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(800, 800, 128, 128);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position!;
    const colors: number[] = [];
    const c = new Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        z = p.getZ(i),
        h = terrainHeight(x, z);
      p.setY(i, h);
      c.setHSL(
        0.22 + 0.025 * Math.sin(x * 0.07),
        0.34,
        0.12 + 0.035 * Math.sin(x * 0.12 + z * 0.08),
      );
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} />
    </mesh>
  );
}
