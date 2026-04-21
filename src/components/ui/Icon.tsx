'use client';

import * as React from 'react';

export type IconName =
  | 'target' | 'cards' | 'play' | 'pause' | 'heart' | 'heart_fill'
  | 'bolt' | 'trophy' | 'settings' | 'flame' | 'arrow' | 'close'
  | 'menu' | 'spark' | 'eye' | 'check' | 'x' | 'deck';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}

const PATHS: Record<IconName, React.ReactNode> = {
  target: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></>),
  cards: (<><rect x="3" y="6" width="11" height="15" rx="1.5" transform="rotate(-6 8.5 13.5)" /><rect x="10" y="3" width="11" height="15" rx="1.5" transform="rotate(6 15.5 10.5)" /></>),
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  pause: (<><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/></>),
  heart: <path d="M12 21s-7-4.5-9.3-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.3 6c-2.3 4.5-9.3 9-9.3 9z" />,
  heart_fill: <path d="M12 21s-7-4.5-9.3-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.3 6c-2.3 4.5-9.3 9-9.3 9z" fill="currentColor"/>,
  bolt: <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" fill="currentColor" stroke="none" />,
  trophy: (<><path d="M7 4h10v4a5 5 0 0 1-10 0V4z" /><path d="M5 4H3v2a3 3 0 0 0 3 3M19 4h2v2a3 3 0 0 1-3 3"/><path d="M9 13v3h6v-3M8 20h8"/></>),
  settings: (<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>),
  flame: <path d="M12 2s5 5 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4-1 3 1 4 1 4s-1-4 2-6c0 2 2 3 2 5a2 2 0 0 1-4 0"/>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  spark: <path d="M12 2v5M12 17v5M4 12h5M15 12h5M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3"/>,
  eye: (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>),
  check: <path d="M4 12l5 5L20 6"/>,
  x: <path d="M6 6l12 12M18 6 6 18"/>,
  deck: (<><rect x="5" y="4" width="12" height="16" rx="1.5"/><rect x="8" y="7" width="12" height="16" rx="1.5" fill="var(--surface)"/></>),
};

export const Icon: React.FC<IconProps> = ({ name, size = 18, color = 'currentColor', className }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ flexShrink: 0, color }}
    aria-hidden
  >
    {PATHS[name]}
  </svg>
);
