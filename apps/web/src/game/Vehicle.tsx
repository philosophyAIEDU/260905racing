import { useEffect, useMemo, useRef } from 'react';
import {
  CuboidCollider,
  RigidBody,
  useAfterPhysicsStep,
  useBeforePhysicsStep,
  useRapier,
  type RapierRigidBody,
} from '@react-three/rapier';
import type { DynamicRayCastVehicleController } from '@dimforge/rapier3d-compat';
import { Group, Quaternion, Vector3 } from 'three';
import {
  advanceRace,
  FIXED_STEP,
  nearestTrackIndex,
  resetRacePosition,
  ROAD_WIDTH,
  TRACK_POINTS,
  trackPoint,
} from '@drivetalk/game-core';
import { vehicleSchema } from '@drivetalk/schema';
import configJson from '../../../../config/vehicles/sprint.json';
import { input, telemetry, useGame } from '../state/game-store';
import { sampleInput } from '../input/controls';
import { CarModel } from './CarModel';
import {
  createVehicleController,
  driveVehicle,
  tuneSuspension,
  type DriveState,
} from './vehicle-controller';
import { FollowCamera } from './FollowCamera';

export const vehicleConfig = vehicleSchema.parse(configJson);
const start = trackPoint(0);

export function Vehicle(): React.JSX.Element {
  const body = useRef<RapierRigidBody>(null);
  const visual = useRef<Group>(null);
  const controller = useRef<DynamicRayCastVehicleController | null>(null);
  const { world } = useRapier();
  const color = useGame((s) => s.preferences.color);
  const data = useMemo(
    () => ({
      state: {
        forward: 0,
        sideways: 0,
        steer: 0,
        slip: 0,
        offTrack: false,
        grounded: false,
      } as DriveState,
      force: new Vector3(),
      torque: new Vector3(),
      quaternion: new Quaternion(),
      position: new Vector3(),
      zero: new Vector3(),
      up: new Vector3(),
      tick: 0,
      resetId: telemetry.resetId,
      configRevision: '',
    }),
    [],
  );

  useEffect(() => {
    if (!body.current) return;
    const car = createVehicleController(world, body.current, vehicleConfig);
    controller.current = car;
    return () => {
      controller.current = null;
      world.removeVehicleController(car);
    };
  }, [world]);

  useBeforePhysicsStep(() => {
    const chassis = body.current;
    const car = controller.current;
    if (!chassis || !car) return;
    const { phase, preferences } = useGame.getState();
    if (phase !== 'driving') return;
    sampleInput();
    const p = chassis.translation();
    const q = chassis.rotation();
    const v = chassis.linvel();
    data.quaternion.set(q.x, q.y, q.z, q.w);
    const fx = 2 * (q.x * q.z + q.y * q.w);
    const fz = 1 - 2 * (q.x * q.x + q.y * q.y);
    data.state.forward = v.x * fx + v.z * fz;
    data.state.sideways = v.x * fz - v.z * fx;
    if (++data.tick % 6 === 0) {
      const nearest = TRACK_POINTS[nearestTrackIndex(p.x, p.z)]!;
      data.state.offTrack = Math.hypot(p.x - nearest.x, p.z - nearest.z) > ROAD_WIDTH / 2 + 0.5;
    }
    if (
      telemetry.resetId !== data.resetId ||
      p.y < -5 ||
      Math.abs(p.x) > 400 ||
      Math.abs(p.z) > 400
    ) {
      const reset = resetRacePosition(telemetry.race);
      data.position.set(reset.x, 0.95, reset.z);
      data.quaternion.setFromAxisAngle(data.up.set(0, 1, 0), reset.yaw);
      chassis.setTranslation(data.position, true);
      chassis.setRotation(data.quaternion, true);
      chassis.setLinvel(data.zero, true);
      chassis.setAngvel(data.zero, true);
      data.resetId = telemetry.resetId;
      data.state.steer = 0;
      return;
    }
    tuneSuspension(car, vehicleConfig);
    driveVehicle(car, vehicleConfig, input, data.state, preferences.assists);
    chassis.resetForces(false);
    data.force.set(
      -v.x * vehicleConfig.mass * vehicleConfig.drag,
      -Math.min(4000, v.x * v.x + v.z * v.z) * vehicleConfig.downforce,
      -v.z * vehicleConfig.mass * vehicleConfig.drag,
    );
    if (data.state.offTrack) {
      data.force.x *= 5;
      data.force.z *= 5;
    }
    chassis.addForce(data.force, true);
    telemetry.speed = Math.hypot(v.x, v.z) * 3.6;
    telemetry.gear =
      data.state.forward < -0.8
        ? 'R'
        : telemetry.speed < 1
          ? 'N'
          : String(Math.min(5, Math.floor(telemetry.speed / 35) + 1));
    telemetry.rpm = 900 + (telemetry.speed % 35) * 140;
    telemetry.steer = data.state.steer;
    telemetry.slip = data.state.slip;
    telemetry.grounded = data.state.grounded;
    telemetry.offTrack = data.state.offTrack;
    telemetry.drifting =
      data.state.grounded && telemetry.speed > 22 && Math.abs(data.state.slip) > 0.13;
    if (telemetry.drifting)
      telemetry.driftPoints += Math.abs(data.state.slip) * telemetry.speed * FIXED_STEP;
  });

  useAfterPhysicsStep(() => {
    if (!body.current || useGame.getState().phase !== 'driving') return;
    const p = body.current.translation();
    telemetry.x = p.x;
    telemetry.z = p.z;
    const q = body.current.rotation();
    telemetry.yaw = Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.x * q.x));
    advanceRace(telemetry.race, p.x, p.z, FIXED_STEP);
    if (telemetry.race.complete) telemetry.finishRequested = true;
  });

  return (
    <>
      <RigidBody
        ref={body}
        position={[start.x, 0.83, start.z]}
        rotation={[0, start.yaw, 0]}
        colliders={false}
        canSleep={false}
        linearDamping={0.08}
        angularDamping={2.8}
        ccd
      >
        <CuboidCollider
          args={[0.88, 0.23, 1.8]}
          position={[0, 0.14, 0]}
          massProperties={{
            mass: vehicleConfig.mass,
            centerOfMass: { x: 0, y: vehicleConfig.centerOfMassY, z: 0 },
            principalAngularInertia: {
              x: vehicleConfig.inertiaPitch,
              y: vehicleConfig.inertiaYaw,
              z: vehicleConfig.inertiaRoll,
            },
            angularInertiaLocalFrame: { x: 0, y: 0, z: 0, w: 1 },
          }}
          friction={0.2}
          restitution={0.04}
        />
        <group ref={visual}>
          <CarModel color={color} controller={controller} />
        </group>
      </RigidBody>
      <FollowCamera target={visual} />
    </>
  );
}
