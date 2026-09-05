import { beforeAll, describe, expect, it } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { vehicleSchema } from '@drivetalk/schema';
import {
  createVehicleController,
  driveVehicle,
  type DriveState,
} from '../../apps/web/src/game/vehicle-controller';
import json from '../../config/vehicles/sprint.json';
const config = vehicleSchema.parse(json);
beforeAll(async () => {
  await RAPIER.init();
});

function setup(): {
  world: RAPIER.World;
  body: RAPIER.RigidBody;
  controller: RAPIER.DynamicRayCastVehicleController;
  state: DriveState;
} {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  world.timestep = 1 / 60;
  world.createCollider(RAPIER.ColliderDesc.cuboid(500, 0.5, 500).setTranslation(0, -0.5, 0));
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(0, 0.85, 0)
      .setAngularDamping(2.8)
      .setCanSleep(false),
  );
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(0.88, 0.23, 1.8)
      .setTranslation(0, 0.14, 0)
      .setMassProperties(
        config.mass,
        { x: 0, y: config.centerOfMassY, z: 0 },
        { x: config.inertiaPitch, y: config.inertiaYaw, z: config.inertiaRoll },
        { x: 0, y: 0, z: 0, w: 1 },
      ),
    body,
  );
  const controller = createVehicleController(world, body, config);
  const state: DriveState = {
    forward: 0,
    sideways: 0,
    steer: 0,
    slip: 0,
    offTrack: false,
    grounded: false,
  };
  return { world, body, controller, state };
}
function tick(
  car: ReturnType<typeof setup>,
  throttle: number,
  brake = 0,
  steer = 0,
  handbrake = false,
): void {
  const v = car.body.linvel();
  const q = car.body.rotation();
  const fx = 2 * (q.x * q.z + q.y * q.w);
  const fz = 1 - 2 * (q.x * q.x + q.y * q.y);
  car.state.forward = v.x * fx + v.z * fz;
  car.state.sideways = v.x * fz - v.z * fx;
  driveVehicle(car.controller, config, { throttle, brake, steer, handbrake }, car.state, true);
  car.world.step();
}
describe('real Rapier raycast vehicle', () => {
  it('settles on four independent suspension rays and accelerates forwards', () => {
    const car = setup();
    for (let i = 0; i < 120; i++) tick(car, 0);
    expect(car.controller.numWheels()).toBe(4);
    expect(car.state.grounded).toBe(true);
    expect(car.body.translation().y).toBeGreaterThan(0.35);
    for (let i = 0; i < 180; i++) tick(car, 1);
    expect(car.body.translation().z).toBeGreaterThan(10);
    expect(car.state.forward).toBeGreaterThan(8);
    car.world.free();
  });
  it('brakes, reverses, and turns in the requested direction', () => {
    const car = setup();
    for (let i = 0; i < 240; i++) tick(car, 1);
    const fast = car.state.forward;
    for (let i = 0; i < 90; i++) tick(car, 0, 1);
    expect(Math.abs(car.state.forward)).toBeLessThan(fast);
    for (let i = 0; i < 180; i++) tick(car, 0, 1);
    expect(car.state.forward).toBeLessThan(-1);
    car.world.free();
    const turn = setup();
    for (let i = 0; i < 130; i++) tick(turn, 1);
    for (let i = 0; i < 90; i++) tick(turn, 0.35, 0, 1);
    expect(turn.body.translation().x).toBeGreaterThan(1);
    expect(turn.body.translation().y).toBeGreaterThan(0.25);
    turn.world.free();
  });
  it('releases rear lateral grip for a handbrake drift', () => {
    const car = setup();
    for (let i = 0; i < 180; i++) tick(car, 1);
    for (let i = 0; i < 60; i++) tick(car, 0.7, 0, 1, true);
    expect(car.controller.wheelSideFrictionStiffness(2)).toBeCloseTo(config.driftGrip);
    expect(Number.isFinite(car.state.slip)).toBe(true);
    car.world.free();
  });
});
