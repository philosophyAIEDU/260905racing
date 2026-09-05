function point(angle: number, radius: number): [number, number] {
  const a = (angle * Math.PI) / 180;
  return [100 + Math.sin(a) * radius, 100 - Math.cos(a) * radius];
}

export function SpeedDial(): React.JSX.Element {
  return (
    <svg className="speed-dial" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="97" fill="#101820eb" stroke="#ffffff45" strokeWidth="1" />
      <circle cx="100" cy="100" r="91" fill="none" stroke="#ffffff14" strokeWidth="2" />
      {Array.from({ length: 37 }, (_, i) => {
        const angle = -130 + (i * 260) / 36;
        const [x1, y1] = point(angle, i % 6 === 0 ? 73 : 80);
        const [x2, y2] = point(angle, 86);
        const [x, y] = point(angle, 62);
        return (
          <g key={i} fill={i >= 30 ? '#ff5a62' : '#e9f0f4'}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              className={i >= 30 ? 'redline' : ''}
              strokeWidth={i % 6 === 0 ? 2 : 1}
            />
            {i % 6 === 0 && (
              <text x={x} y={y + 3} textAnchor="middle" fontSize="9">
                {i * 5}
              </text>
            )}
          </g>
        );
      })}
      <g data-needle transform="rotate(-130 100 100)">
        <path d="M97 111 L100 29 L103 111 Z" fill="#ff354c" />
        <circle cx="100" cy="100" r="6" fill="#e8edf0" />
        <circle cx="100" cy="100" r="3" fill="#ff354c" />
      </g>
      <text x="100" y="179" textAnchor="middle" fill="#a1adb7" fontSize="7" letterSpacing="2">
        SPRINT GT
      </text>
    </svg>
  );
}
