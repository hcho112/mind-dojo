export const palette = {
  dark: {
    bg: '#0a0a0f',
    surface: '#16161f',
    text: '#e8e8ed',
    textMuted: '#8888a0',
    accent: '#6366f1',
    border: '#2a2a3a',
  },
  light: {
    bg: '#f8f8fc',
    surface: '#ffffff',
    text: '#1a1a2e',
    textMuted: '#6b7280',
    accent: '#4f46e5',
    border: '#e2e2ea',
  },
} as const;

export type ThemeColors = typeof palette.dark;
