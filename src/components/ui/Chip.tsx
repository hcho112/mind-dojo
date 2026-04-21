'use client';

import * as React from 'react';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'precision' | 'recall' | 'combo';
  dot?: boolean;
}

export const Chip: React.FC<ChipProps> = ({ tone, dot, className = '', children, ...rest }) => {
  const classes = ['chip', tone && `chip--${tone}`, dot && 'chip--dot', className]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
};
