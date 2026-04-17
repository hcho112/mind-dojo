'use client';

import { useEffect, useState } from 'react';
import { getBestStats, type BestStats } from '@/storage/gameStore';

interface StartScreenProps {
  gameName: string;
  gameSlug: string;
  gameIcon: string;
  levelLabel?: string;
  alwaysShowLevelSelector?: boolean;
  onStart: (startLevel: number) => void;
  onMenuOpen: () => void;
  visible: boolean;
}

export function StartScreen({
  gameName, gameSlug, gameIcon, levelLabel, alwaysShowLevelSelector,
  onStart, onMenuOpen, visible,
}: StartScreenProps) {
  const [stats, setStats] = useState<BestStats | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);

  useEffect(() => {
    if (visible) {
      getBestStats(gameSlug).then((s) => {
        setStats(s);
        setLoaded(true);
      });
    }
  }, [gameSlug, visible]);

  if (!visible) return null;

  // For alwaysShowLevelSelector games, allow going beyond best level (e.g. pick any deck count)
  const maxLevel = alwaysShowLevelSelector
    ? Math.max(10, (stats?.bestLevel ?? 1) + 1)
    : (stats?.bestLevel ?? 1);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleLevelDown = () => {
    setSelectedLevel((prev) => Math.max(1, prev - 1));
  };

  const handleLevelUp = () => {
    setSelectedLevel((prev) => Math.min(maxLevel, prev + 1));
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center
      bg-[var(--bg)]/90 backdrop-blur-sm"
      style={{ paddingBottom: 'var(--safe-bottom)' }}>
      {/* Menu button */}
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

      {/* Main content */}
      <div className="px-6 flex flex-col items-center">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <img src={gameIcon} alt="" width={72} height={72} className="mb-4 rounded-2xl" />
          <h1 className="text-2xl sm:text-4xl font-bold text-[var(--text)] text-center">{gameName}</h1>
        </div>

        {loaded && (
          <div className="flex gap-4 sm:gap-8 mb-6 sm:mb-8">
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

        {/* Level selector */}
        {(alwaysShowLevelSelector || maxLevel > 1) && (
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <button
              onClick={handleLevelDown}
              disabled={selectedLevel <= 1}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg
                bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20
                disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Lower level"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text)]">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="text-center min-w-[100px]">
              <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-0.5">{levelLabel || 'Start Level'}</p>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-[var(--accent)]">{selectedLevel}</p>
            </div>

            <button
              onClick={handleLevelUp}
              disabled={selectedLevel >= maxLevel}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg
                bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20
                disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Higher level"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text)]">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

        {/* Start button */}
        <button
          onClick={() => onStart(selectedLevel)}
          className="px-8 py-3 rounded-xl bg-[var(--accent)] text-white font-bold text-base sm:text-lg
            hover:opacity-90 active:scale-95 transition-all"
        >
          {selectedLevel > 1 ? `Start Level ${selectedLevel}` : 'Start Game'}
        </button>
      </div>
    </div>
  );
}
