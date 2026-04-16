'use client';

import { useEffect, useState } from 'react';
import { getBestStats, type BestStats } from '@/storage/gameStore';

interface StartScreenProps {
  gameName: string;
  gameSlug: string;
  onStart: () => void;
  visible: boolean;
}

export function StartScreen({ gameName, gameSlug, onStart, visible }: StartScreenProps) {
  const [stats, setStats] = useState<BestStats | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (visible) {
      getBestStats(gameSlug).then((s) => {
        setStats(s);
        setLoaded(true);
      });
    }
  }, [gameSlug, visible]);

  if (!visible) return null;

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center
        bg-[var(--bg)]/90 backdrop-blur-sm cursor-pointer"
      onClick={onStart}
    >
      <h1 className="text-4xl font-bold text-[var(--text)] mb-8">{gameName}</h1>

      {loaded && (
        <div className="flex gap-8 mb-12">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Best Score</p>
            <p className="text-2xl font-mono font-bold text-[var(--text)]">
              {stats ? stats.bestScore.toLocaleString() : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Best Level</p>
            <p className="text-2xl font-mono font-bold text-[var(--text)]">
              {stats ? stats.bestLevel : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Last Time</p>
            <p className="text-2xl font-mono font-bold text-[var(--text)]">
              {stats ? formatTime(stats.lastTimeOfDeath) : '—'}
            </p>
          </div>
        </div>
      )}

      <p className="text-lg text-[var(--text-muted)] animate-pulse">Click anywhere to start</p>
    </div>
  );
}
