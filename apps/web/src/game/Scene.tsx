import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { ACESFilmicToneMapping } from 'three';
import { useGame } from '../state/game-store';
import { Vehicle } from './Vehicle';
import { Track } from './Track';
import { Scenery } from './Scenery';

function Ready({ onReady }: { onReady: () => void }): null {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

function supportsGraphics(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function Scene({
  onReady,
  onUnavailable,
}: {
  onReady: () => void;
  onUnavailable: () => void;
}): React.JSX.Element {
  const phase = useGame((s) => s.phase);
  const session = useGame((s) => s.session);
  const quality = useGame((s) => s.preferences.quality);
  const language = useGame((s) => s.preferences.language);
  const [supported] = useState(supportsGraphics);
  useEffect(() => {
    if (!supported) onUnavailable();
  }, [supported, onUnavailable]);
  if (!supported)
    return (
      <div className="scene graphics-unavailable">
        <section role="status">
          <h2>
            {language === 'ko' ? '3D 그래픽을 사용할 수 없습니다.' : '3D graphics are unavailable.'}
          </h2>
          <p>
            {language === 'ko'
              ? '브라우저 설정에서 그래픽 가속을 켠 뒤 다시 열어주세요.'
              : 'Enable graphics acceleration in your browser and reopen the game.'}
          </p>
          <button className="secondary" onClick={() => window.location.reload()}>
            {language === 'ko' ? '다시 확인' : 'Try again'}
          </button>
        </section>
      </div>
    );
  return (
    <div className="scene" aria-label="3D 드라이빙 코스">
      <Canvas
        shadows={quality === 'standard'}
        dpr={quality === 'low' ? 1 : [1, 1.5]}
        camera={{ position: [10, 5, 92], fov: 50, near: 0.15, far: 650 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: ACESFilmicToneMapping,
        }}
      >
        <color attach="background" args={['#bacdc6']} />
        <fog attach="fog" args={['#bacdc6', 125, 440]} />
        <hemisphereLight args={['#e3efe0', '#53695c', 2.3]} />
        <directionalLight
          position={[75, 105, 70]}
          intensity={2.7}
          color="#fff0cd"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-170}
          shadow-camera-right={170}
          shadow-camera-top={140}
          shadow-camera-bottom={-140}
          shadow-camera-far={350}
          shadow-bias={-0.001}
        />
        <Suspense fallback={null}>
          <Physics
            timeStep={1 / 60}
            interpolate
            paused={phase !== 'driving'}
            gravity={[0, -9.81, 0]}
          >
            <Track />
            <Scenery />
            <Vehicle key={session} />
            <Ready onReady={onReady} />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
