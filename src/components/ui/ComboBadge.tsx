'use client';

import * as React from 'react';

export interface ComboBadgeProps {
  multiplier: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ComboBadge — displays an x-multiplier. Turns rainbow + aberration at ≥5.
 */
export const ComboBadge: React.FC<ComboBadgeProps> = ({ multiplier, className = '', style }) => {
  const hot = multiplier >= 5;
  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'baseline', gap: 6, ...style }}
    >
      <span className="eyebrow">COMBO</span>
      <span
        className={`score-slab tabular ${hot ? 'rainbow-hot aberration' : ''}`}
        style={{
          fontSize: 36,
          color: hot ? undefined : 'var(--accent-combo)',
          fontFamily: 'var(--font-pixel)',
          letterSpacing: '-0.02em',
        }}
      >
        ×{multiplier}
      </span>
    </div>
  );
};
