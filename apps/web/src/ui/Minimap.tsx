import { useEffect, useRef } from 'react';
import { GATES, TRACK_POINTS } from '@drivetalk/game-core';
import { telemetry } from '../state/game-store';

const mapX = (x: number): number => x * 0.62 + 90;
const mapY = (z: number): number => -z * 0.62 + 70;
const path =
  TRACK_POINTS.map(
    (p, i) => `${i === 0 ? 'M' : 'L'}${mapX(p.x).toFixed(1)},${mapY(p.z).toFixed(1)}`,
  ).join(' ') + ' Z';

export function Minimap({ live = false }: { live?: boolean }): React.JSX.Element {
  const dot = useRef<SVGGElement>(null);
  const gate = useRef<SVGCircleElement>(null);
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      dot.current?.setAttribute(
        'transform',
        `translate(${mapX(telemetry.x)},${mapY(telemetry.z)}) rotate(${(telemetry.yaw * 180) / Math.PI})`,
      );
      const next = GATES[telemetry.race.nextGate]!;
      gate.current?.setAttribute('cx', String(mapX(next.x)));
      gate.current?.setAttribute('cy', String(mapY(next.z)));
    }, 100);
    return () => window.clearInterval(id);
  }, [live]);
  return (
    <svg className="minimap" viewBox="0 0 180 145" role="img" aria-label="Pine Loop circuit map">
      <path d={path} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="12" />
      <path d={path} fill="none" stroke="currentColor" strokeOpacity="0.75" strokeWidth="2" />
      <path d="M84 16h12" stroke="#dcfa60" strokeWidth="4" />
      {live && (
        <>
          <circle ref={gate} r="4.5" fill="none" stroke="#dcfa60" strokeWidth="2" />
          <g ref={dot} transform="translate(90 17)">
            <path d="m0-6 4 10-4-2-4 2Z" fill="#dcfa60" stroke="#111c20" strokeWidth="1.5" />
          </g>
        </>
      )}
    </svg>
  );
}
