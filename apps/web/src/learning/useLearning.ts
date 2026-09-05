import { useEffect } from 'react';
import { nearestTrackIndex, TRACK_POINTS } from '@drivetalk/game-core';
import { input, telemetry, useGame } from '../state/game-store';
import { learning, PHRASES, stepLesson } from './lesson';
import { speakEnglish, stopSpeech } from './speech';

export function replayInstruction(): void {
  const phrase = PHRASES[learning.lesson.index];
  if (!phrase || !learning.active) return;
  learning.audioReady = false;
  learning.audioError = false;
  speakEnglish(
    phrase.en,
    () => {
      learning.audioReady = true;
    },
    () => {
      learning.audioError = true;
    },
  );
}
export function useLearning(): void {
  const phase = useGame((s) => s.phase);
  useEffect(() => {
    if (phase !== 'driving' || !learning.active) {
      stopSpeech();
      return;
    }
    let waitUntil = performance.now() + 500;
    let spoken = -1;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      if (now < waitUntil || learning.lesson.index >= PHRASES.length) return;
      if (spoken !== learning.lesson.index) {
        spoken = learning.lesson.index;
        replayInstruction();
        return;
      }
      if (!learning.audioReady || learning.audioError) return;
      const p = TRACK_POINTS[nearestTrackIndex(telemetry.x, telemetry.z)]!;
      const lane = (telemetry.x - p.x) * p.dz - (telemetry.z - p.z) * p.dx;
      if (
        stepLesson(
          learning.lesson,
          {
            speed: telemetry.speed,
            lane,
            brake: input.brake,
            throttle: input.throttle,
            onRoad: !telemetry.offTrack && telemetry.grounded,
          },
          dt,
        )
      ) {
        learning.audioReady = false;
        const result = learning.lesson.results.at(-1);
        speakEnglish(result?.success ? 'Well done!' : 'Keep going. We will practice later.');
        waitUntil = now + 3000;
      }
    }, 100);
    return () => {
      window.clearInterval(timer);
      stopSpeech();
    };
  }, [phase]);
}
