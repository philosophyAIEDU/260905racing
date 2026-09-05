import { forwardRef, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import type { Group } from 'three';
import { coachwork } from './car-geometry';

type Triple = [number, number, number];
function Trim({
  position,
  scale,
  color = '#11171d',
  glow = false,
}: {
  position: Triple;
  scale: Triple;
  color?: string;
  glow?: boolean;
}): React.JSX.Element {
  return (
    <RoundedBox
      position={position}
      args={scale}
      radius={Math.min(...scale) * 0.3}
      smoothness={2}
      castShadow
    >
      <meshStandardMaterial
        color={color}
        metalness={0.65}
        roughness={0.26}
        emissive={glow ? color : '#000000'}
        emissiveIntensity={glow ? 2 : 0}
      />
    </RoundedBox>
  );
}

export function CarModel({ color }: { color: string }): React.JSX.Element {
  const body = useMemo(
    () =>
      coachwork([
        [-1.96, 0.75, -0.12, 0.22],
        [-1.77, 0.96, -0.14, 0.4],
        [-1.25, 0.97, -0.14, 0.44],
        [-0.5, 0.88, -0.13, 0.38],
        [0.45, 0.87, -0.13, 0.34],
        [1.25, 0.96, -0.13, 0.34],
        [1.76, 0.9, -0.1, 0.27],
        [1.98, 0.72, -0.04, 0.16],
      ]),
    [],
  );
  const glass = useMemo(
    () =>
      coachwork([
        [-1.18, 0.74, 0.32, 0.36],
        [-0.59, 0.64, 0.35, 0.88],
        [0.08, 0.62, 0.35, 0.88],
        [0.84, 0.72, 0.31, 0.35],
      ]),
    [],
  );
  return (
    <group>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={color}
          metalness={0.72}
          roughness={0.24}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </mesh>
      <mesh geometry={glass} castShadow>
        <meshPhysicalMaterial color="#152534" metalness={0.45} roughness={0.12} clearcoat={1} />
      </mesh>
      <Trim position={[0, 0.891, -0.25]} scale={[1.15, 0.055, 0.66]} color={color} />
      <Trim position={[0, -0.135, 1.52]} scale={[1.91, 0.075, 0.65]} />
      <Trim position={[0, -0.135, -1.66]} scale={[1.96, 0.08, 0.5]} />
      <Trim position={[0, 0.055, 1.95]} scale={[1.12, 0.16, 0.07]} />
      <Trim position={[0, 0.055, -1.945]} scale={[1.28, 0.17, 0.055]} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Trim position={[side * 0.22, 0.351, 1.04]} scale={[0.22, 0.012, 0.62]} color="#f1f2ec" />
          <Trim
            position={[side * 0.22, 0.925, -0.25]}
            scale={[0.22, 0.009, 0.59]}
            color="#f1f2ec"
          />
          <Trim position={[side * 0.22, 0.431, -1.42]} scale={[0.22, 0.012, 0.3]} color="#f1f2ec" />
          <Trim position={[side * 0.92, -0.095, 0]} scale={[0.09, 0.12, 1.82]} />
          <Trim position={[side * 0.77, 0.29, -0.1]} scale={[0.025, 0.035, 0.17]} />
          <Trim position={[side * 0.96, 0.48, 0.53]} scale={[0.26, 0.12, 0.25]} color={color} />
          <Trim position={[side * 0.64, 0.233, 1.81]} scale={[0.42, 0.095, 0.12]} />
          <Trim
            position={[side * 0.64, 0.25, 1.88]}
            scale={[0.34, 0.024, 0.016]}
            color="#dbf5ff"
            glow
          />
          <Trim
            position={[side * 0.64, 0.208, 1.88]}
            scale={[0.3, 0.017, 0.016]}
            color="#dbf5ff"
            glow
          />
          <Trim
            position={[side * 0.61, 0.245, -1.86]}
            scale={[0.49, 0.046, 0.06]}
            color="#ff182c"
            glow
          />
          <Trim position={[side * 0.62, 0.49, -1.6]} scale={[0.06, 0.35, 0.12]} />
          <mesh position={[side * 0.65, -0.045, -1.97]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.12, 16, 1, true]} />
            <meshStandardMaterial color="#9ba6ad" metalness={1} roughness={0.23} side={2} />
          </mesh>
        </group>
      ))}
      <Trim position={[0, 0.66, -1.64]} scale={[2.04, 0.065, 0.33]} />
      {[-0.48, -0.24, 0, 0.24, 0.48].map((x) => (
        <Trim key={x} position={[x, -0.11, -1.93]} scale={[0.025, 0.15, 0.24]} />
      ))}
    </group>
  );
}

export const Wheel = forwardRef<Group, { x: number; z: number }>(function Wheel({ x, z }, ref) {
  return (
    <group ref={ref} position={[x, -0.4, z]}>
      <group>
        <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[0.277, 0.083, 10, 32]} />
          <meshStandardMaterial color="#141619" roughness={0.93} />
        </mesh>
        {[-0.115, 0.115].map((side) => (
          <group key={side} position={[side, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <mesh>
              <torusGeometry args={[0.243, 0.018, 6, 32]} />
              <meshStandardMaterial color="#c7cdd2" metalness={0.9} roughness={0.23} />
            </mesh>
            <mesh>
              <circleGeometry args={[0.22, 24]} />
              <meshStandardMaterial color="#394148" metalness={0.85} roughness={0.4} side={2} />
            </mesh>
            {Array.from({ length: 5 }, (_, i) => (
              <mesh
                key={i}
                rotation={[0, 0, (i * Math.PI * 2) / 5]}
                position={[0, 0, side > 0 ? 0.015 : -0.015]}
              >
                <boxGeometry args={[0.035, 0.46, 0.018]} />
                <meshStandardMaterial color="#d4dade" metalness={0.95} roughness={0.19} />
              </mesh>
            ))}
            <mesh>
              <sphereGeometry args={[0.047, 10, 8]} />
              <meshStandardMaterial color="#15191d" metalness={0.6} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
});
