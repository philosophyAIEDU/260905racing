import { useState } from 'react';
import { PHRASES, learning, type PhraseId } from '../learning/lesson';
import { speakEnglish } from '../learning/speech';
import { useGame } from '../state/game-store';
export function LearningReview(): React.JSX.Element {
  const ko = useGame((s) => s.preferences.language === 'ko');
  const [answer, setAnswer] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const completed = learning.lesson.results.filter((r) => r.success).length;
  const remember = (id: PhraseId): void => {
    setSaved(false);
    setAnswer((old) => ({ ...old, [id]: true }));
  };
  const save = (): void => {
    try {
      localStorage.setItem(
        'drivetalk:english-review',
        JSON.stringify({
          date: new Date().toISOString(),
          remembered: Object.keys(answer),
          driving: learning.lesson.results,
        }),
      );
      setSaved(true);
      setError(false);
    } catch {
      setError(true);
    }
  };
  return (
    <section className="learning-review" aria-label={ko ? '영어 복습' : 'English review'}>
      <h3>{ko ? '오늘의 영어 피트 스톱' : 'Your English pit stop'}</h3>
      <p>
        {ko
          ? `운전으로 수행한 미션 ${completed} / 6 · 뜻을 떠올린 뒤 펼쳐보세요.`
          : `Driving missions completed: ${completed} / 6. Recall the meaning, then reveal.`}
      </p>
      <div className="review-cards">
        {PHRASES.map((p) => (
          <details key={p.id}>
            <summary>
              <span lang="en">{p.en}</span>
              <small>
                {learning.lesson.results.find((r) => r.id === p.id)?.success ? '✓' : '↻'}
              </small>
            </summary>
            <p>{p.ko}</p>
            <p className="review-hint">{p.hint}</p>
            <button onClick={() => speakEnglish(p.en, undefined, () => setAudioError(true))}>
              {ko ? '다시 듣기' : 'Listen again'}
            </button>
            <button aria-pressed={!!answer[p.id]} onClick={() => remember(p.id)}>
              {answer[p.id] ? '✓' : ko ? '뜻을 기억했어요' : 'I remembered it'}
            </button>
          </details>
        ))}
      </div>
      <p>
        {ko
          ? `스스로 기억한 표현 ${Object.keys(answer).length} / 6`
          : `Self-reported recall: ${Object.keys(answer).length} / 6`}
      </p>
      <button className="audio-check" onClick={save}>
        {saved ? (ko ? '복습 기록 저장됨' : 'Review saved') : ko ? '복습 기록 저장' : 'Save review'}
      </button>
      {error && (
        <p role="status">
          {ko ? '저장 공간에 기록하지 못했습니다.' : 'Could not save to browser storage.'}
        </p>
      )}
      {audioError && (
        <p role="status">
          {ko
            ? '이 브라우저에서 영어 음성을 재생할 수 없습니다.'
            : 'English voice is unavailable in this browser.'}
        </p>
      )}
    </section>
  );
}
