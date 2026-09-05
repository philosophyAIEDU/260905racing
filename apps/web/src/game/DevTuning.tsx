import { useEffect } from 'react';
import { Leva, useControls } from 'leva';
import { vehicleConfig } from './Vehicle';
export default function DevTuning(): React.JSX.Element {
  const values = useControls('Sprint / live tuning', {
    engineForce: { value: vehicleConfig.engineForce, min: 3000, max: 12000, step: 100 },
    maxSteer: { value: vehicleConfig.maxSteer, min: 0.2, max: 0.7, step: 0.01 },
    suspensionStiffness: { value: vehicleConfig.suspensionStiffness, min: 15, max: 65, step: 1 },
    suspensionCompression: {
      value: vehicleConfig.suspensionCompression,
      min: 1,
      max: 10,
      step: 0.1,
    },
    suspensionRelaxation: { value: vehicleConfig.suspensionRelaxation, min: 1, max: 12, step: 0.1 },
    lateralStiffness: { value: vehicleConfig.lateralStiffness, min: 0.4, max: 3, step: 0.05 },
    driftGrip: { value: vehicleConfig.driftGrip, min: 0.15, max: 1, step: 0.05 },
  });
  useEffect(() => {
    Object.assign(vehicleConfig, values);
  }, [values]);
  return <Leva collapsed />;
}
