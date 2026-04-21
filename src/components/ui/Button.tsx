'use client';

import * as React from 'react';
import { Icon, IconName } from './Icon';

type Variant = 'precision' | 'recall' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  children?: React.ReactNode;
}

const SIZE_MAP: Record<Size, React.CSSProperties> = {
  sm: { padding: '10px 14px', fontSize: 14 },
  md: { padding: '14px 22px', fontSize: 16 },
  lg: { padding: '18px 30px', fontSize: 20 },
};

const ICON_SIZE: Record<Size, number> = { sm: 16, md: 18, lg: 22 };

/**
 * Button — chunky pressable with per-accent variants.
 * Uses .btn .btn--<variant> classes defined in tokens.css.
 * Style is influenced by the root `data-btn-style` attribute
 * ('chunky' | 'flat' | 'glossy') set by DesignTweaksProvider.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'ghost', size = 'md', icon, iconRight, children, className = '', style, disabled, ...rest },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={`btn btn--${variant} ${className}`}
        disabled={disabled}
        style={{ ...SIZE_MAP[size], opacity: disabled ? 0.5 : 1, ...style }}
        {...rest}
      >
        {icon && <Icon name={icon} size={ICON_SIZE[size]} />}
        {children}
        {iconRight && <Icon name={iconRight} size={ICON_SIZE[size]} />}
      </button>
    );
  },
);
Button.displayName = 'Button';
