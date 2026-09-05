import { useLayoutEffect, useMemo, useRef } from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { BufferAttribute, BufferGeometry, Color, InstancedMesh, Object3D } from 'three';
import { GATES, ROAD_WIDTH, TRACK_POINTS, TRACK_SEGMENTS, trackPoint } from '@drivetalk/game-core';

function ribbon(width: number): BufferGeometry {
  const positions = new Float32Array((TRACK_SEGMENTS + 1) * 6);
  const indices: number[] = [];
  for (let i = 0; i <= TRACK_SEGMENTS; i++) {
    const p = trackPoint(i / TRACK_SEGMENTS);
    positions.set(
      [
        p.x - (p.dz * width) / 2,
        0,
        p.z + (p.dx * width) / 2,
        p.x + (p.dz * width) / 2,
        0,
        p.z - (p.dx * width) / 2,
      ],
      i * 6,
    );
    if (i < TRACK_SEGMENTS) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const barriers = Array.from({ length: 128 }, (_, i) => {
  const a = trackPoint(i / 128);
  const b = trackPoint((i + 1) / 128);
  const p = trackPoint((i + 0.5) / 128);
  return { ...p, length: Math.hypot(b.x - a.x, b.z - a.z) + 0.1 };
});

function Barriers(): React.JSX.Element {
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const object = new Object3D();
    const color = new Color();
    barriers.forEach((p, i) => {
      [-1, 1].forEach((side, k) => {
        object.position.set(p.x + p.dz * side * 9.7, 0.65, p.z - p.dx * side * 9.7);
        object.rotation.set(0, p.yaw, 0);
        object.scale.set(0.35, 1.15, p.length);
        object.updateMatrix();
        mesh.current!.setMatrixAt(i * 2 + k, object.matrix);
        mesh.current!.setColorAt(i * 2 + k, color.set(i % 12 < 3 ? '#dceba7' : '#667778'));
      });
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, []);
  return (
    <>
      <instancedMesh ref={mesh} args={[undefined, undefined, 256]} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <RigidBody type="fixed" colliders={false}>
        {barriers.flatMap((p, i) =>
          [-1, 1].map((side) => (
            <CuboidCollider
              key={`${i}-${side}`}
              position={[p.x + p.dz * side * 9.7, 0.65, p.z - p.dx * side * 9.7]}
              rotation={[0, p.yaw, 0]}
              args={[0.18, 0.58, p.length / 2]}
              friction={0.12}
              restitution={0.08}
            />
          )),
        )}
      </RigidBody>
    </>
  );
}

function Markings(): React.JSX.Element {
  const curb = useRef<InstancedMesh>(null);
  const dashes = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!curb.current || !dashes.current) return;
    const object = new Object3D();
    const color = new Color();
    TRACK_POINTS.forEach((p, i) => {
      const next = TRACK_POINTS[(i + 1) % TRACK_SEGMENTS]!;
      const length = Math.hypot(next.x - p.x, next.z - p.z);
      [-1, 1].forEach((side, k) => {
        object.position.set(p.x + p.dz * side * 7.8, 0.036, p.z - p.dx * side * 7.8);
        object.rotation.set(0, p.yaw, 0);
        object.scale.set(0.85, 0.035, length * 1.1);
        object.updateMatrix();
        curb.current!.setMatrixAt(i * 2 + k, object.matrix);
        curb.current!.setColorAt(i * 2 + k, color.set(i % 4 < 2 ? '#eee9d6' : '#d47050'));
      });
      if (i % 4 === 0) {
        object.position.set(p.x, 0.045, p.z);
        object.rotation.set(0, p.yaw, 0);
        object.scale.set(0.12, 0.012, 2.6);
        object.updateMatrix();
        dashes.current!.setMatrixAt(i / 4, object.matrix);
      }
    });
    curb.current.instanceMatrix.needsUpdate = true;
    dashes.current.instanceMatrix.needsUpdate = true;
    if (curb.current.instanceColor) curb.current.instanceColor.needsUpdate = true;
    curb.current.computeBoundingSphere();
    dashes.current.computeBoundingSphere();
  }, []);
  return (
    <>
      <instancedMesh ref={curb} args={[undefined, undefined, TRACK_SEGMENTS * 2]} receiveShadow>
        <boxGeometry />
        <meshStandardMaterial roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={dashes} args={[undefined, undefined, TRACK_SEGMENTS / 4]}>
        <boxGeometry />
        <meshStandardMaterial color="#dedfce" roughness={1} />
      </instancedMesh>
    </>
  );
}

function CheckpointArches(): React.JSX.Element {
  const finish = trackPoint(0);
  return (
    <>
      {GATES.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} rotation={[0, p.yaw, 0]}>
          {[-8.6, 8.6].map((x) => (
            <group key={x}>
              <mesh position={[x, 3, 0]} castShadow>
                <boxGeometry args={[0.3, 6, 0.4]} />
                <meshStandardMaterial color="#25373a" />
              </mesh>
              <mesh position={[x, 4.1, -0.24]}>
                <boxGeometry args={[0.34, 2, 0.04]} />
                <meshBasicMaterial color={i === 7 ? '#f5f1dc' : '#dffa72'} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 5.9, 0]} castShadow>
            <boxGeometry args={[17.5, 0.55, 0.45]} />
            <meshStandardMaterial color={i === 7 ? '#dceba7' : '#334547'} />
          </mesh>
          {Array.from({ length: i + 1 }, (_, n) => (
            <mesh key={n} position={[(n - i / 2) * 0.32, 5.9, -0.24]}>
              <boxGeometry args={[0.14, 0.25, 0.03]} />
              <meshBasicMaterial color="#edf3d8" />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[finish.x, 0.055, finish.z]} rotation={[0, finish.yaw, 0]}>
        {Array.from({ length: 30 }, (_, i) => (
          <mesh
            key={i}
            position={[(i % 15) - 7, 0, Math.floor(i / 15) - 0.5]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial color={(i + Math.floor(i / 15)) % 2 ? '#eceadb' : '#242f30'} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export function Track(): React.JSX.Element {
  const road = useMemo(() => ribbon(ROAD_WIDTH), []);
  const shoulder = useMemo(() => ribbon(18.7), []);
  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[500, 0.5, 500]} position={[0, -0.51, 0]} friction={1} />
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#819b84" roughness={1} />
      </mesh>
      <mesh geometry={shoulder} position={[0, 0.005, 0]} receiveShadow>
        <meshStandardMaterial color="#baa990" roughness={1} />
      </mesh>
      <mesh geometry={road} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial color="#38474a" roughness={0.95} />
      </mesh>
      <Markings />
      <Barriers />
      <CheckpointArches />
    </group>
  );
}
