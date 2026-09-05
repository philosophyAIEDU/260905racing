export interface TrackPoint {
  x: number;
  z: number;
  dx: number;
  dz: number;
  yaw: number;
}
export const ROAD_WIDTH = 15;
export const TRACK_SEGMENTS = 256;
export const CHECKPOINT_COUNT = 8;

// Metres in an XZ plane. Smooth harmonic bends create an easy continuous loop.
export function trackPoint(progress: number): TrackPoint {
  const t = progress * Math.PI * 2;
  const x = 115 * Math.sin(t) + 14 * Math.sin(3 * t);
  const z = 85 * Math.cos(t) + 9 * Math.sin(2 * t);
  const vx = 115 * Math.cos(t) + 42 * Math.cos(3 * t);
  const vz = -85 * Math.sin(t) + 18 * Math.cos(2 * t);
  const length = Math.hypot(vx, vz);
  return { x, z, dx: vx / length, dz: vz / length, yaw: Math.atan2(vx, vz) };
}

export const TRACK_POINTS = Array.from({ length: TRACK_SEGMENTS }, (_, i) =>
  trackPoint(i / TRACK_SEGMENTS),
);
export const GATES = Array.from({ length: CHECKPOINT_COUNT }, (_, i) =>
  trackPoint(((i + 1) % CHECKPOINT_COUNT) / CHECKPOINT_COUNT),
);
export const TRACK_LENGTH = TRACK_POINTS.reduce((distance, point, i) => {
  const next = TRACK_POINTS[(i + 1) % TRACK_SEGMENTS]!;
  return distance + Math.hypot(point.x - next.x, point.z - next.z);
}, 0);

export function nearestTrackIndex(x: number, z: number): number {
  let bestIndex = 0;
  let minDistance = Infinity;
  for (let i = 0; i < TRACK_POINTS.length; i++) {
    const p = TRACK_POINTS[i]!;
    const distance = (p.x - x) ** 2 + (p.z - z) ** 2;
    if (distance < minDistance) {
      bestIndex = i;
      minDistance = distance;
    }
  }
  return bestIndex;
}

export function crossedGate(
  previousX: number,
  previousZ: number,
  x: number,
  z: number,
  gateIndex: number,
): boolean {
  const gate = GATES[gateIndex];
  if (!gate) return false;
  const before = (previousX - gate.x) * gate.dx + (previousZ - gate.z) * gate.dz;
  const after = (x - gate.x) * gate.dx + (z - gate.z) * gate.dz;
  if (before >= 0 || after < 0 || after === before) return false;
  const alpha = -before / (after - before);
  const crossX = previousX + (x - previousX) * alpha - gate.x;
  const crossZ = previousZ + (z - previousZ) * alpha - gate.z;
  return Math.abs(crossX * gate.dz - crossZ * gate.dx) <= ROAD_WIDTH / 2 + 0.7;
}
