import { useState } from 'react';
import { useGame } from '../state/game-store';
import { PHRASES } from '../learning/lesson';
import { speakEnglish } from '../learning/speech';
export function LearningSetup(): React.JSX.Element {
  const enabled = useGame((s) => s.preferences.english);
  const language = useGame((s) => s.preferences.language);
  const ko = language === 'ko';
  const [audio, setAudio] = useState<'idle' | 'playing' | 'ready' | 'error'>('idle');
  return (
    <section className="learning-setup">
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => useGame.getState().setPreferences({ english: e.target.checked })}
        />
        <strong>{ko ? '영어 듣기 미션' : 'English listening missions'}</strong>
        <small>A1</small>
      </label>
      {enabled && (
        <>
          <p>
            {ko
              ? '영어 지시를 듣고 운전으로 답하세요. 주행 후 뜻을 복습합니다.'
              : 'Listen, respond by driving, then review after your run.'}
          </p>
          <button
            className="audio-check"
            onClick={() => {
              setAudio('playing');
              speakEnglish(
                'Ready? Speed up. Keep left.',
                () => setAudio('ready'),
                () => setAudio('error'),
              );
            }}
          >
            {audio === 'playing'
              ? ko
                ? '재생 중…'
                : 'Playing…'
              : ko
                ? '영어 음성 확인'
                : 'Check English audio'}
          </button>
          {audio === 'ready' && (
            <small role="status">
              {ko ? '소리가 들리면 준비 완료입니다.' : 'If you heard the voice, you are ready.'}
            </small>
          )}
          {audio === 'error' && (
            <small role="status">
              {ko
                ? '영어 음성을 사용할 수 없습니다. 미션을 끄고 주행 후 표현을 복습할 수 있습니다.'
                : 'Voice unavailable. You can turn missions off and review after driving.'}
            </small>
          )}
          <details>
            <summary>{ko ? '출발 전 표현 살펴보기 · 6개' : 'Preview 6 expressions'}</summary>
            {PHRASES.map((p) => (
              <p key={p.id}>
                <b lang="en">{p.en}</b> {ko && p.ko}
              </p>
            ))}
          </details>
        </>
      )}
    </section>
  );
}
