'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registry } from '@/games/registry';
import { openGameDB, getHistory, getBestStats, type BestStats } from '@/storage/gameStore';
import { LineChart } from '@/components/charts/LineChart';
import type { GameResult } from '@/engine/types';

interface GameStats {
  slug: string;
  name: string;
  icon: string;
  totalGames: number;
  best: BestStats | null;
  history: GameResult[];
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function StatsPage() {
  const router = useRouter();
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string>(Object.keys(registry)[0]);

  useEffect(() => {
    async function loadStats() {
      await openGameDB();
      const stats: GameStats[] = [];

      for (const entry of Object.values(registry)) {
        const [best, history] = await Promise.all([
          getBestStats(entry.slug),
          getHistory(entry.slug),
        ]);
        stats.push({
          slug: entry.slug,
          name: entry.name,
          icon: entry.icon,
          totalGames: history.length,
          best,
          history,
        });
      }

      setGameStats(stats);
      setLoaded(true);
    }
    loadStats();
  }, []);

  const selected = gameStats.find(g => g.slug === selectedSlug);

  // Prepare chart data (oldest first for chronological display)
  const scoreData = selected?.history
    .slice()
    .reverse()
    .map(r => ({
      label: formatDate(r.timestamp),
      value: r.score,
    })) ?? [];

  return (
    <div className="h-dvh overflow-y-auto bg-[var(--bg)]"
      style={{ paddingBottom: 'var(--safe-bottom)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 p-4 bg-[var(--bg)]/90 backdrop-blur-sm border-b border-[var(--border)]">
        <button
          onClick={() => router.back()}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg
            bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text)]">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-[var(--text)]">Progress</h1>
      </div>

      {!loaded ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-[var(--text-muted)] animate-pulse">Loading stats...</p>
        </div>
      ) : (
        <div className="p-4 max-w-lg mx-auto">
          {/* Game selector tabs */}
          {gameStats.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {gameStats.map(g => (
                <button
                  key={g.slug}
                  onClick={() => setSelectedSlug(g.slug)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors
                    ${selectedSlug === g.slug
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30'
                      : 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]'
                    }`}
                >
                  <img src={g.icon} alt="" width={20} height={20} className="rounded" />
                  <span className="text-sm font-medium">{g.name}</span>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Total Games</p>
                  <p className="text-2xl font-mono font-bold text-[var(--text)]">{selected.totalGames}</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Best Score</p>
                  <p className="text-2xl font-mono font-bold text-[var(--text)]">
                    {selected.best?.bestScore.toLocaleString() ?? '—'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Best Level</p>
                  <p className="text-2xl font-mono font-bold text-[var(--text)]">
                    {selected.best?.bestLevel ?? '—'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Last Time</p>
                  <p className="text-2xl font-mono font-bold text-[var(--text)]">
                    {selected.best ? formatTime(selected.best.lastTimeOfDeath) : '—'}
                  </p>
                </div>
              </div>

              {/* Score chart */}
              <LineChart
                title="Score History"
                data={scoreData}
                color="#6366f1"
              />

              {/* Recent games table */}
              {selected.history.length > 0 && (
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Recent Games</h3>
                  <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          <th className="text-left px-3 py-2 text-xs uppercase text-[var(--text-muted)]">Date</th>
                          <th className="text-right px-3 py-2 text-xs uppercase text-[var(--text-muted)]">Score</th>
                          <th className="text-right px-3 py-2 text-xs uppercase text-[var(--text-muted)]">Level</th>
                          <th className="text-right px-3 py-2 text-xs uppercase text-[var(--text-muted)]">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.history.slice(0, 20).map((r, i) => (
                          <tr key={i} className="border-b border-[var(--border)] last:border-0">
                            <td className="px-3 py-2 text-[var(--text-muted)]">{formatDateTime(r.timestamp)}</td>
                            <td className="px-3 py-2 text-right font-mono text-[var(--text)]">{r.score.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right font-mono text-[var(--text)]">{r.level}</td>
                            <td className="px-3 py-2 text-right font-mono text-[var(--text)]">{formatTime(r.timeOfDeath)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
