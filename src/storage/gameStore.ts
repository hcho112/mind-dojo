import type { GameResult } from '@/engine/types';

const DB_NAME = 'mind-dojo';
const DB_VERSION = 1;
const STORE_NAME = 'gameResults';

let dbPromise: Promise<IDBDatabase> | null = null;

export interface BestStats {
  bestScore: number;
  bestLevel: number;
  lastTimeOfDeath: number;
}

interface StoredResult extends GameResult {
  gameSlug: string;
}

/** Reset the cached DB connection. Used in tests to force a fresh open. */
export function resetDB(): void {
  dbPromise = null;
}

export function openGameDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('gameSlug', 'gameSlug', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export async function saveResult(gameSlug: string, result: GameResult): Promise<void> {
  const db = await openGameDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const stored: StoredResult = { ...result, gameSlug };
  store.add(stored);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getBestStats(gameSlug: string): Promise<BestStats | null> {
  const db = await openGameDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('gameSlug');
  const request = index.getAll(gameSlug);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const results: StoredResult[] = request.result;
      if (results.length === 0) {
        resolve(null);
        return;
      }

      let bestScore = 0;
      let bestLevel = 0;
      let latestTimestamp = 0;
      let lastTimeOfDeath = 0;

      for (const r of results) {
        if (r.score > bestScore) bestScore = r.score;
        if (r.level > bestLevel) bestLevel = r.level;
        if (r.timestamp > latestTimestamp) {
          latestTimestamp = r.timestamp;
          lastTimeOfDeath = r.timeOfDeath;
        }
      }

      resolve({ bestScore, bestLevel, lastTimeOfDeath });
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getHistory(
  gameSlug: string,
  limit?: number,
): Promise<GameResult[]> {
  const db = await openGameDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('gameSlug');
  const request = index.getAll(gameSlug);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const results: StoredResult[] = request.result;
      results.sort((a, b) => b.timestamp - a.timestamp);
      const limited = limit ? results.slice(0, limit) : results;
      resolve(
        limited.map(({ gameSlug: _, ...rest }) => rest as GameResult),
      );
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getAllResults(): Promise<GameResult[]> {
  const db = await openGameDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const results: StoredResult[] = request.result;
      results.sort((a, b) => b.timestamp - a.timestamp);
      resolve(results.map(({ gameSlug: _, ...rest }) => rest as GameResult));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getTotalGamesPlayed(): Promise<number> {
  const db = await openGameDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const request = store.count();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
