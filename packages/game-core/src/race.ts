import { CHECKPOINT_COUNT, crossedGate, trackPoint } from './track';

export interface RaceState {
  elapsed: number;
  lapStartedAt: number;
  laps: number[];
  nextGate: number;
  lap: number;
  totalLaps: number;
  complete: boolean;
  penalty: number;
  respawns: number;
  previousX: number;
  previousZ: number;
  gateFlashUntil: number;
}

export function createRace(totalLaps = 3): RaceState {
  const start = trackPoint(0);
  return {
    elapsed: 0,
    lapStartedAt: 0,
    laps: [],
    nextGate: 0,
    lap: 1,
    totalLaps,
    complete: false,
    penalty: 0,
    respawns: 0,
    previousX: start.x,
    previousZ: start.z,
    gateFlashUntil: 0,
  };
}

// Mutates one reusable state object; the fixed physics clock excludes pauses.
export function advanceRace(race: RaceState, x: number, z: number, dt: number): boolean {
  if (race.complete) return false;
  race.elapsed += dt;
  const crossed = crossedGate(race.previousX, race.previousZ, x, z, race.nextGate);
  race.previousX = x;
  race.previousZ = z;
  if (!crossed) return false;
  race.gateFlashUntil = race.elapsed + 1.4;
  race.nextGate++;
  if (race.nextGate < CHECKPOINT_COUNT) return true;
  race.nextGate = 0;
  race.laps.push(race.elapsed - race.lapStartedAt);
  race.lapStartedAt = race.elapsed;
  if (race.totalLaps > 0 && race.lap >= race.totalLaps) race.complete = true;
  else race.lap++;
  return true;
}

export function resetRacePosition(race: RaceState): { x: number; z: number; yaw: number } {
  const p = trackPoint(race.nextGate / CHECKPOINT_COUNT);
  race.elapsed += 3;
  race.penalty += 3;
  race.respawns++;
  race.previousX = p.x;
  race.previousZ = p.z;
  return p;
}
