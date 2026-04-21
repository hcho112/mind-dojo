'use client';

import { useEffect, useState } from 'react';
import { getBestStats, type BestStats } from '@/storage/gameStore';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Panel } from '@/components/ui/Panel';

interface StartScreenProps {
  gameName: string;
  gameSlug: string;
  gameIcon: string;
  levelLabel?: string;
  timeLabel?: string;
  alwaysShowLevelSelector?: boolean;
  accent?: string;
  howToPlay?: string;
  onStart: (startLevel: number) => void;
  onMenuOpen: () => void;
  visible: boolean;
}

export function StartScreen({
  gameName, gameSlug, gameIcon, levelLabel, timeLabel, alwaysShowLevelSelector,
  accent, howToPlay, onStart, onMenuOpen, visible,
}: StartScreenProps) {
  const [stats, setStats] = useState<BestStats | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [showLockedTip, setShowLockedTip] = useState(false);

  useEffect(() => {
    if (visible) {
      getBestStats(gameSlug).then((s) => {
        setStats(s);
        setLoaded(true);
      });
    }
  }, [gameSlug, visible]);

  if (!visible) return null;

  const accentColor = accent || 'var(--accent-precision)';
  const unlockedMax = stats?.bestLevel ?? 1;
  const maxLevel = alwaysShowLevelSelector
    ? Math.max(10, unlockedMax + 1)
    : unlockedMax;

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleLevelDown = () => {
    setShowLockedTip(false);
    setSelectedLevel((prev) => Math.max(1, prev - 1));
  };

  const handleLevelUp = () => {
    if (!alwaysShowLevelSelector && selectedLevel >= unlockedMax) {
      setShowLockedTip(true);
      setTimeout(() => setShowLockedTip(false), 2500);
      return;
    }
    setShowLockedTip(false);
    setSelectedLevel((prev) => Math.min(maxLevel, prev + 1));
  };

  const variant = gameSlug === 'card-recall' ? 'recall' as const : 'precision' as const;

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-y-auto"
      style={{
        background: 'var(--bg)',
        paddingBottom: 'max(24px, var(--safe-bottom))',
        paddingTop: 'max(24px, var(--safe-top))',
      }}
    >
      {/* Menu button — top left */}
      <div className="absolute top-3 left-3" style={{ zIndex: 5 }}>
        <button
          onClick={onMenuOpen}
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl transition-colors"
          style={{
            border: '1px solid var(--stroke-strong)',
            background: 'color-mix(in oklch, var(--bg-elev) 85%, transparent)',
            color: 'var(--text)',
            backdropFilter: 'blur(8px)',
          }}
          aria-label="Open menu"
        >
          <Icon name="menu" size={20} />
        </button>
      </div>

      {/* Main content */}
      <div className="px-5 flex flex-col items-center w-full" style={{ maxWidth: 420 }}>

        {/* Game icon with glow */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: `0 0 40px -8px color-mix(in oklch, ${accentColor} calc(70% * var(--glow-strength, 1)), transparent)`,
            marginBottom: 16,
          }}
        >
          <img src={gameIcon} alt="" width={80} height={80} />
        </div>

        {/* Game name */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(24px, 6vw, 36px)',
            letterSpacing: '-0.02em',
            textAlign: 'center',
            color: 'var(--text)',
            marginBottom: 8,
          }}
        >
          {gameName}
        </h1>

        {/* How to play */}
        {howToPlay && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--text-muted)',
              textAlign: 'center',
              lineHeight: 1.5,
              maxWidth: 340,
              marginBottom: 24,
            }}
          >
            {howToPlay}
          </p>
        )}

        {/* Stats row */}
        {loaded && (
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 24,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <Panel
              style={{
                flex: 1,
                padding: '12px 10px',
                textAlign: 'center',
                background: 'var(--bg-elev)',
                border: '1px solid var(--stroke)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 4 }}>Best Score</div>
              <div
                className="tabular"
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 22,
                  fontWeight: 700,
                  color: accentColor,
                }}
              >
                {stats ? stats.bestScore.toLocaleString() : '—'}
              </div>
            </Panel>

            <Panel
              style={{
                flex: 1,
                padding: '12px 10px',
                textAlign: 'center',
                background: 'var(--bg-elev)',
                border: '1px solid var(--stroke)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 4 }}>Best Level</div>
              <div
                className="tabular"
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 22,
                  fontWeight: 700,
                  color: accentColor,
                }}
              >
                {stats ? stats.bestLevel : '—'}
              </div>
            </Panel>

            <Panel
              style={{
                flex: 1,
                padding: '12px 10px',
                textAlign: 'center',
                background: 'var(--bg-elev)',
                border: '1px solid var(--stroke)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 4 }}>{timeLabel || 'Last Time'}</div>
              <div
                className="tabular"
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 22,
                  fontWeight: 700,
                  color: accentColor,
                }}
              >
                {stats ? formatTime(stats.lastTimeOfDeath) : '—'}
              </div>
            </Panel>
          </div>
        )}

        {/* Level selector */}
        {(alwaysShowLevelSelector || maxLevel > 1) && (
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={handleLevelDown}
                disabled={selectedLevel <= 1}
                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl transition-all"
                style={{
                  border: '1.5px solid var(--stroke)',
                  background: 'var(--bg-elev)',
                  color: 'var(--text)',
                  opacity: selectedLevel <= 1 ? 0.3 : 1,
                  cursor: selectedLevel <= 1 ? 'not-allowed' : 'pointer',
                }}
                aria-label="Lower level"
              >
                <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><Icon name="arrow" size={18} /></span>
              </button>

              <div style={{ textAlign: 'center', minWidth: 100 }}>
                <div className="eyebrow" style={{ marginBottom: 2 }}>{levelLabel || 'Start Level'}</div>
                <div
                  className="tabular"
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: 32,
                    fontWeight: 700,
                    color: accentColor,
                  }}
                >
                  {selectedLevel}
                </div>
              </div>

              <button
                onClick={handleLevelUp}
                disabled={!alwaysShowLevelSelector && selectedLevel >= unlockedMax}
                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl transition-all"
                style={{
                  border: `1.5px solid ${!alwaysShowLevelSelector && selectedLevel >= unlockedMax ? 'var(--stroke)' : 'var(--stroke)'}`,
                  background: 'var(--bg-elev)',
                  color: 'var(--text)',
                  opacity: !alwaysShowLevelSelector && selectedLevel >= unlockedMax ? 0.3 : 1,
                  cursor: !alwaysShowLevelSelector && selectedLevel >= unlockedMax ? 'not-allowed' : 'pointer',
                }}
                aria-label="Higher level"
              >
                <Icon name="arrow" size={18} />
              </button>
            </div>

            {/* Locked level tooltip */}
            {showLockedTip && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 8,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--accent-warning)',
                  color: 'var(--accent-warning)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  animation: 'fadeInUp 0.2s var(--ease-out)',
                  zIndex: 10,
                }}
              >
                Complete level {unlockedMax} to unlock next
              </div>
            )}
          </div>
        )}

        {/* Start button */}
        <Button
          variant={variant}
          size="lg"
          icon="play"
          onClick={() => onStart(selectedLevel)}
        >
          {selectedLevel > 1
            ? `Start ${levelLabel ? `${levelLabel} ${selectedLevel}` : `Level ${selectedLevel}`}`
            : 'Start Game'}
        </Button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
