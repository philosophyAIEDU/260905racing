import { forwardRef, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group, Mesh, MeshStandardMaterial } from 'three';
import { prepareCar } from './real-car';

const URL = '/models/ferrari.glb';
const DECODER = '/models/draco/';
export function CarModel({ color }: { color: string }): React.JSX.Element {
  const { scene } = useGLTF(URL, DECODER);
  const body = useMemo(() => {
    const copy = prepareCar(scene).body.clone(true);
    copy.traverse((node) => {
      if (
        node instanceof Mesh &&
        node.name === 'body' &&
        node.material instanceof MeshStandardMaterial
      )
        node.material = node.material.clone();
    });
    return copy;
  }, [scene]);
  useEffect(() => {
    body.traverse((node) => {
      if (
        node instanceof Mesh &&
        node.name === 'body' &&
        node.material instanceof MeshStandardMaterial
      )
        node.material.color.set(color);
    });
  }, [body, color]);
  return <primitive object={body} dispose={null} />;
}
export const Wheel = forwardRef<Group, { x: number; z: number }>(function Wheel({ x, z }, ref) {
  const { scene } = useGLTF(URL, DECODER);
  const model = useMemo(
    () => prepareCar(scene).wheels[(z > 0 ? 0 : 2) + (x > 0 ? 1 : 0)]!.clone(true),
    [scene, x, z],
  );
  return (
    <group ref={ref} position={[x, -0.42, z]}>
      <group>
        <primitive object={model} dispose={null} />
      </group>
    </group>
  );
});
