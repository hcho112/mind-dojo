const KEYS = {
  LAST_PLAYED_GAME: 'mind-dojo:lastPlayedGame',
  THEME: 'mind-dojo:theme',
} as const;

export function getLastPlayedGame(): string | null {
  return localStorage.getItem(KEYS.LAST_PLAYED_GAME);
}

export function setLastPlayedGame(slug: string): void {
  localStorage.setItem(KEYS.LAST_PLAYED_GAME, slug);
}

export type Theme = 'dark' | 'light';

export function getTheme(): Theme {
  const stored = localStorage.getItem(KEYS.THEME);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(KEYS.THEME, theme);
}
