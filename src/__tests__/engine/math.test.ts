// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { distance, clamp, lerp, lerpColor, hexToRgb, rgbToHex } from '@/engine/math';

describe('distance', () => {
  it('returns 0 for same point', () => {
    expect(distance(5, 5, 5, 5)).toBe(0);
  });
  it('calculates distance between two points', () => {
    expect(distance(0, 0, 3, 4)).toBe(5);
  });
  it('works with negative coordinates', () => {
    expect(distance(-1, -1, 2, 3)).toBe(5);
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it('clamps to min', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });
  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('lerp', () => {
  it('returns start at t=0', () => {
    expect(lerp(0, 100, 0)).toBe(0);
  });
  it('returns end at t=1', () => {
    expect(lerp(0, 100, 1)).toBe(100);
  });
  it('returns midpoint at t=0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });
});

describe('hexToRgb', () => {
  it('converts white', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });
  it('converts green', () => {
    expect(hexToRgb('#22c55e')).toEqual({ r: 34, g: 197, b: 94 });
  });
});

describe('rgbToHex', () => {
  it('converts white', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
  });
  it('converts black', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
  });
});

describe('lerpColor', () => {
  it('returns start color at t=0', () => {
    expect(lerpColor('#000000', '#ffffff', 0)).toBe('#000000');
  });
  it('returns end color at t=1', () => {
    expect(lerpColor('#000000', '#ffffff', 1)).toBe('#ffffff');
  });
  it('returns midpoint gray at t=0.5', () => {
    expect(lerpColor('#000000', '#ffffff', 0.5)).toBe('#808080');
  });
});
