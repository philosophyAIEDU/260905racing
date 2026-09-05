import { LearningReview } from './LearningReview';
import { formatTime } from '@drivetalk/game-core';
import { Icon } from '@drivetalk/ui';
import { telemetry, useGame } from '../state/game-store';
import { useText } from './i18n';
export function Results(): React.JSX.Element {
  const garage = useGame((s) => s.garage);
  const best = useGame((s) => s.bestLap);
  const t = useText();
  const race = telemetry.race;
  return (
    <div className="scrim results-scrim">
      <section className="results-panel" aria-labelledby="results-title">
        <p className="eyebrow">
          <Icon name="flag" />
          {t('result')}
        </p>
        <h2 id="results-title">{race.complete ? t('finish') : t('practiceFinish')}</h2>
        <div className="result-stats">
          <div>
            <span>{t('total')}</span>
            <strong>{formatTime(race.elapsed)}</strong>
          </div>
          <div>
            <span>{t('driftScore')}</span>
            <strong>
              {Math.floor(telemetry.driftPoints).toLocaleString()}
              <small>PTS</small>
            </strong>
          </div>
        </div>
        <div className="lap-list">
          {race.laps.map((time, i) => (
            <div key={i}>
              <span>
                {t('lapLabel')} {String(i + 1).padStart(2, '0')}
              </span>
              <strong>{formatTime(time)}</strong>
            </div>
          ))}
        </div>
        <div className="result-footer">
          <span>
            {t('best')} <strong>{formatTime(best ?? 0)}</strong>
          </span>
          <span>
            {t('penalty')} <strong>+{race.penalty}s</strong>
          </span>
        </div>
        <LearningReview />
        <button className="primary" onClick={garage}>
          {t('return')}
          <Icon name="arrow" />
        </button>
      </section>
    </div>
  );
}
