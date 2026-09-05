import { useEffect } from 'react';
import { clamp, deadzone } from '@drivetalk/game-core';
import { clearInput, input, useGame } from '../state/game-store';

const keys = new Set<string>();
export const touch = { throttle: 0, brake: 0, steer: 0, handbrake: false };
let tiltSteer = 0;
let pauseWasPressed = false;
let resetWasPressed = false;
const drivingKeys = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Space',
  'ShiftLeft',
  'ShiftRight',
]);

function releaseAll(): void {
  keys.clear();
  touch.throttle = 0;
  touch.brake = 0;
  touch.steer = 0;
  touch.handbrake = false;
  tiltSteer = 0;
  clearInput();
}

function sampleGamepadActions(): void {
  const pads = navigator.getGamepads?.();
  const pad = pads?.[0] ?? pads?.[1];
  const pause = pad?.buttons[9]?.pressed ?? false;
  const reset = pad?.buttons[3]?.pressed ?? false;
  const game = useGame.getState();
  if (pause && !pauseWasPressed) {
    if (game.phase === 'paused') game.resume();
    else game.pause();
  }
  if (reset && !resetWasPressed) game.reset();
  pauseWasPressed = pause;
  resetWasPressed = reset;
}

export function useControls(): void {
  useEffect(() => {
    const keydown = (event: KeyboardEvent): void => {
      const target = event.target;
      if (target instanceof HTMLElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName))
        return;
      const game = useGame.getState();
      if (event.code === 'Escape' && !event.repeat) {
        if (game.settingsOpen) game.setSettingsOpen(false);
        else if (game.phase === 'paused') game.resume();
        else game.pause();
      }
      if (game.phase !== 'driving') return;
      if (drivingKeys.has(event.code)) {
        event.preventDefault();
        keys.add(event.code);
      }
      if (event.code === 'KeyR' && !event.repeat) game.reset();
      if (event.code === 'KeyC' && !event.repeat)
        game.setPreferences({ camera: game.preferences.camera === 'chase' ? 'hood' : 'chase' });
    };
    const keyup = (event: KeyboardEvent): void => {
      keys.delete(event.code);
    };
    const blur = (): void => {
      releaseAll();
      useGame.getState().pause();
    };
    const visibility = (): void => {
      if (document.hidden) blur();
    };
    const orientation = (e: DeviceOrientationEvent): void => {
      const landscape = window.matchMedia('(orientation: landscape)').matches;
      tiltSteer = clamp((landscape ? (e.beta ?? 0) : (e.gamma ?? 0)) / 28, -1, 1);
    };
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('deviceorientation', orientation);
    const gamepadActions = window.setInterval(sampleGamepadActions, 100);
    const unsub = useGame.subscribe((s, old) => {
      if (s.phase !== old.phase) releaseAll();
    });
    return () => {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', blur);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('deviceorientation', orientation);
      unsub();
      window.clearInterval(gamepadActions);
      releaseAll();
    };
  }, []);
}

export function sampleInput(): void {
  input.throttle = keys.has('KeyW') || keys.has('ArrowUp') ? 1 : touch.throttle;
  input.brake = keys.has('KeyS') || keys.has('ArrowDown') ? 1 : touch.brake;
  input.steer =
    Number(keys.has('KeyD') || keys.has('ArrowRight')) -
    Number(keys.has('KeyA') || keys.has('ArrowLeft'));
  input.handbrake =
    keys.has('Space') || keys.has('ShiftLeft') || keys.has('ShiftRight') || touch.handbrake;
  if (touch.steer) {
    input.steer = touch.steer;
    input.source = 'touch';
  }
  if (useGame.getState().preferences.tilt) input.steer = tiltSteer;
  const pads = navigator.getGamepads?.();
  const pad = pads?.[0] ?? pads?.[1];
  if (!pad?.connected) return;
  const steering = deadzone(pad.axes[0] ?? 0);
  const throttle = pad.buttons[7]?.value ?? 0;
  const brake = pad.buttons[6]?.value ?? 0;
  if (Math.abs(steering) > 0.01 || throttle || brake) {
    input.steer = steering;
    input.throttle = throttle;
    input.brake = brake;
    input.source = 'gamepad';
  }
  input.handbrake ||= pad.buttons[0]?.pressed ?? false;
}

export async function requestTilt(): Promise<boolean> {
  if (!('DeviceOrientationEvent' in window)) return false;
  const sensor = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<string>;
  };
  try {
    return sensor.requestPermission ? (await sensor.requestPermission()) === 'granted' : true;
  } catch {
    return false;
  }
}
