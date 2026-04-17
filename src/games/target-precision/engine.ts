import type {
  MiniGame, GameConfig, GameEventType, GameEventCallback, GameEventPayload,
} from '@/engine/types';
import { GameLoop } from '@/engine/loop';
import { InputHandler } from '@/engine/input';
import { distance } from '@/engine/math';
import { TargetPool, Target } from './entities';
import { TargetPrecisionRenderer } from './renderer';
import { getLevelConfig, GAME_DEFAULTS, type LevelConfig } from './config';
import { audioManager } from '@/engine/audio';

type EventListeners = Record<GameEventType, GameEventCallback[]>;

export class TargetPrecisionEngine implements MiniGame {
  private canvas!: HTMLCanvasElement;
  private renderer!: TargetPrecisionRenderer;
  private gameLoop!: GameLoop;
  private inputHandler!: InputHandler;
  private pool!: TargetPool;
  private config!: GameConfig;

  private score: number = 0;
  private lives: number = GAME_DEFAULTS.initialLives;
  private level: number = 1;
  private levelConfig!: LevelConfig;
  private levelTimeRemaining: number = 0;
  private running: boolean = false;
  private gameOver: boolean = false;

  private vignetteIntensity: number = 0;
  private combo: number = 0;
  private comboDisplay = { opacity: 0, scale: 1, text: '', age: 0, fading: false };

  private listeners: EventListeners = {
    scoreChanged: [], lifeLost: [], levelUp: [], gameOver: [], countdown: [], comboChanged: [], ready: [],
  };

  private lastCountdownSecond: number = -1;

  init(canvas: HTMLCanvasElement, config: GameConfig): void {
    this.canvas = canvas;
    this.config = config;
    this.renderer = new TargetPrecisionRenderer(canvas, config.theme);
    this.pool = new TargetPool(20);
    this.gameLoop = new GameLoop(this.update);
    this.inputHandler = new InputHandler(canvas, this.handleClick);
    this.resetState();
    this.renderer.clear();
    this.emit('ready', undefined);
  }

  start(startLevel: number = 1): void {
    this.resetState();
    this.level = startLevel;
    this.running = true;
    this.gameOver = false;
    this.levelConfig = getLevelConfig(this.level);
    this.levelTimeRemaining = this.levelConfig.levelDuration;
    this.lastCountdownSecond = Math.ceil(this.levelTimeRemaining / 1000);
    this.gameLoop.start();
  }

  pause(): void { this.gameLoop.pause(); }
  resume(): void { this.gameLoop.resume(); }

  get isRunning(): boolean { return this.running && !this.gameOver; }

  resize(): void {
    this.renderer.setupCanvas();
    if (!this.running) {
      this.renderer.clear();
    }
  }

  setTheme(theme: GameConfig['theme']): void {
    this.config = { ...this.config, theme };
    this.renderer.setTheme(theme);
    if (!this.running) {
      this.renderer.clear();
    }
  }

  destroy(): void {
    this.gameLoop.stop();
    this.inputHandler.destroy();
    this.pool.releaseAll();
  }

  on(event: GameEventType, callback: GameEventCallback): void {
    this.listeners[event].push(callback);
  }

  off(event: GameEventType, callback: GameEventCallback): void {
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  private emit(event: GameEventType, payload: GameEventPayload): void {
    for (const cb of this.listeners[event]) { cb(payload); }
  }

  private resetState(): void {
    this.score = 0;
    this.lives = GAME_DEFAULTS.initialLives;
    this.level = 1;
    this.running = false;
    this.gameOver = false;
    this.vignetteIntensity = 0;
    this.combo = 0;
    this.comboDisplay = { opacity: 0, scale: 1, text: '', age: 0, fading: false };
    this.pool.releaseAll();
  }

  private update = (deltaTime: number): void => {
    if (!this.running || this.gameOver) return;

    this.levelTimeRemaining -= deltaTime;
    const currentSecond = Math.ceil(this.levelTimeRemaining / 1000);
    if (currentSecond !== this.lastCountdownSecond) {
      this.lastCountdownSecond = currentSecond;
      this.emit('countdown', { timeRemaining: Math.max(0, this.levelTimeRemaining / 1000) });
    }

    if (this.levelTimeRemaining <= 0) { this.advanceLevel(); return; }

    const activeTargets = this.pool.activeTargets;
    for (const target of activeTargets) {
      target.elapsed += deltaTime;
      if (target.isExpired) {
        this.pool.release(target);
        this.loseLife();
        if (this.gameOver) return;
      }
    }

    this.spawnTargets();
    this.updateEffects(deltaTime);
    this.render();
  };

  private spawnTargets(): void {
    const active = this.pool.activeTargets;
    while (active.length < this.levelConfig.maxTargets) {
      const pos = this.findSpawnPosition(active);
      if (!pos) break;
      const target = this.pool.acquire(pos.x, pos.y, this.levelConfig.shrinkDuration);
      if (!target) break;
      active.push(target);
    }
  }

  private findSpawnPosition(activeTargets: Target[]): { x: number; y: number } | null {
    const dims = this.renderer.scaledDimensions;
    const leftPad = dims.edgePadding;
    const rightPad = dims.edgePadding;
    const topPad = dims.topPadding;
    const bottomPad = dims.bottomPadding;
    const w = this.renderer.width;
    const h = this.renderer.height;
    const minDist = dims.minTargetDistance;

    for (let attempt = 0; attempt < 50; attempt++) {
      const x = leftPad + Math.random() * (w - leftPad - rightPad);
      const y = topPad + Math.random() * (h - topPad - bottomPad);
      let valid = true;
      for (const target of activeTargets) {
        if (distance(x, y, target.x, target.y) < minDist) { valid = false; break; }
      }
      if (valid) return { x, y };
    }
    return null;
  }

  private handleClick = (x: number, y: number): void => {
    if (!this.running || this.gameOver) return;
    const dims = this.renderer.scaledDimensions;
    const targets = this.pool.activeTargets;
    let closestTarget: Target | null = null;
    let closestDist = Infinity;

    for (const target of targets) {
      const dist = distance(x, y, target.x, target.y);
      if (dist < closestDist) { closestDist = dist; closestTarget = target; }
    }

    if (closestTarget && closestDist <= closestTarget.currentOuterRadius(dims)) {
      // Hit — score based on distance
      const outerR = closestTarget.currentOuterRadius(dims);
      const accuracyMultiplier = Math.max(0.1, 1 - (closestDist / outerR));
      const timeRatio = 1 - closestTarget.progress;
      const speedMultiplier = 0.5 + timeRatio * 0.5;

      // Combo: builds when hitting targets with countdown >= 4 (early hits)
      const countdown = closestTarget.countdownNumber;
      if (countdown >= 4) {
        this.combo++;
        if (this.combo >= 2) {
          // Pop in combo text
          this.comboDisplay = {
            opacity: 1,
            scale: 1.8,
            text: `x${this.combo}`,
            age: 0,
            fading: false,
          };
        }
      } else {
        if (this.combo >= 2) {
          // Fade out the existing combo
          this.comboDisplay.fading = true;
          this.comboDisplay.age = 0;
        }
        this.combo = 0;
      }
      this.emit('comboChanged', { combo: this.combo });

      const comboMultiplier = 1 + this.combo * 0.1; // +10% per combo
      const basePoints = GAME_DEFAULTS.basePoints * this.level;
      const points = Math.round(accuracyMultiplier * speedMultiplier * comboMultiplier * basePoints);

      this.score += points;
      this.emit('scoreChanged', { score: this.score });
      audioManager.playSfx('pop');
      this.pool.release(closestTarget);
    } else {
      // Miss — clicked empty space, lose a life
      if (this.combo >= 2) {
        this.comboDisplay.fading = true;
        this.comboDisplay.age = 0;
      }
      this.combo = 0;
      this.emit('comboChanged', { combo: 0 });
      this.loseLife();
    }
  };

  private loseLife(): void {
    this.lives--;
    this.vignetteIntensity = 1;
    this.emit('lifeLost', { livesRemaining: this.lives });
    if (this.lives <= 0) {
      this.running = false;
      this.gameOver = true;
      this.emit('gameOver', {
        finalScore: this.score, finalLevel: this.level,
        timeOfDeath: Math.max(0, this.levelTimeRemaining / 1000),
      });
    }
  }

  private advanceLevel(): void {
    if (this.combo >= 2) {
      this.comboDisplay.fading = true;
      this.comboDisplay.age = 0;
    }
    this.level++;
    this.pool.releaseAll();
    this.levelConfig = getLevelConfig(this.level);
    this.levelTimeRemaining = this.levelConfig.levelDuration;
    this.lastCountdownSecond = Math.ceil(this.levelTimeRemaining / 1000);
    this.gameLoop.pause();
    this.emit('levelUp', { level: this.level });
    this.emit('countdown', { timeRemaining: this.levelTimeRemaining / 1000 });
  }

  private updateEffects(deltaTime: number): void {
    if (this.vignetteIntensity > 0) {
      this.vignetteIntensity = Math.max(0, this.vignetteIntensity - deltaTime / 500);
    }

    // Combo display animation
    const cd = this.comboDisplay;
    if (cd.opacity > 0) {
      cd.age += deltaTime;
      if (cd.fading) {
        // Fade out over 800ms
        cd.opacity = Math.max(0, 1 - cd.age / 800);
        cd.scale = 1 + cd.age / 2000; // slowly drift larger as it fades
      } else {
        // Pop in: scale springs from 1.8 down to 1.0 over 200ms, then hold
        const popDuration = 200;
        if (cd.age < popDuration) {
          const t = cd.age / popDuration;
          cd.scale = 1.8 - 0.8 * t; // 1.8 → 1.0
        } else {
          cd.scale = 1;
        }
      }
    }
  }

  private render(): void {
    this.renderer.clear();
    // Draw combo behind targets
    const cd = this.comboDisplay;
    if (cd.opacity > 0) {
      this.renderer.drawCombo(cd.text, cd.opacity, cd.scale, this.combo);
    }
    this.renderer.drawTargets(this.pool.activeTargets);
    this.renderer.drawLifeLostVignette(this.vignetteIntensity);
  }

  // Test-only methods
  _testUpdate(deltaTime: number): void { this.update(deltaTime); }
  _testGetActiveTargets(): Target[] { return this.pool.activeTargets; }
  _testHandleClick(x: number, y: number): void { this.handleClick(x, y); }
}
