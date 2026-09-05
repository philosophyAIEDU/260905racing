export const PHRASES = [
  {
    id: 'accelerate',
    en: 'Speed up.',
    ko: '속도를 높이세요.',
    hint: '가속해서 시속 30km 이상으로 달려보세요.',
  },
  {
    id: 'left',
    en: 'Keep left.',
    ko: '왼쪽을 유지하세요.',
    hint: '도로의 왼쪽 절반에서 1초 동안 달려보세요.',
  },
  {
    id: 'right',
    en: 'Keep right.',
    ko: '오른쪽을 유지하세요.',
    hint: '도로의 오른쪽 절반에서 1초 동안 달려보세요.',
  },
  {
    id: 'brake',
    en: 'Slow down.',
    ko: '속도를 줄이세요.',
    hint: '브레이크로 속도를 줄여 시속 25km 이하로 달려보세요.',
  },
  {
    id: 'steady',
    en: 'Keep a steady speed.',
    ko: '일정한 속도를 유지하세요.',
    hint: '시속 20~40km를 3초 동안 유지해보세요.',
  },
  {
    id: 'stop',
    en: 'Come to a stop.',
    ko: '차를 멈추세요.',
    hint: '브레이크로 완전히 정지해보세요.',
  },
] as const;
export type PhraseId = (typeof PHRASES)[number]['id'];
export type Outcome = { id: PhraseId; success: boolean };
export interface LessonState {
  index: number;
  elapsed: number;
  held: number;
  baseline: number;
  results: Outcome[];
}
export interface LessonSample {
  speed: number;
  lane: number;
  brake: number;
  throttle: number;
  onRoad: boolean;
}
export function createLesson(): LessonState {
  return { index: 0, elapsed: 0, held: 0, baseline: 0, results: [] };
}
export function stepLesson(s: LessonState, sample: LessonSample, dt: number): boolean {
  const phrase = PHRASES[s.index];
  if (!phrase) return false;
  const seconds = Math.max(0, Math.min(0.25, dt));
  if (s.elapsed === 0) s.baseline = sample.speed;
  s.elapsed += seconds;
  let correct = false;
  switch (phrase.id) {
    case 'accelerate':
      correct = sample.speed >= 30 && sample.throttle > 0;
      break;
    case 'left':
      correct = sample.lane > 1.4 && sample.speed > 8;
      break;
    case 'right':
      correct = sample.lane < -1.4 && sample.speed > 8;
      break;
    case 'brake':
      correct = sample.speed <= 25 && sample.brake > 0 && sample.speed < s.baseline - 3;
      break;
    case 'steady':
      correct = sample.speed >= 20 && sample.speed <= 40;
      break;
    case 'stop':
      correct = sample.speed < 2 && sample.brake > 0;
      break;
  }
  s.held = correct && sample.onRoad ? s.held + seconds : 0;
  const success = s.held >= (phrase.id === 'steady' ? 3 : 1);
  if (!success && s.elapsed < 25) return false;
  s.results.push({ id: phrase.id, success });
  s.index++;
  s.elapsed = 0;
  s.held = 0;
  return true;
}
export const learning = {
  lesson: createLesson(),
  active: false,
  audioReady: false,
  audioError: false,
};
