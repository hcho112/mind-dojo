// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { getLevelConfig, GAME_DEFAULTS } from '@/games/target-precision/config';

describe('getLevelConfig', () => {
  it('returns level 1 config', () => {
    const config = getLevelConfig(1);
    expect(config.maxTargets).toBe(1);
    expect(config.shrinkDuration).toBe(5000);
    expect(config.levelDuration).toBe(30000);
  });
  it('returns level 2 config with more targets and faster shrink', () => {
    const config = getLevelConfig(2);
    expect(config.maxTargets).toBe(2);
    expect(config.shrinkDuration).toBeLessThan(5000);
    expect(config.levelDuration).toBe(30000);
  });
  it('returns level 3 config with longer level duration', () => {
    const config = getLevelConfig(3);
    expect(config.maxTargets).toBe(3);
    expect(config.levelDuration).toBe(35000);
  });
  it('escalates beyond defined levels using formula', () => {
    const config = getLevelConfig(10);
    expect(config.maxTargets).toBeGreaterThan(3);
    expect(config.shrinkDuration).toBeLessThan(4000);
  });
  it('never goes below minimum shrink duration', () => {
    const config = getLevelConfig(100);
    expect(config.shrinkDuration).toBeGreaterThanOrEqual(GAME_DEFAULTS.minShrinkDuration);
  });
});

describe('GAME_DEFAULTS', () => {
  it('has correct initial lives', () => { expect(GAME_DEFAULTS.initialLives).toBe(3); });
  it('has bullseye hit radius', () => { expect(GAME_DEFAULTS.bullseyeRadius).toBe(8); });
  it('has inner circle radius', () => { expect(GAME_DEFAULTS.innerRadius).toBe(15); });
  it('has outer circle radius', () => { expect(GAME_DEFAULTS.outerRadius).toBe(60); });
});
