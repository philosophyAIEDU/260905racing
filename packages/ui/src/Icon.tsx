import type { CSSProperties } from 'react';
const paths = {
  wheel: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="m4 8 5 3m11-3-5 3m-3 4v6" />
    </>
  ),
  play: <path d="m8 5 11 7-11 7Z" />,
  pause: (
    <>
      <path d="M8 5v14M16 5v14" />
    </>
  ),
  reset: (
    <>
      <path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" />
    </>
  ),
  settings: (
    <>
      <path d="M5 3v18M12 3v18M19 3v18" />
      <path d="M2 8h6m1 8h6m1-9h6" strokeWidth="4" />
    </>
  ),
  arrow: <path d="M4 12h16m-7-7 7 7-7 7" />,
  flag: (
    <>
      <path d="M5 21V4m0 0c5-5 9 5 14 0v10c-5 5-9-5-14 0" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M5 9h1m3 0h1m3 0h1m3 0h1M5 12h1m3 0h1m3 0h1m3 0h1M8 16h8" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  camera: (
    <>
      <path d="M3 7h4l2-3h6l2 3h4v13H3Z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
};
export function Icon({
  name,
  size = 20,
  style,
}: {
  name: keyof typeof paths;
  size?: number;
  style?: CSSProperties;
}): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
