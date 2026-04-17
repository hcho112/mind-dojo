import type { ComponentType } from 'react';

export interface GameEntry {
  name: string;
  slug: string;
  description: string;
  icon: string;
  loader: () => Promise<{ default: ComponentType<GameComponentProps> }>;
}

export interface GameComponentProps {
  theme: 'dark' | 'light';
  onGameOver: (result: { score: number; level: number; timeOfDeath: number }) => void;
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onLevelChange: (level: number) => void;
  onCountdown: (timeRemaining: number) => void;
  engineRef: React.MutableRefObject<{ pause: () => void; resume: () => void; start: (startLevel?: number) => void } | null>;
}

export const registry: Record<string, GameEntry> = {
  'target-precision': {
    name: 'Target Precision',
    slug: 'target-precision',
    description: 'Hit the bullseye before time runs out',
    icon: '/images/game-target-precision.svg',
    loader: () => import('./target-precision'),
  },
  'card-recall': {
    name: 'Card Recall',
    slug: 'card-recall',
    description: 'Memorize the card sequence and recall it',
    icon: '/images/game-card-recall.svg',
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
