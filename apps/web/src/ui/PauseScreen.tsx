import { Icon } from '@drivetalk/ui';
import { useGame } from '../state/game-store';
import { useText } from './i18n';
export function PauseScreen(): React.JSX.Element {
  const resume = useGame((s) => s.resume);
  const garage = useGame((s) => s.garage);
  const blocked = useGame((s) => s.guardBlocked);
  const t = useText();
  return (
    <div className="scrim">
      <section className="pause-panel" aria-labelledby="pause-title">
        <Icon name="pause" size={32} />
        <p className="eyebrow">PAUSED</p>
        <h2 id="pause-title">{t('paused')}</h2>
        <p>{t('pauseDesc')}</p>
        <button className="primary" disabled={blocked} onClick={resume}>
          {t('resume')}
          <Icon name="play" />
        </button>
        <button className="secondary" onClick={() => useGame.getState().setSettingsOpen(true)}>
          {t('settings')}
        </button>
        <button className="text-button" onClick={garage}>
          {t('return')}
        </button>
      </section>
    </div>
  );
}
