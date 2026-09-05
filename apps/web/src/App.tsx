import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Icon } from '@drivetalk/ui';
import { useGame } from './state/game-store';
import { useLearning } from './learning/useLearning';
import { useControls } from './input/controls';
import { useMovementGuard } from './input/use-movement-guard';
import { Garage } from './ui/Garage';
import { Hud } from './ui/Hud';
import { PauseScreen } from './ui/PauseScreen';
import { Results } from './ui/Results';
import { Settings } from './ui/Settings';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { useText } from './ui/i18n';

const Scene = lazy(() => import('./game/Scene'));
const DevTuning = import.meta.env.DEV ? lazy(() => import('./game/DevTuning')) : null;

export function App(): React.JSX.Element {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const [graphicsFailed, setGraphicsFailed] = useState(false);
  const onUnavailable = useCallback(() => setGraphicsFailed(true), []);
  const phase = useGame((s) => s.phase);
  const language = useGame((s) => s.preferences.language);
  const settingsOpen = useGame((s) => s.settingsOpen);
  const storageWarning = useGame((s) => s.storageWarning);
  const motion = useGame((s) => s.preferences.reducedMotion);
  const guardMessage = useMovementGuard();
  const t = useText();
  useControls();
  useLearning();
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const driving = phase === 'driving' || phase === 'countdown';
  return (
    <ErrorBoundary>
      <main
        className={`game-shell ${driving ? 'is-driving' : ''} ${motion ? 'reduced-motion' : ''}`}
      >
        <Suspense fallback={<div className="boot">{t('loading')}…</div>}>
          <Scene onReady={onReady} onUnavailable={onUnavailable} />
        </Suspense>
        <div className="vignette" />
        <header className="app-header">
          <div className="wordmark">
            DRIVE<span>TALK</span>
            <i>01</i>
          </div>
          <div className="header-center">
            <span>DRIVING PLAYGROUND</span>
            <i />
            PINE LOOP
          </div>
          <div className="header-actions">
            <button
              className="language-button"
              aria-label="Change language"
              onClick={() =>
                useGame.getState().setPreferences({ language: language === 'ko' ? 'en' : 'ko' })
              }
            >
              {language === 'ko' ? 'KO' : 'EN'}
              <span> / {language === 'ko' ? 'EN' : 'KO'}</span>
            </button>
            <button
              className="icon-button"
              aria-label={t('settings')}
              onClick={() => useGame.getState().setSettingsOpen(true)}
            >
              <Icon name="settings" />
            </button>
          </div>
        </header>
        {phase === 'garage' && (
          <>
            <Garage ready={ready} graphicsFailed={graphicsFailed} />
            {!graphicsFailed && (
              <aside className="car-label">
                <p>YOUR RIDE</p>
                <h2>
                  458 <span>/ ITALIA</span>
                </h2>
                <div>
                  <span>LISTEN · DRIVE · LEARN</span>
                  <a
                    href="https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6"
                    target="_blank"
                    rel="noreferrer"
                  >
                    3D: vicent091036 · CC BY
                  </a>
                </div>
              </aside>
            )}
            <footer className="garage-footer">
              <span>
                <Icon name="keyboard" size={18} />
                <kbd>W A S D</kbd> / {t('steer')}
                <span className="footer-dot">·</span>
                <kbd>Space</kbd> {t('drift')}
              </span>
              <span>{t('safetyHint')}</span>
            </footer>
          </>
        )}
        {driving && <Hud />}
        {phase === 'paused' && !settingsOpen && <PauseScreen />}
        {phase === 'finished' && <Results />}
        {(guardMessage || storageWarning) && (
          <div className="notice global-notice" role="status">
            {guardMessage || t('storage')}
          </div>
        )}
        <Settings />
        {DevTuning && new URLSearchParams(window.location.search).has('tune') && (
          <Suspense fallback={null}>
            <DevTuning />
          </Suspense>
        )}
      </main>
    </ErrorBoundary>
  );
}
