// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { getLevelConfig, getScaledDimensions, GAME_DEFAULTS } from '@/games/target-precision/config';

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
});

describe('getScaledDimensions', () => {
  it('scales dimensions relative to shorter canvas side', () => {
    const dims = getScaledDimensions(800, 600);
    // base = 600 (shorter side)
    expect(dims.outerRadius).toBeCloseTo(600 * 0.15);
    expect(dims.innerRadius).toBeCloseTo(600 * 0.04);
    expect(dims.bullseyeRadius).toBeCloseTo(600 * 0.022);
  });

  it('enforces minimum values on very small screens', () => {
    const dims = getScaledDimensions(200, 150);
    expect(dims.outerRadius).toBeGreaterThanOrEqual(30);
    expect(dims.innerRadius).toBeGreaterThanOrEqual(10);
    expect(dims.bullseyeRadius).toBeGreaterThanOrEqual(6);
    expect(dims.edgePadding).toBeGreaterThanOrEqual(40);
    expect(dims.minTargetDistance).toBeGreaterThanOrEqual(60);
    expect(dims.countdownFontSize).toBeGreaterThanOrEqual(8);
  });

  it('produces larger dimensions for larger screens', () => {
    const small = getScaledDimensions(400, 300);
    const large = getScaledDimensions(1920, 1080);
    expect(large.outerRadius).toBeGreaterThan(small.outerRadius);
    expect(large.innerRadius).toBeGreaterThan(small.innerRadius);
    expect(large.bullseyeRadius).toBeGreaterThan(small.bullseyeRadius);
  });
});
