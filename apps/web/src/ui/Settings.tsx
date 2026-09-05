import { useEffect, useRef, useState } from 'react';
import { Icon } from '@drivetalk/ui';
import { useGame } from '../state/game-store';
import { requestTilt } from '../input/controls';
import { useText } from './i18n';

export function Settings(): React.JSX.Element {
  const dialog = useRef<HTMLDialogElement>(null);
  const open = useGame((s) => s.settingsOpen);
  const p = useGame((s) => s.preferences);
  const update = useGame((s) => s.setPreferences);
  const close = (): void => useGame.getState().setSettingsOpen(false);
  const [sensorError, setSensorError] = useState(false);
  const t = useText();
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  return (
    <dialog
      className="settings-dialog"
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      aria-labelledby="settings-title"
    >
      <header>
        <div>
          <p className="eyebrow">DRIVE YOUR WAY</p>
          <h2 id="settings-title">{t('settings')}</h2>
        </div>
        <button className="icon-button" aria-label={t('close')} onClick={close}>
          <Icon name="close" />
        </button>
      </header>
      <div className="settings-rows">
        <label className="setting-row">
          <span>
            <strong>{t('assist')}</strong>
            <small>{t('assistDesc')}</small>
          </span>
          <input
            role="switch"
            type="checkbox"
            checked={p.assists}
            onChange={(e) => update({ assists: e.target.checked })}
          />
        </label>
        <label className="setting-row">
          <span>
            <strong>{t('motion')}</strong>
            <small>{t('motionDesc')}</small>
          </span>
          <input
            role="switch"
            type="checkbox"
            checked={p.reducedMotion}
            onChange={(e) => update({ reducedMotion: e.target.checked })}
          />
        </label>
        <label className="setting-row">
          <span>
            <strong>{t('view')}</strong>
          </span>
          <select
            value={p.camera}
            onChange={(e) => update({ camera: e.target.value === 'hood' ? 'hood' : 'chase' })}
          >
            <option value="chase">{t('chase')}</option>
            <option value="hood">{t('hood')}</option>
          </select>
        </label>
        <label className="setting-row">
          <span>
            <strong>{t('quality')}</strong>
          </span>
          <select
            value={p.quality}
            onChange={(e) => update({ quality: e.target.value === 'low' ? 'low' : 'standard' })}
          >
            <option value="standard">{t('standard')}</option>
            <option value="low">{t('low')}</option>
          </select>
        </label>
        <label className="setting-row">
          <span>
            <strong>{t('tilt')}</strong>
            <small>{t('tiltDesc')}</small>
          </span>
          <input
            role="switch"
            type="checkbox"
            checked={p.tilt}
            onChange={async (e) => {
              if (!e.target.checked) {
                update({ tilt: false });
                return;
              }
              const granted = await requestTilt();
              setSensorError(!granted);
              if (granted) update({ tilt: true });
            }}
          />
        </label>
        {sensorError && <p className="notice">{t('sensorDenied')}</p>}
        <label className="setting-row">
          <span>
            <strong>{t('guard')}</strong>
            <small>{t('guardDesc')}</small>
          </span>
          <input
            role="switch"
            type="checkbox"
            checked={p.movementGuard}
            onChange={(e) => update({ movementGuard: e.target.checked })}
          />
        </label>
        <label className="setting-row">
          <span>
            <strong>{t('language')}</strong>
          </span>
          <select
            value={p.language}
            onChange={(e) => update({ language: e.target.value === 'en' ? 'en' : 'ko' })}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
      <h3>{t('controls')}</h3>
      <div className="control-grid">
        <span>
          <kbd>W / ↑</kbd>
          {t('throttle')}
        </span>
        <span>
          <kbd>S / ↓</kbd>
          {t('brake')}
        </span>
        <span>
          <kbd>A D / ← →</kbd>
          {t('steer')}
        </span>
        <span>
          <kbd>Space</kbd>
          {t('drift')}
        </span>
        <span>
          <kbd>R</kbd>
          {t('reset')}
        </span>
        <span>
          <kbd>C</kbd>
          {t('camera')}
        </span>
      </div>
      <p className="gamepad-help">{t('gamepad')}</p>
      <button className="primary" onClick={close}>
        {t('close')}
        <Icon name="check" />
      </button>
    </dialog>
  );
}
