// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TargetPrecisionEngine } from '@/games/target-precision/engine';
import type { GameConfig } from '@/engine/types';

function createMockCanvas(): HTMLCanvasElement {
  const listeners: Record<string, EventListener[]> = {};
  return {
    addEventListener: vi.fn((type: string, listener: EventListener) => {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(listener);
    }),
    removeEventListener: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({
      left: 0, top: 0, width: 800, height: 600,
      right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {},
    })),
    getContext: vi.fn(() => ({
      fillRect: vi.fn(), fillText: vi.fn(), beginPath: vi.fn(),
      arc: vi.fn(), fill: vi.fn(), stroke: vi.fn(), scale: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      save: vi.fn(), restore: vi.fn(),
      fillStyle: '', strokeStyle: '', lineWidth: 0,
      font: '', textAlign: '', textBaseline: '',
    })),
    width: 800, height: 600,
    __listeners: listeners,
  } as unknown as HTMLCanvasElement & { __listeners: Record<string, EventListener[]> };
}

describe('TargetPrecisionEngine', () => {
  let engine: TargetPrecisionEngine;
  let canvas: ReturnType<typeof createMockCanvas>;
  const config: GameConfig = { theme: 'dark' };

  beforeEach(() => {
    vi.stubGlobal('devicePixelRatio', 1);
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('window', { devicePixelRatio: 1 });
    canvas = createMockCanvas();
    engine = new TargetPrecisionEngine();
  });

  it('emits ready after init', () => {
    const readyCb = vi.fn();
    engine.on('ready', readyCb);
    engine.init(canvas, config);
    expect(readyCb).toHaveBeenCalled();
  });

  it('starts with correct initial state', () => {
    engine.init(canvas, config);
    engine.start();
    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it('emits lifeLost when target expires', () => {
    const lifeLostCb = vi.fn();
    engine.on('lifeLost', lifeLostCb);
    engine.init(canvas, config);
    engine.start();
    // First update spawns targets, second update expires them (shrinkDuration = 5000ms)
    engine._testUpdate(100);
    engine._testUpdate(6000);
    expect(lifeLostCb).toHaveBeenCalledWith(
      expect.objectContaining({ livesRemaining: expect.any(Number) }),
    );
  });

  it('emits gameOver when all lives lost', () => {
    const gameOverCb = vi.fn();
    engine.on('gameOver', gameOverCb);
    engine.init(canvas, config);
    engine.start();
    // Spawn targets then expire them repeatedly until all 3 lives are lost
    engine._testUpdate(100);
    engine._testUpdate(6000);
    engine._testUpdate(100);
    engine._testUpdate(6000);
    engine._testUpdate(100);
    engine._testUpdate(6000);
    expect(gameOverCb).toHaveBeenCalledWith(
      expect.objectContaining({
        finalScore: expect.any(Number),
        finalLevel: expect.any(Number),
        timeOfDeath: expect.any(Number),
      }),
    );
  });

  it('emits scoreChanged on bullseye hit', () => {
    const scoreCb = vi.fn();
    engine.on('scoreChanged', scoreCb);
    engine.init(canvas, config);
    engine.start();
    engine._testUpdate(100);
    const targets = engine._testGetActiveTargets();
    if (targets.length > 0) {
      const target = targets[0];
      engine._testHandleClick(target.x, target.y);
      expect(scoreCb).toHaveBeenCalledWith(
        expect.objectContaining({ score: expect.any(Number) }),
      );
    }
  });

  it('cleans up on destroy', () => {
    engine.init(canvas, config);
    engine.start();
    engine.destroy();
    expect(cancelAnimationFrame).toHaveBeenCalled();
    expect(canvas.removeEventListener).toHaveBeenCalled();
  });

  it('can register and unregister event callbacks', () => {
    const cb = vi.fn();
    engine.on('scoreChanged', cb);
    engine.off('scoreChanged', cb);
    engine.init(canvas, config);
    engine.start();
    engine._testUpdate(100);
    const targets = engine._testGetActiveTargets();
    if (targets.length > 0) {
      engine._testHandleClick(targets[0].x, targets[0].y);
    }
    expect(cb).not.toHaveBeenCalled();
  });
});
