import { describe, expect, it } from 'vitest';
import {
  advanceRace,
  approach,
  clamp,
  createRace,
  crossedGate,
  deadzone,
  enginePower,
  formatTime,
  GATES,
  lateralGrip,
  nearestTrackIndex,
  resetRacePosition,
  slipAngle,
  steeringLimit,
  TRACK_LENGTH,
  trackPoint,
} from '@drivetalk/game-core';
import { preferencesSchema, recordSchema, vehicleSchema } from '@drivetalk/schema';
import car from '../../config/vehicles/sprint.json';

describe('arcade handling', () => {
  it('smooths inputs without overshooting, and removes controller stick noise', () => {
    expect(approach(0, 1, 0.1)).toBeCloseTo(0.1);
    expect(approach(0.9, 1, 0.5)).toBe(1);
    expect(clamp(-4, -1, 1)).toBe(-1);
    expect(deadzone(0.08)).toBe(0);
    expect(deadzone(1)).toBe(1);
    expect(deadzone(-1)).toBe(-1);
  });
  it('reduces steering at speed with a stronger novice assist', () => {
    expect(steeringLimit(35, 0.5, true)).toBeLessThan(steeringLimit(10, 0.5, true));
    expect(steeringLimit(35, 0.5, false)).toBeGreaterThan(steeringLimit(35, 0.5, true));
  });
  it('progressively sheds grip, and caps propulsion at the speed limit', () => {
    expect(lateralGrip(0.7, false, 1.3, 0.4)).toBeLessThan(lateralGrip(0, false, 1.3, 0.4));
    expect(lateralGrip(0, true, 1.3, 0.4)).toBe(0.4);
    expect(enginePower(47, 47)).toBe(0);
    expect(enginePower(-3, 47)).toBe(1);
    expect(slipAngle(0, 0)).toBe(0);
    expect(slipAngle(10, 3)).toBeGreaterThan(0);
  });
  it('formats time without a 60-second rounding overflow', () => {
    expect(formatTime(0)).toBe('—:——.——');
    expect(formatTime(Infinity)).toBe('—:——.——');
    expect(formatTime(59.999)).toBe('0:59.99');
    expect(formatTime(61.23)).toBe('1:01.23');
  });
});

describe('circuit checkpoints', () => {
  it('has a closed, continuous 600–800 metre circuit', () => {
    expect(TRACK_LENGTH).toBeGreaterThan(600);
    expect(TRACK_LENGTH).toBeLessThan(800);
    expect(trackPoint(1).x).toBeCloseTo(trackPoint(0).x);
    expect(trackPoint(1).z).toBeCloseTo(trackPoint(0).z);
    const p = trackPoint(0.25);
    expect(nearestTrackIndex(p.x, p.z)).toBe(64);
  });
  it('counts only forward crossings within the road, including at high speed', () => {
    const p = GATES[0]!;
    expect(crossedGate(p.x - p.dx * 8, p.z - p.dz * 8, p.x + p.dx * 8, p.z + p.dz * 8, 0)).toBe(
      true,
    );
    expect(crossedGate(p.x + p.dx, p.z + p.dz, p.x - p.dx, p.z - p.dz, 0)).toBe(false);
    expect(
      crossedGate(
        p.x - p.dx + p.dz * 40,
        p.z - p.dz - p.dx * 40,
        p.x + p.dx + p.dz * 40,
        p.z + p.dz - p.dx * 40,
        0,
      ),
    ).toBe(false);
    expect(crossedGate(0, 0, 0, 0, 99)).toBe(false);
  });
  it('finishes three full laps with eight ordered checkpoints each', () => {
    const race = createRace(3);
    for (let i = 1; i <= 4096 * 3 + 2; i++) {
      const p = trackPoint(i / 4096);
      advanceRace(race, p.x, p.z, 1 / 60);
    }
    expect(race.complete).toBe(true);
    expect(race.laps).toHaveLength(3);
    const end = race.elapsed;
    expect(advanceRace(race, 0, 0, 1)).toBe(false);
    expect(race.elapsed).toBe(end);
  });
  it('does not award laps for reversing over the finish line or skipping gates', () => {
    const race = createRace();
    const p = trackPoint(0);
    advanceRace(race, p.x - p.dx * 2, p.z - p.dz * 2, 0.1);
    advanceRace(race, p.x + p.dx * 2, p.z + p.dz * 2, 0.1);
    expect(race.laps).toHaveLength(0);
    expect(race.nextGate).toBe(0);
  });
  it('resets at the last passed checkpoint, with a penalty and no free progress', () => {
    const race = createRace();
    race.nextGate = 4;
    const p = resetRacePosition(race);
    expect(p.x).toBeCloseTo(trackPoint(0.5).x);
    expect(race.nextGate).toBe(4);
    expect(race.penalty).toBe(3);
    expect(race.respawns).toBe(1);
    expect(race.previousX).toBe(p.x);
  });
  it('allows indefinite practice laps', () => {
    const race = createRace(0);
    for (let i = 1; i <= 8194; i++) {
      const p = trackPoint(i / 4096);
      advanceRace(race, p.x, p.z, 1 / 60);
    }
    expect(race.complete).toBe(false);
    expect(race.lap).toBe(3);
  });
});

describe('runtime boundaries', () => {
  it('validates vehicle configuration', () => {
    expect(vehicleSchema.safeParse(car).success).toBe(true);
    expect(vehicleSchema.safeParse({ ...car, mass: -1 }).success).toBe(false);
    expect(vehicleSchema.safeParse({ ...car, maxSteer: 2 }).success).toBe(false);
  });
  it('defaults preferences and rejects corrupt storage', () => {
    expect(preferencesSchema.parse({}).assists).toBe(true);
    expect(preferencesSchema.safeParse({ language: 'XX' }).success).toBe(false);
    expect(recordSchema.safeParse({ bestLap: -1, runs: 0 }).success).toBe(false);
    expect(recordSchema.safeParse({ bestLap: 62.7, runs: 3 }).success).toBe(true);
  });
});
