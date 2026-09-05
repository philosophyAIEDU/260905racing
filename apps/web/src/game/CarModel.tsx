import { useEffect, useMemo, type RefObject } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { DynamicRayCastVehicleController } from '@dimforge/rapier3d-compat';
import { prepareCar } from './real-car';
export function CarModel({
  color,
  controller,
}: {
  color: string;
  controller: RefObject<DynamicRayCastVehicleController | null>;
}): React.JSX.Element {
  const { scene } = useGLTF('/models/ferrari.glb', '/models/draco/');
  const car = useMemo(() => prepareCar(scene), [scene]);
  useEffect(() => {
    car.paint.color.set(color);
  }, [car, color]);
  useFrame(() => {
    const physical = controller.current;
    if (!physical) return;
    for (let i = 0; i < 4; i++) {
      const wheel = car.wheels[i]!;
      wheel.position.y =
        car.wheelY[i]! + (0.42 - (physical.wheelSuspensionLength(i) ?? 0.42)) / car.scale;
      wheel.rotation.order = 'YXZ';
      wheel.rotation.x = -Math.PI / 2 - (physical.wheelRotation(i) ?? 0);
      wheel.rotation.y = physical.wheelSteering(i) ?? 0;
    }
  });
  return <primitive object={car.model} dispose={null} />;
}
