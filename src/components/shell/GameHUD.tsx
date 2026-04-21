'use client';

import { Icon } from '@/components/ui/Icon';
import { Lives } from '@/components/ui/Lives';
import { Chip } from '@/components/ui/Chip';

interface GameHUDProps {
  score: number;
  lives: number;
  maxLives: number;
  level: number;
  levelPrefix?: string; // e.g. "Deck" instead of "LV"
  timeRemaining: number;
  showTimer?: boolean;
  showBottomBar?: boolean;
  combo?: number;
  soundEnabled: boolean;
  onMenuOpen: () => void;
  onPause: () => void;
  onToggleSound: () => void;
  visible: boolean;
}

/** Transparent pressable pill — 44×44 min touch target, backdrop blur */
const iconBtnClass = [
  'pointer-events-auto',
  'inline-flex items-center justify-center',
  'min-w-[44px] min-h-[44px] px-3',
  'rounded-xl',
  'border border-[var(--stroke-strong)]',
  'bg-[color-mix(in_oklch,var(--bg-elev)_85%,transparent)]',
  'backdrop-blur-[8px]',
  'text-[var(--text)]',
  'transition-colors',
  'hover:border-[var(--accent-precision)] hover:text-[var(--accent-precision)]',
  'active:scale-95',
].join(' ');

/** Inline stat pill — label + value side-by-side */
const statPillClass = [
  'inline-flex items-center gap-1.5',
  'min-h-[44px] px-3',
  'rounded-xl',
  'border border-[var(--stroke-strong)]',
  'bg-[color-mix(in_oklch,var(--bg-elev)_85%,transparent)]',
  'backdrop-blur-[8px]',
].join(' ');

export function GameHUD({
  score, lives, maxLives, level, levelPrefix, timeRemaining, showTimer = true, showBottomBar = true, combo = 0,
  soundEnabled, onMenuOpen, onPause, onToggleSound, visible,
}: GameHUDProps) {
  if (!visible) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60);
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const timeLow = timeRemaining <= 10;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">

      {/* ── TOP STRIP ── transparent, no background ─────────────────────── */}
      <div className="flex items-center gap-2 px-3 pt-3">

        {/* Left: menu + pause */}
        <div className="flex gap-1.5">
          <button onClick={onMenuOpen} className={iconBtnClass} aria-label="Open menu">
            <Icon name="menu" size={20} />
          </button>

          <button onClick={onPause} className={iconBtnClass} aria-label="Pause game">
            <Icon name="pause" size={20} />
          </button>
        </div>

        {/* Sound toggle — moved to bottom-left, rendered here for JSX ordering but positioned absolutely */}
        <button
          onClick={onToggleSound}
          className={iconBtnClass}
          style={{
            position: 'fixed',
            left: 12,
            bottom: `calc(12px + var(--safe-bottom, 0px))`,
            zIndex: 15,
          }}
          aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        >
            <svg
              width={20} height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {soundEnabled ? (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
              ) : (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </>
              )}
            </svg>
          </button>

        {/* Right: combo + timer + score */}
        <div className="flex gap-1.5 ml-auto">
          {combo >= 2 && (
            <div className={statPillClass} style={{ borderColor: 'var(--accent-combo)', minWidth: 52, justifyContent: 'center' }}>
              <span
                className="tabular-nums"
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--accent-combo)',
                  textAlign: 'center',
                }}
              >
                ×{combo}
              </span>
            </div>
          )}

          {showTimer && (
            <div
              className={[
                statPillClass,
                timeLow
                  ? 'border-[var(--accent-warning)] animate-[pulseLow_1s_ease-in-out_infinite]'
                  : '',
              ].join(' ')}
            >
              <span
                className="uppercase"
                style={{ fontSize: 9, letterSpacing: '0.08em', color: 'var(--text-dim)' }}
              >
                TIME
              </span>
              <span
                className="tabular-nums"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: 14,
                  color: timeLow ? 'var(--accent-warning)' : 'var(--text)',
                }}
              >
                {mm}:{ss}
              </span>
            </div>
          )}

          <div className={statPillClass}>
            <span
              className="uppercase"
              style={{ fontSize: 9, letterSpacing: '0.08em', color: 'var(--text-dim)' }}
            >
              SCORE
            </span>
            <span
              className="tabular-nums"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--accent-combo)',
              }}
            >
              {score.toLocaleString()}
            </span>
          </div>

        </div>
      </div>

      {/* ── BOTTOM STRIP ─────────────────────────────────────────────────── */}
      {showBottomBar && (
        <div
          className="absolute bottom-0 left-0 right-0 grid items-center px-3"
          style={{
            gridTemplateColumns: '1fr auto 1fr',
            gap: 8,
            paddingBottom: 'calc(0.75rem + var(--safe-bottom, 0px))',
          }}
        >
          {/* empty left cell keeps lives centred */}
          <div />

          {/* Centre: lives as hexagonal pips */}
          {maxLives > 0 && (
            <div className={statPillClass} style={{ gap: 10 }}>
              <span
                className="uppercase"
                style={{ fontSize: 9, letterSpacing: '0.08em', color: 'var(--text-dim)' }}
              >
                LIVES
              </span>
              <Lives count={lives} max={maxLives} />
            </div>
          )}

          {/* Right: level pill */}
          <div className="justify-self-end">
            <Chip
              tone="precision"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 14,
                minHeight: 44,
                padding: '0 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                border: '1.5px solid var(--accent-precision)',
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 9, letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                {levelPrefix || 'LV'}
              </span>
              <span style={{ color: 'var(--accent-precision)' }}>
                {String(level).padStart(2, '0')}
              </span>
            </Chip>
          </div>
        </div>
      )}
    </div>
  );
}
