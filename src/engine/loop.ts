const MAX_DELTA = 100;

export class GameLoop {
  private rafId: number | null = null;
  private lastTimestamp: number = 0;
  private paused: boolean = false;
  private update: (deltaTime: number) => void;

  constructor(update: (deltaTime: number) => void) {
    this.update = update;
  }

  start(): void {
    this.paused = false;
    this.lastTimestamp = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastTimestamp = 0;
    this.paused = false;
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  private tick = (timestamp: number): void => {
    this.rafId = requestAnimationFrame(this.tick);

    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      return;
    }

    if (this.paused) {
      this.lastTimestamp = timestamp;
      return;
    }

    const rawDelta = timestamp - this.lastTimestamp;
    const deltaTime = Math.min(rawDelta, MAX_DELTA);
    this.lastTimestamp = timestamp;

    this.update(deltaTime);
  };
}
