'use client';

import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/components/ui/Icon';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        background: 'transparent',
        color: 'var(--text)',
        fontFamily: 'var(--font-display)',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      className="menu-row-hover"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Icon name={theme === 'dark' ? 'eye' : 'eye'} size={18} color="var(--text-muted)" />
      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}
