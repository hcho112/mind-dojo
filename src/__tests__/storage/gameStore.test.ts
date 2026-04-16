// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { saveResult, getBestStats, getHistory, resetDB } from '@/storage/gameStore';
import type { GameResult } from '@/engine/types';

beforeEach(() => {
  // Replace the global indexedDB with a fresh in-memory instance before each test
  // so tests don't share state. fake-indexeddb exports IDBFactory for this purpose.
  const { IDBFactory } = require('fake-indexeddb');
  vi.stubGlobal('indexedDB', new IDBFactory());
  // Reset the module-level dbPromise so openGameDB() re-opens on the fresh instance
  resetDB();
});

describe('gameStore', () => {
  it('returns empty stats when no results exist', async () => {
    const stats = await getBestStats('target-precision');
    expect(stats).toBeNull();
  });

  it('saves and retrieves best stats', async () => {
    const result: GameResult = {
      score: 100, level: 3, timeOfDeath: 15, timestamp: Date.now(),
    };
    await saveResult('target-precision', result);
    const stats = await getBestStats('target-precision');
    expect(stats).not.toBeNull();
    expect(stats!.bestScore).toBe(100);
    expect(stats!.bestLevel).toBe(3);
    expect(stats!.lastTimeOfDeath).toBe(15);
  });

  it('returns highest score and level across multiple results', async () => {
    await saveResult('target-precision', { score: 100, level: 3, timeOfDeath: 15, timestamp: 1000 });
    await saveResult('target-precision', { score: 250, level: 5, timeOfDeath: 8, timestamp: 2000 });
    await saveResult('target-precision', { score: 80, level: 2, timeOfDeath: 22, timestamp: 3000 });
    const stats = await getBestStats('target-precision');
    expect(stats!.bestScore).toBe(250);
    expect(stats!.bestLevel).toBe(5);
    expect(stats!.lastTimeOfDeath).toBe(22);
  });

  it('isolates stats by game slug', async () => {
    await saveResult('target-precision', { score: 100, level: 3, timeOfDeath: 15, timestamp: 1000 });
    await saveResult('other-game', { score: 500, level: 10, timeOfDeath: 5, timestamp: 2000 });
    const stats = await getBestStats('target-precision');
    expect(stats!.bestScore).toBe(100);
  });

  it('returns history ordered by most recent first', async () => {
    await saveResult('target-precision', { score: 100, level: 3, timeOfDeath: 15, timestamp: 1000 });
    await saveResult('target-precision', { score: 250, level: 5, timeOfDeath: 8, timestamp: 2000 });
    const history = await getHistory('target-precision');
    expect(history).toHaveLength(2);
    expect(history[0].score).toBe(250);
    expect(history[1].score).toBe(100);
  });

  it('limits history results', async () => {
    for (let i = 0; i < 10; i++) {
      await saveResult('target-precision', { score: i * 10, level: 1, timeOfDeath: 20, timestamp: i * 1000 });
    }
    const history = await getHistory('target-precision', 3);
    expect(history).toHaveLength(3);
  });
});
