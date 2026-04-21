import type { ComponentType } from 'react';

export interface GameEntry {
  name: string;
  slug: string;
  description: string;
  icon: string;
  selfManagedGameOver?: boolean; // game handles its own game-over phase (no auto-transition to idle)
  levelLabel?: string; // custom label for level selector (e.g. "Decks" instead of "Start Level")
  hudLevelPrefix?: string; // HUD level prefix (e.g. "Deck" instead of "LV")
  hudShowTimer?: boolean; // whether to show the countdown timer in HUD
  disableBgMusic?: boolean; // auto-mute background music for focus-based games
  timeLabel?: string; // label for time stat on start screen (e.g. "Recall Time" instead of "Last Time")
  alwaysShowLevelSelector?: boolean; // show level selector even at level 1
  accent?: string; // CSS variable for game accent (e.g. 'var(--accent-precision)')
  howToPlay?: string; // short description of how the game works
  loader: () => Promise<{ default: ComponentType<GameComponentProps> }>;
}

export interface GameComponentProps {
  theme: 'dark' | 'light';
  onGameOver: (result: { score: number; level: number; timeOfDeath: number }) => void;
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onLevelChange: (level: number) => void;
  onCountdown: (timeRemaining: number) => void;
  onComboChange: (combo: number) => void;
  engineRef: React.MutableRefObject<{ pause: () => void; resume: () => void; start: (startLevel?: number) => void } | null>;
}

export const registry: Record<string, GameEntry> = {
  'target-precision': {
    name: 'Target Precision',
    slug: 'target-precision',
    description: 'Hit the bullseye before time runs out',
    icon: '/images/game-target-precision.svg',
    accent: 'var(--accent-precision)',
    howToPlay: 'Tap shrinking targets before they expire. Hit early for combos. Miss or tap empty space to lose a life. Survive each level to advance.',
    loader: () => import('./target-precision'),
  },
  'card-recall': {
    name: 'Card Recall',
    slug: 'card-recall',
    description: 'Memorize the card sequence and recall it',
    icon: '/images/game-card-recall.svg',
    accent: 'var(--accent-recall)',
    howToPlay: 'Swipe through a shuffled deck and memorize the order. Then recall each card by picking its suit and value. One wrong guess ends the run.',
    selfManagedGameOver: true,
    levelLabel: 'Decks',
    hudLevelPrefix: 'Deck',
    hudShowTimer: false,
    disableBgMusic: true,
    timeLabel: 'Recall Time',
    alwaysShowLevelSelector: true,
    loader: () => import('./card-recall'),
  },
};

export const DEFAULT_GAME = 'target-precision';

export function getGameSlugs(): string[] {
  return Object.keys(registry);
}

export function getGameEntry(slug: string): GameEntry | undefined {
  return registry[slug];
}
