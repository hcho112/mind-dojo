'use client';

import * as React from 'react';

export interface ScoreSlabProps {
  value: number | string;
  /** Font-size in px. */
  size?: number;
  /** Color tone — 'text' uses default text, others pull from --accent-*. */
  tone?: 'text' | 'precision' | 'recall' | 'combo';
  /** Zero-pad to this length when value is numeric. */
  pad?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ScoreSlab: React.FC<ScoreSlabProps> = ({
  value,
  size = 56,
  tone = 'text',
  pad = 6,
  className = '',
  style,
}) => {
  const color = tone === 'text' ? 'var(--text)' : `var(--accent-${tone})`;
  const display = typeof value === 'number' ? String(value).padStart(pad, '0') : value;
  return (
    <div
      className={`score-slab tabular ${className}`}
      style={{ fontSize: size, lineHeight: 1, color, letterSpacing: '-0.03em', ...style }}
    >
      {display}
    </div>
  );
};
