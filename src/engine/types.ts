export interface GameConfig {
  theme: 'dark' | 'light';
}

export interface GameResult {
  score: number;
  level: number;
  timeOfDeath: number;
  timestamp: number;
}

export type GameEventType =
  | 'scoreChanged'
  | 'lifeLost'
  | 'levelUp'
  | 'gameOver'
  | 'countdown'
  | 'ready';

export interface ScoreChangedEvent {
  score: number;
}

export interface LifeLostEvent {
  livesRemaining: number;
}

export interface LevelUpEvent {
  level: number;
}

export interface GameOverEvent {
  finalScore: number;
  finalLevel: number;
  timeOfDeath: number;
}

export interface CountdownEvent {
  timeRemaining: number;
}

export type GameEventPayload =
  | ScoreChangedEvent
  | LifeLostEvent
  | LevelUpEvent
  | GameOverEvent
  | CountdownEvent
  | undefined;

export type GameEventCallback = (payload: GameEventPayload) => void;

export interface MiniGame {
  init(canvas: HTMLCanvasElement, config: GameConfig): void;
  start(): void;
  pause(): void;
  resume(): void;
  destroy(): void;
  on(event: GameEventType, callback: GameEventCallback): void;
  off(event: GameEventType, callback: GameEventCallback): void;
}
