const KEYS = {
  LAST_PLAYED_GAME: 'mind-dojo:lastPlayedGame',
  THEME: 'mind-dojo:theme',
  SOUND_ENABLED: 'mind-dojo:soundEnabled',
} as const;

export function getLastPlayedGame(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(KEYS.LAST_PLAYED_GAME);
}

export function setLastPlayedGame(slug: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEYS.LAST_PLAYED_GAME, slug);
}

export type Theme = 'dark' | 'light';

export function getTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'dark';
  const stored = localStorage.getItem(KEYS.THEME);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

export function setTheme(theme: Theme): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEYS.THEME, theme);
}

export function getSoundEnabled(): boolean {
  if (typeof localStorage === 'undefined') return true;
  const stored = localStorage.getItem(KEYS.SOUND_ENABLED);
  if (stored === 'false') return false;
  return true; // default: enabled
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEYS.SOUND_ENABLED, String(enabled));
}
