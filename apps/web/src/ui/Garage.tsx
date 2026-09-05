import { LearningSetup } from './LearningSetup';
import { useState } from 'react';
import { formatTime, TRACK_LENGTH } from '@drivetalk/game-core';
import { Icon } from '@drivetalk/ui';
import { useGame } from '../state/game-store';
import { Minimap } from './Minimap';
import { useText } from './i18n';

export function Garage({
  ready,
  graphicsFailed,
}: {
  ready: boolean;
  graphicsFailed: boolean;
}): React.JSX.Element {
  const [practice, setPractice] = useState(false);
  const [consent, setConsent] = useState(false);
  const start = useGame((s) => s.start);
  const bestLap = useGame((s) => s.bestLap);
  const blocked = useGame((s) => s.guardBlocked);
  const t = useText();
  const color = useGame((s) => s.preferences.color);
  const language = useGame((s) => s.preferences.language);
  const paint = useGame((s) => s.setPreferences);
  return (
    <section className="garage-panel" aria-labelledby="course-title">
      <p className="eyebrow">
        <span className="line" /> CIRCUIT 01 <span className="muted">/</span> {t('beginner')}
      </p>
      <h1 id="course-title">
        PINE
        <br />
        <span>LOOP.</span>
      </h1>
      <p className="course-subtitle">
        {t('course')}
        <span> / </span>
        {t('courseDesc')}
      </p>
      <div className="course-card">
        <Minimap />
        <div className="course-stats">
          <div>
            <span>{t('length')}</span>
            <strong>
              {(TRACK_LENGTH / 1000).toFixed(2)} <small>km</small>
            </strong>
          </div>
          <div>
            <span>{t('width')}</span>
            <strong>
              15 <small>m</small>
            </strong>
          </div>
          <div>
            <span>{t('best')}</span>
            <strong className="time-small">{formatTime(bestLap ?? 0)}</strong>
          </div>
        </div>
      </div>
      <div className="mode-switch" role="group" aria-label="Drive mode">
        <button
          className={!practice ? 'selected' : ''}
          onClick={() => setPractice(false)}
          aria-pressed={!practice}
        >
          <Icon name="flag" />
          <span>
            <strong>{t('timeTrial')}</strong>
            <small>{t('laps')}</small>
          </span>
          {!practice && <Icon name="check" size={16} />}
        </button>
        <button
          className={practice ? 'selected' : ''}
          onClick={() => setPractice(true)}
          aria-pressed={practice}
        >
          <Icon name="wheel" />
          <span>
            <strong>{t('practice')}</strong>
            <small>{t('unlimited')}</small>
          </span>
          {practice && <Icon name="check" size={16} />}
        </button>
      </div>
      <div
        className="paint-picker"
        role="group"
        aria-label={language === 'ko' ? '차량 색상' : 'Car paint'}
      >
        <span>SPRINT GT</span>
        {(['#d71932', '#10141a', '#edf2f4'] as const).map((value, i) => (
          <button
            key={value}
            style={{ backgroundColor: value }}
            aria-pressed={color === value}
            aria-label={
              (language === 'ko'
                ? ['레이싱 레드', '카본 블랙', '펄 화이트']
                : ['Racing red', 'Carbon black', 'Pearl white'])[i]
            }
            onClick={() => paint({ color: value })}
          />
        ))}
      </div>
      <LearningSetup />
      <div className="safety">
        <strong>
          <Icon name="shield" size={16} />
          {t('safety')}
        </strong>
        <label>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>{t('consent')}</span>
        </label>
      </div>
      {graphicsFailed && <p className="notice">{t('graphicsError')}</p>}
      <button
        className="primary start-button"
        disabled={!consent || !ready || blocked}
        onClick={() => start(practice)}
      >
        {graphicsFailed ? t('graphicsError') : ready ? t('start') : t('loading')}
        <Icon name="arrow" size={23} />
      </button>
    </section>
  );
}
