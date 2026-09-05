import { useMemo, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { telemetry, useGame } from '../state/game-store';

export function FollowCamera({ target }: { target: RefObject<Group | null> }): null {
  const temp = useMemo(
    () => ({
      position: new Vector3(),
      rotation: new Quaternion(),
      forward: new Vector3(),
      right: new Vector3(),
      desired: new Vector3(),
      look: new Vector3(),
      smoothLook: new Vector3(),
      initialized: false,
      lastPhase: '',
      lastReset: -1,
    }),
    [],
  );
  useFrame(({ camera }, dt) => {
    if (!target.current || !(camera instanceof PerspectiveCamera)) return;
    const { phase, preferences } = useGame.getState();
    target.current.getWorldPosition(temp.position);
    target.current.getWorldQuaternion(temp.rotation);
    temp.forward.set(0, 0, 1).applyQuaternion(temp.rotation);
    temp.forward.y = 0;
    temp.forward.normalize();
    temp.right.set(temp.forward.z, 0, -temp.forward.x);
    const garage = phase === 'garage' || phase === 'finished';
    const hood = preferences.camera === 'hood' && !garage;
    temp.desired.copy(temp.position);
    if (garage) temp.desired.addScaledVector(temp.forward, 7.6).addScaledVector(temp.right, 8.7);
    else temp.desired.addScaledVector(temp.forward, hood ? 1.15 : -7.5 - telemetry.speed * 0.017);
    temp.desired.y += garage ? 4.2 : hood ? 1.1 : 3.7;
    temp.look
      .copy(temp.position)
      .addScaledVector(temp.forward, garage ? 0 : hood ? 25 : 5 + telemetry.speed * 0.025);
    if (garage) temp.look.addScaledVector(temp.right, -3.3);
    temp.look.y += garage ? 0.3 : 0.75;
    const changed =
      !temp.initialized ||
      (temp.lastPhase !== phase && (garage || temp.lastPhase === 'garage')) ||
      temp.lastReset !== telemetry.resetId;
    const alpha =
      hood || changed ? 1 : 1 - Math.exp(-Math.min(dt, 0.1) * (preferences.reducedMotion ? 12 : 6));
    camera.position.lerp(temp.desired, alpha);
    temp.smoothLook.lerp(temp.look, alpha);
    camera.lookAt(temp.smoothLook);
    const fov = garage
      ? 44
      : preferences.reducedMotion || hood
        ? 64
        : 61 + Math.min(13, telemetry.speed / 12);
    camera.fov += (fov - camera.fov) * (changed ? 1 : 0.05);
    camera.updateProjectionMatrix();
    temp.initialized = true;
    temp.lastPhase = phase;
    temp.lastReset = telemetry.resetId;
    telemetry.fps += (1 / Math.max(0.001, dt) - telemetry.fps) * 0.03;
  });
  return null;
}
