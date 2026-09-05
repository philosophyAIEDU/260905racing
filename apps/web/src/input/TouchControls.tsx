import { useRef, type PointerEvent } from 'react';
import { clamp } from '@drivetalk/game-core';
import { touch } from './controls';
import { useGame } from '../state/game-store';

export function TouchControls(): React.JSX.Element {
  const stick = useRef<HTMLDivElement>(null);
  const language = useGame((s) => s.preferences.language);
  const move = (e: PointerEvent<HTMLDivElement>): void => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    touch.steer = clamp((e.clientX - rect.left - rect.width / 2) / (rect.width * 0.32), -1, 1);
    if (stick.current) stick.current.style.transform = `translateX(${touch.steer * 32}px)`;
  };
  const release = (): void => {
    touch.steer = 0;
    if (stick.current) stick.current.style.transform = '';
  };
  const pedal = (kind: 'throttle' | 'brake' | 'handbrake', value: boolean): void => {
    if (kind === 'handbrake') touch.handbrake = value;
    else touch[kind] = Number(value);
  };
  return (
    <div className="touch-controls">
      <div
        className="joystick"
        aria-label={language === 'ko' ? '좌우 조향 스틱' : 'Steering stick'}
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e);
        }}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <span>‹</span>
        <div ref={stick} className="stick-knob" />
        <span>›</span>
      </div>
      <div className="pedals">
        {(['handbrake', 'brake', 'throttle'] as const).map((kind) => (
          <button
            key={kind}
            className={`pedal ${kind}`}
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              pedal(kind, true);
            }}
            onPointerUp={() => pedal(kind, false)}
            onPointerCancel={() => pedal(kind, false)}
            onLostPointerCapture={() => pedal(kind, false)}
            aria-label={kind}
          >
            {kind === 'throttle'
              ? language === 'ko'
                ? '가속'
                : 'GAS'
              : kind === 'brake'
                ? language === 'ko'
                  ? '제동'
                  : 'BRAKE'
                : language === 'ko'
                  ? '드리프트'
                  : 'DRIFT'}
          </button>
        ))}
      </div>
    </div>
  );
}
