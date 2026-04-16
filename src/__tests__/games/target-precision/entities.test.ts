// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { Target, TargetPool } from '@/games/target-precision/entities';
import { GAME_DEFAULTS } from '@/games/target-precision/config';

describe('Target', () => {
  it('initializes with correct properties', () => {
    const target = new Target();
    target.spawn(100, 200, 5000);
    expect(target.x).toBe(100);
    expect(target.y).toBe(200);
    expect(target.active).toBe(true);
    expect(target.elapsed).toBe(0);
    expect(target.duration).toBe(5000);
  });
  it('calculates progress as elapsed / duration', () => {
    const target = new Target();
    target.spawn(0, 0, 4000);
    target.elapsed = 2000;
    expect(target.progress).toBeCloseTo(0.5);
  });
  it('calculates outer radius based on progress', () => {
    const target = new Target();
    target.spawn(0, 0, 4000);
    target.elapsed = 0;
    expect(target.currentOuterRadius).toBe(GAME_DEFAULTS.outerRadius);
    target.elapsed = 4000;
    expect(target.currentOuterRadius).toBeCloseTo(GAME_DEFAULTS.innerRadius);
  });
  it('calculates countdown number', () => {
    const target = new Target();
    target.spawn(0, 0, 5000);
    target.elapsed = 0;
    expect(target.countdownNumber).toBe(5);
    target.elapsed = 1500;
    expect(target.countdownNumber).toBe(4);
    target.elapsed = 4999;
    expect(target.countdownNumber).toBe(1);
  });
  it('reports expired when elapsed >= duration', () => {
    const target = new Target();
    target.spawn(0, 0, 3000);
    target.elapsed = 2999;
    expect(target.isExpired).toBe(false);
    target.elapsed = 3000;
    expect(target.isExpired).toBe(true);
  });
  it('deactivates on reset', () => {
    const target = new Target();
    target.spawn(100, 200, 5000);
    target.reset();
    expect(target.active).toBe(false);
    expect(target.elapsed).toBe(0);
  });
});

describe('TargetPool', () => {
  it('acquires targets from the pool', () => {
    const pool = new TargetPool(5);
    const target = pool.acquire(100, 200, 4000);
    expect(target).not.toBeNull();
    expect(target!.x).toBe(100);
    expect(target!.active).toBe(true);
  });
  it('returns null when pool is exhausted', () => {
    const pool = new TargetPool(1);
    pool.acquire(0, 0, 1000);
    const second = pool.acquire(50, 50, 1000);
    expect(second).toBeNull();
  });
  it('recycles released targets', () => {
    const pool = new TargetPool(1);
    const target = pool.acquire(0, 0, 1000);
    pool.release(target!);
    const reused = pool.acquire(50, 50, 2000);
    expect(reused).not.toBeNull();
    expect(reused!.x).toBe(50);
  });
  it('returns all active targets', () => {
    const pool = new TargetPool(5);
    pool.acquire(0, 0, 1000);
    pool.acquire(50, 50, 1000);
    expect(pool.activeTargets).toHaveLength(2);
  });
  it('releaseAll resets all targets', () => {
    const pool = new TargetPool(5);
    pool.acquire(0, 0, 1000);
    pool.acquire(50, 50, 1000);
    pool.releaseAll();
    expect(pool.activeTargets).toHaveLength(0);
  });
});
