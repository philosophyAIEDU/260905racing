import { describe, expect, it } from 'vitest';
import { createLesson, stepLesson, type LessonSample } from '../../apps/web/src/learning/lesson';
const sample: LessonSample = { speed: 35, lane: 2, brake: 0, throttle: 1, onRoad: true };
describe('listening missions are judged by actual driving', () => {
  it('requires a sustained correct action and keeps driving after a missed instruction', () => {
    const s = createLesson();
    for (let i = 0; i < 5; i++) stepLesson(s, sample, 0.1);
    expect(s.index).toBe(0);
    for (let i = 0; i < 6; i++) stepLesson(s, sample, 0.1);
    expect(s.results[0]).toEqual({ id: 'accelerate', success: true });
    for (let i = 0; i < 251; i++) stepLesson(s, { ...sample, lane: -2 }, 0.1);
    expect(s.results[1]).toEqual({ id: 'left', success: false });
    expect(s.index).toBe(2);
  });
  it('does not count off-road driving and distinguishes both road sides', () => {
    const s = createLesson();
    s.index = 1;
    for (let i = 0; i < 20; i++) stepLesson(s, { ...sample, onRoad: false }, 0.1);
    expect(s.index).toBe(1);
    for (let i = 0; i < 11; i++) stepLesson(s, sample, 0.1);
    expect(s.results[0]?.success).toBe(true);
    for (let i = 0; i < 11; i++) stepLesson(s, { ...sample, lane: -2 }, 0.1);
    expect(s.results[1]).toEqual({ id: 'right', success: true });
  });
  it('requires actual braking and three seconds of steady speed', () => {
    const s = createLesson();
    s.index = 3;
    stepLesson(s, { ...sample, speed: 50 }, 0.1);
    for (let i = 0; i < 20; i++) stepLesson(s, { ...sample, speed: 20 }, 0.1);
    expect(s.index).toBe(3);
    for (let i = 0; i < 11; i++) stepLesson(s, { ...sample, speed: 20, brake: 1 }, 0.1);
    expect(s.index).toBe(4);
    for (let i = 0; i < 31; i++) stepLesson(s, sample, 0.1);
    expect(s.index).toBe(5);
    for (let i = 0; i < 11; i++) stepLesson(s, { ...sample, speed: 0, brake: 1 }, 0.1);
    expect(s.index).toBe(6);
    expect(stepLesson(s, sample, 0.1)).toBe(false);
  });
});
