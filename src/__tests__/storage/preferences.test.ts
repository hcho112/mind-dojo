// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLastPlayedGame, setLastPlayedGame, getTheme, setTheme } from '@/storage/preferences';

// Mock localStorage for node environment
const store: Record<string, string> = {};
beforeEach(() => {
  Object.keys(store).forEach(key => delete store[key]);
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
  });
});

describe('preferences', () => {
  describe('lastPlayedGame', () => {
    it('returns null when not set', () => {
      expect(getLastPlayedGame()).toBeNull();
    });
    it('stores and retrieves the slug', () => {
      setLastPlayedGame('target-precision');
      expect(getLastPlayedGame()).toBe('target-precision');
    });
  });

  describe('theme', () => {
    it('returns dark as default', () => {
      expect(getTheme()).toBe('dark');
    });
    it('stores and retrieves theme', () => {
      setTheme('light');
      expect(getTheme()).toBe('light');
    });
  });
});
