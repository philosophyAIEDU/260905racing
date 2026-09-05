import { useEffect, useRef } from 'react';
import { formatTime } from '@drivetalk/game-core';
import { Icon } from '@drivetalk/ui';
import { telemetry, useGame } from '../state/game-store';
import { TouchControls } from '../input/TouchControls';
import { learning, PHRASES } from '../learning/lesson';
import { replayInstruction } from '../learning/useLearning';
import { SpeedDial } from './SpeedDial';
import { Minimap } from './Minimap';
import { useText } from './i18n';

export function Hud(): React.JSX.Element {
  const root = useRef<HTMLDivElement>(null);
  const countdown = useRef<HTMLDivElement>(null);
  const phase = useGame((s) => s.phase);
  const pause = useGame((s) => s.pause);
  const t = useText();
  const practice = telemetry.race.totalLaps === 0;
  const language = useGame((s) => s.preferences.language);
  const finish = useGame((s) => s.finish);
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const speed = container.querySelector('[data-speed]');
    const coach = container.querySelector('[data-coach]');
    const needle = container.querySelector('[data-needle]');
    const gear = container.querySelector('[data-gear]');
    const lap = container.querySelector('[data-lap]');
    const time = container.querySelector('[data-time]');
    const gates = container.querySelector('[data-gates]');
    const score = container.querySelector('[data-score]');
    const signal = container.querySelector<HTMLElement>('[data-signal]');
    const meter = container.querySelector<HTMLElement>('[data-meter]');
    const id = window.setInterval(() => {
      if (coach)
        coach.textContent = learning.audioError
          ? 'EN ↻'
          : `EN ${Math.min(learning.lesson.index + 1, PHRASES.length)} / 6 ${learning.lesson.index === PHRASES.length ? '✓' : '♪'}`;
      if (speed) speed.textContent = Math.round(telemetry.speed).toString().padStart(3, '0');
      needle?.setAttribute(
        'transform',
        `rotate(${-130 + Math.min(1, telemetry.speed / 180) * 260} 100 100)`,
      );
      if (gear) gear.textContent = telemetry.gear;
      if (lap) lap.textContent = String(telemetry.race.lap).padStart(2, '0');
      if (time) time.textContent = formatTime(telemetry.race.elapsed);
      if (gates) gates.textContent = `${telemetry.race.nextGate + 1} / 8`;
      if (score) score.textContent = Math.floor(telemetry.driftPoints).toLocaleString();
      if (meter) meter.style.width = `${Math.min(100, telemetry.speed / 1.7)}%`;
      if (signal) {
        signal.textContent = telemetry.drifting
          ? 'DRIFT +'
          : telemetry.offTrack
            ? language === 'ko'
              ? '코스로 돌아오세요'
              : 'RETURN TO THE TRACK'
            : telemetry.race.gateFlashUntil > telemetry.race.elapsed
              ? language === 'ko'
                ? '체크포인트 통과'
                : 'CHECKPOINT CLEARED'
              : '';
        signal.dataset.active = String(Boolean(signal.textContent));
      }
      if (telemetry.finishRequested) {
        telemetry.finishRequested = false;
        useGame.getState().finish();
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [language]);
  useEffect(() => {
    if (phase !== 'countdown') return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      telemetry.countdown -= (now - last) / 1000;
      last = now;
      if (countdown.current)
        countdown.current.textContent = String(Math.max(1, Math.ceil(telemetry.countdown)));
      if (telemetry.countdown <= 0) useGame.getState().setPhase('driving');
    }, 50);
    return () => window.clearInterval(id);
  }, [phase]);
  return (
    <div className="hud" ref={root}>
      <div className="race-top">
        <div className="lap-counter">
          <span>{t('lapLabel')}</span>
          <strong data-lap>01</strong>
          <small>/ {practice ? '∞' : '03'}</small>
        </div>
        <div className="race-time">
          <span>{t('total')}</span>
          <strong data-time>0:00.00</strong>
        </div>
      </div>
      <div className="hud-buttons">
        <button
          className="icon-button"
          title={t('reset')}
          aria-label={t('reset')}
          onClick={() => useGame.getState().reset()}
        >
          <Icon name="reset" />
        </button>
        <button className="icon-button" title={t('pause')} aria-label={t('pause')} onClick={pause}>
          <Icon name="pause" />
        </button>
      </div>
      <div className="drive-signal" data-signal data-active="false" />
      {phase === 'countdown' && (
        <div className="countdown">
          <span>{t('ready')}</span>
          <strong ref={countdown}>{Math.ceil(telemetry.countdown)}</strong>
        </div>
      )}
      {learning.active && (
        <button
          className="coach-radio"
          onClick={replayInstruction}
          aria-label={language === 'ko' ? '영어 지시 다시 듣기' : 'Repeat English instruction'}
        >
          <span data-coach>EN ♪</span>
          <small>↻</small>
        </button>
      )}
      <div className="hud-map">
        <Minimap live />
        <div>
          <span>{t('next')}</span>
          <strong data-gates>1 / 8</strong>
        </div>
      </div>
      <div className="speed-panel">
        <SpeedDial />
        <div className="drift-stat">
          <span>DRIFT</span>
          <strong data-score>0</strong>
          <small>PTS</small>
        </div>
        <div className="speed-row">
          <div className="gear" data-gear>
            N
          </div>
          <strong data-speed>000</strong>
          <span>km/h</span>
        </div>
        <div className="speed-meter">
          <i data-meter />
        </div>
      </div>
      <p className="driving-hint">{t('firstTip')}</p>
      {practice && (
        <button className="end-practice" onClick={finish}>
          {t('stopPractice')}
        </button>
      )}
      <TouchControls />
    </div>
  );
}
