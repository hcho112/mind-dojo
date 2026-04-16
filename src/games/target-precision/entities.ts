import { GAME_DEFAULTS } from './config';
import { lerp } from '@/engine/math';

export class Target {
  x: number = 0;
  y: number = 0;
  active: boolean = false;
  elapsed: number = 0;
  duration: number = 0;

  spawn(x: number, y: number, duration: number): void {
    this.x = x;
    this.y = y;
    this.active = true;
    this.elapsed = 0;
    this.duration = duration;
  }

  reset(): void {
    this.active = false;
    this.elapsed = 0;
  }

  get progress(): number {
    return Math.min(this.elapsed / this.duration, 1);
  }

  get currentOuterRadius(): number {
    return lerp(GAME_DEFAULTS.outerRadius, GAME_DEFAULTS.innerRadius, this.progress);
  }

  get countdownNumber(): number {
    const totalSeconds = Math.ceil(this.duration / 1000);
    const remaining = Math.ceil((this.duration - this.elapsed) / 1000);
    return Math.max(1, Math.min(remaining, totalSeconds));
  }

  get isExpired(): boolean {
    return this.elapsed >= this.duration;
  }
}

export class TargetPool {
  private pool: Target[];

  constructor(size: number) {
    this.pool = Array.from({ length: size }, () => new Target());
  }

  acquire(x: number, y: number, duration: number): Target | null {
    const target = this.pool.find(t => !t.active);
    if (!target) return null;
    target.spawn(x, y, duration);
    return target;
  }

  release(target: Target): void {
    target.reset();
  }

  releaseAll(): void {
    for (const target of this.pool) {
      target.reset();
    }
  }

  get activeTargets(): Target[] {
    return this.pool.filter(t => t.active);
  }
}
