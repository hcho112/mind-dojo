'use client';

import * as React from 'react';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Inset surface — dashed border, recessed look. Good for sub-sections. */
  inset?: boolean;
  /** HUD style — adds arcade corner brackets + scanline overlay. */
  hud?: boolean;
  /** Adds tinted glow in the accent color (auto-suppressed in light theme). */
  glow?: 'precision' | 'recall' | 'combo';
  /** Suppress default noise overlay. */
  noNoise?: boolean;
}

/**
 * Panel — base surface container.
 * Relies on .panel, .panel--inset, .panel--hud, .glow-*, .noise, .scanlines
 * classes in tokens.css.
 */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ inset, hud, glow, noNoise, className = '', children, ...rest }, ref) => {
    const classes = [
      'panel',
      inset && 'panel--inset',
      hud && 'panel--hud scanlines',
      glow && `glow-${glow}`,
      !noNoise && 'noise',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} className={classes} {...rest}>
        {children}
      </div>
    );
  },
);
Panel.displayName = 'Panel';
