import { forwardRef } from 'react';
import type { Group } from 'three';

function Block({
  position,
  scale,
  color,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}): React.JSX.Element {
  return (
    <mesh position={position} scale={scale} castShadow>
      <boxGeometry />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.25} />
    </mesh>
  );
}

export function CarModel({ color }: { color: string }): React.JSX.Element {
  return (
    <group>
      <Block position={[0, 0.14, 0]} scale={[1.8, 0.43, 3.75]} color={color} />
      <Block position={[0, -0.08, 0]} scale={[1.78, 0.18, 3.8]} color="#1b252a" />
      <mesh position={[0, 0.53, -0.15]} rotation={[0.04, 0, 0]} castShadow>
        <boxGeometry args={[1.4, 0.56, 1.72]} />
        <meshStandardMaterial color="#1b343c" roughness={0.17} metalness={0.45} />
      </mesh>
      <Block position={[0, 0.84, -0.23]} scale={[1.44, 0.09, 1.32]} color={color} />
      <Block position={[0, 0.395, 1.18]} scale={[0.2, 0.016, 1.25]} color="#2b3635" />
      <Block position={[0, 0.38, -1.47]} scale={[0.2, 0.02, 0.67]} color="#2b3635" />
      <Block position={[0, 0.52, -1.65]} scale={[1.98, 0.1, 0.36]} color="#222c2d" />
      {[-0.68, 0.68].map((x) => (
        <group key={x}>
          <Block position={[x, 0.36, -1.66]} scale={[0.08, 0.26, 0.1]} color="#222c2d" />
          <mesh position={[x, 0.2, 1.89]}>
            <boxGeometry args={[0.36, 0.105, 0.025]} />
            <meshBasicMaterial color="#f3ffe1" />
          </mesh>
          <mesh position={[x, 0.17, -1.89]}>
            <boxGeometry args={[0.36, 0.1, 0.025]} />
            <meshBasicMaterial color="#ff5349" />
          </mesh>
          <Block
            position={[Math.sign(x) * 0.98, 0.53, 0.33]}
            scale={[0.25, 0.12, 0.25]}
            color={color}
          />
        </group>
      ))}
      <Block position={[0, 0.055, 1.91]} scale={[1.15, 0.12, 0.035]} color="#18282b" />
      <mesh position={[0, 0.2, -1.901]}>
        <planeGeometry args={[0.56, 0.17]} />
        <meshBasicMaterial color="#dbe5d6" side={2} />
      </mesh>
    </group>
  );
}

export const Wheel = forwardRef<Group, { x: number; z: number }>(function Wheel({ x, z }, ref) {
  return (
    <group ref={ref} position={[x, -0.4, z]}>
      <group>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.27, 16]} />
          <meshStandardMaterial color="#101819" roughness={0.92} />
        </mesh>
        {[-0.142, 0.142].map((side) => (
          <group key={side} position={[side, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.235, 0.235, 0.013, 12]} />
              <meshStandardMaterial color="#c5d0cf" metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.009, 0]}>
              <boxGeometry args={[0.055, 0.016, 0.43]} />
              <meshStandardMaterial color="#243035" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
});
