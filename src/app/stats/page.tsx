'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registry } from '@/games/registry';
import { openGameDB, getHistory, getBestStats, type BestStats } from '@/storage/gameStore';
import { LineChart } from '@/components/charts/LineChart';
import { Icon } from '@/components/ui/Icon';
import type { GameResult } from '@/engine/types';

interface GameStats {
  slug: string;
  name: string;
  icon: string;
  accent: string;
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

const statCardStyle: React.CSSProperties = {
  padding: '14px 12px',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-elev)',
  border: '1px solid var(--stroke)',
};

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
          accent: entry.accent || 'var(--accent-precision)',
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

  const scoreData = selected?.history
    .slice()
    .reverse()
    .map(r => ({
      label: formatDate(r.timestamp),
      value: r.score,
    })) ?? [];

  return (
    <div
      style={{
        height: '100dvh',
        overflowY: 'auto',
        background: 'var(--bg)',
        paddingBottom: 'max(24px, var(--safe-bottom))',
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderBottom: '1px solid var(--stroke)',
          background: 'color-mix(in oklch, var(--bg) 80%, transparent)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--stroke-strong)',
            background: 'color-mix(in oklch, var(--bg-elev) 85%, transparent)',
            color: 'var(--text)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          aria-label="Go back"
        >
          <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
            <Icon name="arrow" size={18} />
          </span>
        </button>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: '-0.02em',
          }}
        >
          Progress
        </h1>
      </div>

      {!loaded ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 256,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Loading stats...
        </div>
      ) : (
        <div style={{ padding: 16, maxWidth: 500, margin: '0 auto' }}>
          {/* Game selector tabs */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 24,
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {gameStats.map(g => {
              const isActive = selectedSlug === g.slug;
              return (
                <button
                  key={g.slug}
                  onClick={() => setSelectedSlug(g.slug)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: 13,
                    border: `1.5px solid ${isActive ? g.accent : 'var(--stroke)'}`,
                    background: isActive
                      ? `color-mix(in oklch, ${g.accent} 12%, transparent)`
                      : 'var(--bg-elev)',
                    color: isActive ? g.accent : 'var(--text)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <img src={g.icon} alt="" width={22} height={22} style={{ borderRadius: 6 }} />
                  {g.name}
                </button>
              );
            })}
          </div>

          {selected && (
            <>
              {/* Summary cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                <div style={statCardStyle}>
                  <div className="eyebrow" style={{ marginBottom: 4 }}>Total Games</div>
                  <div
                    className="tabular"
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: 24,
                      fontWeight: 700,
                      color: selected.accent,
                    }}
                  >
                    {selected.totalGames}
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div className="eyebrow" style={{ marginBottom: 4 }}>Best Score</div>
                  <div
                    className="tabular"
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: 24,
                      fontWeight: 700,
                      color: selected.accent,
                    }}
                  >
                    {selected.best?.bestScore.toLocaleString() ?? '—'}
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div className="eyebrow" style={{ marginBottom: 4 }}>Best Level</div>
                  <div
                    className="tabular"
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: 24,
                      fontWeight: 700,
                      color: selected.accent,
                    }}
                  >
                    {selected.best?.bestLevel ?? '—'}
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div className="eyebrow" style={{ marginBottom: 4 }}>Last Time</div>
                  <div
                    className="tabular"
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: 24,
                      fontWeight: 700,
                      color: selected.accent,
                    }}
                  >
                    {selected.best ? formatTime(selected.best.lastTimeOfDeath) : '—'}
                  </div>
                </div>
              </div>

              {/* Score chart */}
              <LineChart
                title="Score History"
                data={scoreData}
                color={selected.accent}
              />

              {/* Recent games table */}
              {selected.history.length > 0 && (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 8, paddingLeft: 2 }}>Recent Games</div>
                  <div
                    style={{
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elev)',
                      border: '1px solid var(--stroke)',
                      overflow: 'hidden',
                    }}
                  >
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--stroke)' }}>
                          <th
                            className="eyebrow"
                            style={{ textAlign: 'left', padding: '10px 12px', fontSize: 9 }}
                          >
                            Date
                          </th>
                          <th
                            className="eyebrow"
                            style={{ textAlign: 'right', padding: '10px 12px', fontSize: 9 }}
                          >
                            Score
                          </th>
                          <th
                            className="eyebrow"
                            style={{ textAlign: 'right', padding: '10px 12px', fontSize: 9 }}
                          >
                            Level
                          </th>
                          <th
                            className="eyebrow"
                            style={{ textAlign: 'right', padding: '10px 12px', fontSize: 9 }}
                          >
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.history.slice(0, 20).map((r, i) => (
                          <tr
                            key={i}
                            style={{
                              borderBottom: i < Math.min(selected.history.length, 20) - 1
                                ? '1px solid var(--stroke)'
                                : 'none',
                            }}
                          >
                            <td
                              style={{
                                padding: '10px 12px',
                                color: 'var(--text-muted)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 12,
                              }}
                            >
                              {formatDateTime(r.timestamp)}
                            </td>
                            <td
                              className="tabular"
                              style={{
                                padding: '10px 12px',
                                textAlign: 'right',
                                fontFamily: 'var(--font-pixel)',
                                fontWeight: 700,
                                color: selected.accent,
                              }}
                            >
                              {r.score.toLocaleString()}
                            </td>
                            <td
                              className="tabular"
                              style={{
                                padding: '10px 12px',
                                textAlign: 'right',
                                fontFamily: 'var(--font-pixel)',
                                color: 'var(--text)',
                              }}
                            >
                              {r.level}
                            </td>
                            <td
                              className="tabular"
                              style={{
                                padding: '10px 12px',
                                textAlign: 'right',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 12,
                                color: 'var(--text-muted)',
                              }}
                            >
                              {formatTime(r.timeOfDeath)}
                            </td>
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
