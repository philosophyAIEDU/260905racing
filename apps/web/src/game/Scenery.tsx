import { useLayoutEffect, useRef } from 'react';
import { Color, InstancedMesh, Object3D } from 'three';
import { Terrain, terrainHeight } from './Terrain';
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
      const ground = terrainHeight(x, z);
      o.position.set(x, ground + height * 0.53, z);
      o.scale.set(height * 0.48, height, height * 0.48);
      o.rotation.set(0, i, 0);
      o.updateMatrix();
      for (let tier = 0; tier < 3; tier++) {
        o.position.y = ground + height * (0.38 + tier * 0.22);
        o.scale.set(height * (0.65 - tier * 0.14), height * 0.55, height * (0.65 - tier * 0.14));
        o.updateMatrix();
        trees.current.setMatrixAt(i * 3 + tier, o.matrix);
        trees.current.setColorAt(i * 3 + tier, c.set(['#365736', '#456b3a', '#547943'][i % 3]!));
      }
      o.position.y = ground + 0.8;
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
      <Terrain />
      <instancedMesh ref={trees} args={[undefined, undefined, 330]} castShadow>
        <coneGeometry args={[0.5, 1, 9]} />
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
            position={[Math.cos(angle) * 285, 12, Math.sin(angle) * 245]}
            rotation={[0, i, 0]}
            scale={[1.3, 0.8 + (i % 4) * 0.25, 1]}
          >
            <icosahedronGeometry args={[55 + (i % 3) * 15, 2]} />
            <meshStandardMaterial color={i % 2 ? '#889080' : '#9b9b86'} flatShading />
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
