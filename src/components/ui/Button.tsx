'use client';

import * as React from 'react';
import { Icon, IconName } from './Icon';

type Variant = 'precision' | 'recall' | 'ghost' | 'danger' | 'combo';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  children?: React.ReactNode;
}

const SIZE_MAP: Record<Size, React.CSSProperties> = {
  sm: { padding: '10px 12px', fontSize: 13 },
  md: { padding: '14px 22px', fontSize: 16 },
  lg: { padding: '18px 28px', fontSize: 18 },
};

const ICON_SIZE: Record<Size, number> = { sm: 14, md: 16, lg: 18 };

const VARIANTS: Record<Variant, Record<string, string>> = {
  precision: {
    '--btn-bg': 'var(--accent-precision)',
    '--btn-fg': '#07121A',
    '--btn-stroke': 'var(--accent-precision-deep)',
    '--btn-shadow-color': 'var(--accent-precision-deep)',
  },
  recall: {
    '--btn-bg': 'var(--accent-recall)',
    '--btn-fg': '#1A0716',
    '--btn-stroke': 'var(--accent-recall-deep)',
    '--btn-shadow-color': 'var(--accent-recall-deep)',
  },
  combo: {
    '--btn-bg': 'var(--accent-combo)',
    '--btn-fg': '#0A1A05',
    '--btn-stroke': 'var(--accent-combo-deep)',
    '--btn-shadow-color': 'var(--accent-combo-deep)',
  },
  danger: {
    '--btn-bg': 'var(--accent-danger)',
    '--btn-fg': '#1C0707',
    '--btn-stroke': 'oklch(0.45 0.18 25)',
    '--btn-shadow-color': 'oklch(0.35 0.15 25)',
  },
  ghost: {
    '--btn-bg': 'transparent',
    '--btn-fg': 'var(--text)',
    '--btn-stroke': 'var(--stroke-strong)',
    '--btn-shadow-color': 'rgba(0,0,0,0.3)',
  },
};

// Unique class name to scope the CSS
const BTN_CLASS = 'md-btn';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'ghost', size = 'md', icon, iconRight, children, className = '', style, disabled, ...rest },
    ref,
  ) => {
    const vars = VARIANTS[variant];

    return (
      <>
        <button
          ref={ref}
          className={`${BTN_CLASS} ${className}`}
          disabled={disabled}
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            userSelect: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: '1.5px solid var(--btn-stroke)',
            background: 'var(--btn-bg)',
            color: 'var(--btn-fg)',
            boxShadow: '0 4px 0 0 var(--btn-shadow-color), var(--shadow-soft)',
            transform: 'translateY(0)',
            transition: 'transform 0.15s var(--ease-snap), box-shadow 0.15s var(--ease-snap)',
            opacity: disabled ? 0.4 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
            WebkitTapHighlightColor: 'transparent',
            ...vars,
            ...SIZE_MAP[size],
            ...style,
          } as React.CSSProperties}
          {...rest}
        >
          {icon && <Icon name={icon} size={ICON_SIZE[size]} />}
          {children}
          {iconRight && <Icon name={iconRight} size={ICON_SIZE[size]} />}
        </button>
        <style>{`
          .${BTN_CLASS}:hover:not(:disabled) {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 0 0 var(--btn-shadow-color), var(--shadow-soft) !important;
          }
          .${BTN_CLASS}:active:not(:disabled) {
            transform: translateY(4px) !important;
            box-shadow: 0 0 0 0 var(--btn-shadow-color), var(--shadow-soft) !important;
          }
        `}</style>
      </>
    );
  },
);
Button.displayName = 'Button';
