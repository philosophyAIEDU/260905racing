import { create } from 'zustand';
import { createRace, trackPoint, type RaceState } from '@drivetalk/game-core';
import { preferencesSchema, recordSchema, type Preferences } from '@drivetalk/schema';

export type Phase = 'garage' | 'countdown' | 'driving' | 'paused' | 'finished';
function loadPreferences(): Preferences {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('drivetalk:preferences') ?? '{}');
    return preferencesSchema.parse(value);
  } catch {
    return preferencesSchema.parse({});
  }
}
function loadRecord(): { bestLap: number | null; runs: number } {
  try {
    return recordSchema.parse(JSON.parse(localStorage.getItem('drivetalk:record') ?? 'null'));
  } catch {
    return { bestLap: null, runs: 0 };
  }
}
const storedRecord = loadRecord();
const spawn = trackPoint(0);
export const telemetry = {
  speed: 0,
  rpm: 900,
  gear: 'N',
  steer: 0,
  slip: 0,
  x: spawn.x,
  z: spawn.z,
  yaw: spawn.yaw,
  driftPoints: 0,
  drifting: false,
  grounded: false,
  fps: 60,
  offTrack: false,
  race: createRace(),
  resetId: 0,
  countdown: 3,
  finishRequested: false,
};
export const input = {
  throttle: 0,
  brake: 0,
  steer: 0,
  handbrake: false,
  source: 'keyboard' as 'keyboard' | 'gamepad' | 'touch',
};
export function clearInput(): void {
  input.throttle = 0;
  input.brake = 0;
  input.steer = 0;
  input.handbrake = false;
}

interface GameStore {
  phase: Phase;
  settingsOpen: boolean;
  preferences: Preferences;
  session: number;
  bestLap: number | null;
  runs: number;
  storageWarning: boolean;
  guardBlocked: boolean;
  start: (practice: boolean) => void;
  pause: () => void;
  resume: () => void;
  garage: () => void;
  finish: () => void;
  reset: () => void;
  setPhase: (phase: Phase) => void;
  setSettingsOpen: (open: boolean) => void;
  setPreferences: (next: Partial<Preferences>) => void;
  setGuardBlocked: (blocked: boolean) => void;
}
export const useGame = create<GameStore>((set, get) => ({
  phase: 'garage',
  settingsOpen: false,
  preferences: loadPreferences(),
  session: 0,
  bestLap: storedRecord.bestLap,
  runs: storedRecord.runs,
  storageWarning: false,
  guardBlocked: false,
  start(practice) {
    clearInput();
    telemetry.race = createRace(practice ? 0 : 3);
    telemetry.speed = 0;
    telemetry.rpm = 900;
    telemetry.gear = 'N';
    telemetry.x = spawn.x;
    telemetry.z = spawn.z;
    telemetry.yaw = spawn.yaw;
    telemetry.drifting = false;
    telemetry.offTrack = false;
    telemetry.driftPoints = 0;
    telemetry.countdown = 3;
    telemetry.finishRequested = false;
    set({ phase: 'countdown', session: get().session + 1 });
  },
  pause() {
    if (get().phase === 'driving' || get().phase === 'countdown') {
      clearInput();
      set({ phase: 'paused' });
    }
  },
  resume() {
    if (!get().guardBlocked) {
      clearInput();
      set({ phase: telemetry.countdown > 0 ? 'countdown' : 'driving', settingsOpen: false });
    }
  },
  garage() {
    clearInput();
    set({ phase: 'garage', settingsOpen: false });
  },
  finish() {
    if (get().phase !== 'driving') return;
    clearInput();
    const laps = telemetry.race.laps;
    const best = Math.min(get().bestLap ?? Infinity, ...laps);
    const bestLap = Number.isFinite(best) ? best : null;
    const runs = get().runs + 1;
    let storageWarning = false;
    try {
      localStorage.setItem('drivetalk:record', JSON.stringify({ bestLap, runs }));
    } catch {
      storageWarning = true;
    }
    set({ phase: 'finished', bestLap, runs, storageWarning });
  },
  reset() {
    if (get().phase === 'driving') telemetry.resetId++;
  },
  setPhase(phase) {
    set({ phase });
  },
  setSettingsOpen(settingsOpen) {
    if (settingsOpen) get().pause();
    set({ settingsOpen });
  },
  setPreferences(next) {
    const preferences = preferencesSchema.parse({ ...get().preferences, ...next });
    let storageWarning = false;
    try {
      localStorage.setItem('drivetalk:preferences', JSON.stringify(preferences));
    } catch {
      storageWarning = true;
    }
    set({ preferences, storageWarning });
  },
  setGuardBlocked(guardBlocked) {
    if (guardBlocked) get().pause();
    set({ guardBlocked });
  },
}));

export function currentRace(): RaceState {
  return telemetry.race;
}
