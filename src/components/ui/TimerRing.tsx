'use client';

import * as React from 'react';

export interface TimerRingProps {
  /** 0–100 */
  pct: number;
  size?: number;
  tone?: 'precision' | 'recall' | 'combo';
  label?: React.ReactNode;
  sub?: React.ReactNode;
}

export const TimerRing: React.FC<TimerRingProps> = ({
  pct,
  size = 84,
  tone = 'precision',
  label,
  sub,
}) => (
  <div
    className="ring"
    style={
      {
        width: size,
        height: size,
        ['--pct' as any]: pct,
        background: `conic-gradient(var(--accent-${tone}) calc(${pct} * 1%), var(--stroke) 0)`,
      } as React.CSSProperties
    }
  >
    <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
      <div
        className="score-slab tabular"
        style={{ fontSize: size * 0.32, color: `var(--accent-${tone})`, lineHeight: 1 }}
      >
        {label}
      </div>
      {sub && <div className="eyebrow" style={{ fontSize: 9, marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);
