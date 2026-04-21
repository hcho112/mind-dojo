'use client';

import * as React from 'react';

export interface LivesProps {
  count: number;
  max?: number;
  className?: string;
}

/**
 * Lives — hexagonal life pips. Filled pips use .pip, empty uses .pip--empty.
 */
export const Lives: React.FC<LivesProps> = ({ count, max = 3, className }) => (
  <div className={className} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} className={`pip ${i >= count ? 'pip--empty' : ''}`} />
    ))}
  </div>
);
