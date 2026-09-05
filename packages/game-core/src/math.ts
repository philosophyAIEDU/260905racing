export const FIXED_STEP = 1 / 60;
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export function approach(current: number, target: number, amount: number): number {
  return current + clamp(target - current, -amount, amount);
}

export function deadzone(value: number, threshold = 0.12): number {
  if (Math.abs(value) <= threshold) return 0;
  return (Math.sign(value) * (Math.abs(value) - threshold)) / (1 - threshold);
}

export function steeringLimit(speed: number, maxSteer: number, assisted: boolean): number {
  return maxSteer / (1 + Math.abs(speed) * (assisted ? 0.05 : 0.025));
}

// Local +Z is forward, +X is right. The slip angle is in radians.
export function slipAngle(forward: number, sideways: number): number {
  return Math.atan2(sideways, Math.max(3, Math.abs(forward)));
}

export function lateralGrip(angle: number, drifting: boolean, base: number, drift: number): number {
  const falloff = 1 / (1 + Math.max(0, Math.abs(angle) - 0.17) * 2.1);
  return (drifting ? drift : base) * falloff;
}

export function enginePower(speed: number, topSpeed: number): number {
  return clamp(1 - Math.pow(Math.max(0, speed) / topSpeed, 3), 0, 1);
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—:——.——';
  const centiseconds = Math.floor(seconds * 100);
  const minutes = Math.floor(centiseconds / 6000);
  return `${minutes}:${String(Math.floor(centiseconds / 100) % 60).padStart(2, '0')}.${String(centiseconds % 100).padStart(2, '0')}`;
}
