import type { DynamicRayCastVehicleController, RigidBody, World } from '@dimforge/rapier3d-compat';
import type { VehicleConfig } from '@drivetalk/schema';
import {
  approach,
  enginePower,
  FIXED_STEP,
  lateralGrip,
  slipAngle,
  steeringLimit,
} from '@drivetalk/game-core';

export const WHEEL_CONNECTIONS = [
  { x: -0.94, y: 0, z: 1.25 },
  { x: 0.94, y: 0, z: 1.25 },
  { x: -0.94, y: 0, z: -1.25 },
  { x: 0.94, y: 0, z: -1.25 },
] as const;
const DOWN = { x: 0, y: -1, z: 0 };
const AXLE = { x: -1, y: 0, z: 0 };

export function createVehicleController(
  world: World,
  body: RigidBody,
  config: VehicleConfig,
): DynamicRayCastVehicleController {
  const car = world.createVehicleController(body);
  car.indexUpAxis = 1;
  car.setIndexForwardAxis = 2;
  for (const point of WHEEL_CONNECTIONS)
    car.addWheel(point, DOWN, AXLE, config.suspensionRest, config.wheelRadius);
  tuneSuspension(car, config);
  return car;
}

export function tuneSuspension(car: DynamicRayCastVehicleController, c: VehicleConfig): void {
  for (let i = 0; i < 4; i++) {
    car.setWheelSuspensionStiffness(i, c.suspensionStiffness);
    car.setWheelSuspensionCompression(i, c.suspensionCompression);
    car.setWheelSuspensionRelaxation(i, c.suspensionRelaxation);
    car.setWheelMaxSuspensionTravel(i, c.suspensionTravel);
    car.setWheelMaxSuspensionForce(i, c.maxSuspensionForce);
    car.setWheelFrictionSlip(i, c.frictionSlip);
  }
}

export interface DriveInput {
  throttle: number;
  brake: number;
  steer: number;
  handbrake: boolean;
}
export interface DriveState {
  forward: number;
  sideways: number;
  steer: number;
  slip: number;
  offTrack: boolean;
  grounded: boolean;
}

// Forces are newtons; Rapier braking uses impulse (N·s), integrated at 60 Hz.
export function driveVehicle(
  car: DynamicRayCastVehicleController,
  c: VehicleConfig,
  input: DriveInput,
  s: DriveState,
  assists: boolean,
): void {
  const reverse = input.brake > 0 && s.forward < 0.65 && input.throttle === 0;
  const throttle = reverse ? -input.brake * 0.48 : input.throttle;
  const power = enginePower(
    reverse ? -s.forward : s.forward,
    reverse ? c.reverseSpeed : c.maxSpeed,
  );
  const braking = reverse ? 0 : input.brake * c.brakeImpulse;
  s.steer = approach(
    s.steer,
    // The camera looks along +Z: screen-right is local -X (negative yaw).
    -input.steer * steeringLimit(s.forward, c.maxSteer, assists),
    c.steerSpeed * FIXED_STEP,
  );
  s.slip = slipAngle(s.forward, s.sideways);
  const grip = lateralGrip(s.slip, false, c.lateralStiffness, c.driftGrip) * (s.offTrack ? 0.7 : 1);
  const traction = assists ? 1 / (1 + Math.abs(s.slip) * 0.5) : 1;
  for (let i = 0; i < 4; i++) {
    car.setWheelSteering(i, i < 2 ? s.steer : 0);
    car.setWheelEngineForce(i, (throttle * c.engineForce * power * traction) / 4);
    car.setWheelBrake(i, braking + (input.handbrake && i > 1 ? c.brakeImpulse * 0.65 : 0));
    car.setWheelSideFrictionStiffness(i, input.handbrake && i > 1 ? c.driftGrip : grip);
    car.setWheelFrictionSlip(i, c.frictionSlip * (s.offTrack ? 0.55 : 1));
  }
  car.updateVehicle(FIXED_STEP);
  s.grounded =
    car.wheelIsInContact(0) ||
    car.wheelIsInContact(1) ||
    car.wheelIsInContact(2) ||
    car.wheelIsInContact(3);
}
