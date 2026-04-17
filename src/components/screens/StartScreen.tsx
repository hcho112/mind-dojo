'use client';

import { useEffect, useState } from 'react';
import { getBestStats, type BestStats } from '@/storage/gameStore';

interface StartScreenProps {
  gameName: string;
  gameSlug: string;
  onStart: () => void;
  onMenuOpen: () => void;
  visible: boolean;
}

export function StartScreen({ gameName, gameSlug, onStart, onMenuOpen, visible }: StartScreenProps) {
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
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center
      bg-[var(--bg)]/90 backdrop-blur-sm">
      {/* Menu button — top left, 44px minimum touch target */}
      <div className="absolute top-4 left-4">
        <button
          onClick={onMenuOpen}
          className="p-3 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center
            bg-black/10 dark:bg-white/10
            hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" className="text-[var(--text)]">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Main content — clickable/tappable to start */}
      <div className="cursor-pointer px-6" onClick={onStart}>
        <h1 className="text-2xl sm:text-4xl font-bold text-[var(--text)] mb-6 sm:mb-8 text-center">{gameName}</h1>

        {loaded && (
          <div className="flex gap-4 sm:gap-8 mb-8 sm:mb-12">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Best Score</p>
              <p className="text-lg sm:text-2xl font-mono font-bold text-[var(--text)]">
                {stats ? stats.bestScore.toLocaleString() : '—'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Best Level</p>
              <p className="text-lg sm:text-2xl font-mono font-bold text-[var(--text)]">
                {stats ? stats.bestLevel : '—'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Last Time</p>
              <p className="text-lg sm:text-2xl font-mono font-bold text-[var(--text)]">
                {stats ? formatTime(stats.lastTimeOfDeath) : '—'}
              </p>
            </div>
          </div>
        )}

        <p className="text-base sm:text-lg text-[var(--text-muted)] animate-pulse text-center">Tap to start</p>
      </div>
    </div>
  );
}
