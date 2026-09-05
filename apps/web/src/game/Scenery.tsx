import { useLayoutEffect, useRef } from 'react';
import { Color, InstancedMesh, Object3D } from 'three';
import { trackPoint } from '@drivetalk/game-core';

export function Scenery(): React.JSX.Element {
  const trees = useRef<InstancedMesh>(null);
  const trunks = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!trees.current || !trunks.current) return;
    const o = new Object3D();
    const c = new Color();
    for (let i = 0; i < 110; i++) {
      const p = trackPoint(i / 110);
      const side = i % 3 === 0 ? 1 : -1;
      const offset = 16 + ((i * 17) % 31);
      const height = 3.5 + ((i * 13) % 29) / 5;
      const x = p.x + p.dz * side * offset;
      const z = p.z - p.dx * side * offset;
      o.position.set(x, height * 0.53, z);
      o.scale.set(height * 0.48, height, height * 0.48);
      o.rotation.set(0, i, 0);
      o.updateMatrix();
      trees.current.setMatrixAt(i, o.matrix);
      trees.current.setColorAt(i, c.set(['#34554e', '#3e6658', '#4e705c'][i % 3]!));
      o.position.y = 0.8;
      o.scale.set(0.27, 1.7, 0.27);
      o.updateMatrix();
      trunks.current.setMatrixAt(i, o.matrix);
    }
    trees.current.instanceMatrix.needsUpdate = true;
    trunks.current.instanceMatrix.needsUpdate = true;
    if (trees.current.instanceColor) trees.current.instanceColor.needsUpdate = true;
    trees.current.computeBoundingSphere();
    trunks.current.computeBoundingSphere();
  }, []);
  return (
    <group>
      <instancedMesh ref={trees} args={[undefined, undefined, 110]} castShadow>
        <coneGeometry args={[0.5, 1, 6]} />
        <meshStandardMaterial flatShading roughness={1} />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, 110]}>
        <cylinderGeometry args={[0.5, 0.6, 1, 5]} />
        <meshStandardMaterial color="#665d4b" />
      </instancedMesh>
      {Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 285, 13 + (i % 4) * 6, Math.sin(angle) * 245]}
            rotation={[0, i, 0]}
            scale={[1.3, 1, 1]}
          >
            <coneGeometry args={[70 + (i % 3) * 15, 40 + (i % 4) * 20, 5]} />
            <meshStandardMaterial color={i % 2 ? '#75928a' : '#66857f'} flatShading />
          </mesh>
        );
      })}
      <group position={[-31, 0, 59]} rotation={[0, 0.08, 0]}>
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[17, 4, 8]} />
          <meshStandardMaterial color="#d2ccb3" />
        </mesh>
        <mesh position={[0, 4.25, 0]} castShadow>
          <boxGeometry args={[19, 0.45, 10]} />
          <meshStandardMaterial color="#34494b" />
        </mesh>
        {[-5.5, 0, 5.5].map((x) => (
          <mesh key={x} position={[x, 1.7, 4.03]}>
            <planeGeometry args={[4, 2.6]} />
            <meshStandardMaterial color="#466064" />
          </mesh>
        ))}
        <mesh position={[0, 4.55, 0]}>
          <boxGeometry args={[8, 0.12, 6]} />
          <meshStandardMaterial color="#d5e78f" />
        </mesh>
      </group>
    </group>
  );
}
