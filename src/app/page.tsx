'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { getBestStats, type BestStats } from '@/storage/gameStore';

// ─── Arcade backdrop: fixed dot-grid + vignette ──────────────────────────────

function ArcadeBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(color-mix(in oklch, var(--text) 10%, transparent) 1px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)',
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 100% 80% at 50% 0%, transparent 40%, color-mix(in oklch, var(--bg) 70%, transparent) 100%)',
        }}
      />
    </div>
  );
}

// ─── Corner brackets decoration ──────────────────────────────────────────────

function CornerBrackets({
  color = 'var(--accent-precision)',
  size = 18,
  inset = 0,
}: {
  color?: string;
  size?: number;
  inset?: number;
}) {
  const arm: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    borderColor: color,
    borderStyle: 'solid',
  };
  return (
    <>
      <div style={{ ...arm, top: inset, left: inset, borderWidth: '2px 0 0 2px' }} />
      <div style={{ ...arm, top: inset, right: inset, borderWidth: '2px 2px 0 0' }} />
      <div style={{ ...arm, bottom: inset, left: inset, borderWidth: '0 0 2px 2px' }} />
      <div style={{ ...arm, bottom: inset, right: inset, borderWidth: '0 2px 2px 0' }} />
    </>
  );
}

// ─── Sticky header ────────────────────────────────────────────────────────────

function MenuHeader() {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        padding: '18px clamp(16px, 4vw, 40px)',
        borderBottom: '1px solid var(--stroke)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'color-mix(in oklch, var(--bg) 80%, transparent)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-precision)',
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            flexShrink: 0,
            boxShadow:
              '0 0 30px -4px color-mix(in oklch, var(--accent-precision) calc(80% * var(--glow-strength)), transparent)',
          }}
        >
          <Icon name="target" size={22} color="#07121A" />
        </div>
        <div style={{ lineHeight: 1.1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: 18,
              whiteSpace: 'nowrap',
            }}
          >
            Mind Dojo
          </div>
          <div
            className="eyebrow"
            style={{
              fontSize: 10,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Train the focus · Room 02
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {/* Streak chip */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 36,
            padding: '0 12px',
            background: 'color-mix(in oklch, var(--accent-combo) 14%, transparent)',
            color: 'var(--accent-combo)',
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--accent-combo)',
            }}
          />
          <span className="menu-streak-text">7 day streak</span>
          <span className="menu-streak-short" style={{ display: 'none' }}>
            7d
          </span>
        </div>

        {/* Stats link */}
        <Link
          href="/stats"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 36,
            padding: '0 12px',
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 13,
            textDecoration: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
          }}
          className="menu-ghost"
          aria-label="Stats"
        >
          <Icon name="trophy" size={16} />
          <span className="menu-label">Stats</span>
        </Link>

        {/* Settings button (placeholder) */}
        <button
          aria-label="Settings"
          className="menu-ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 36,
            padding: '0 12px',
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 13,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          <Icon name="settings" size={16} />
        </button>
      </nav>

      <style>{`
        .menu-ghost:hover {
          background: var(--bg-elev) !important;
          color: var(--text) !important;
        }
        @media (max-width: 720px) {
          .menu-label { display: none; }
          .menu-streak-text { display: none; }
          .menu-streak-short { display: inline !important; }
        }
      `}</style>
    </header>
  );
}

// ─── Animated art for Target Precision ───────────────────────────────────────

function TargetArt() {
  return (
    <div style={{ position: 'relative', width: 180, height: 180 }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: `${i * 10}px`,
            borderRadius: '50%',
            border: `2px solid color-mix(in oklch, var(--accent-precision) ${80 - i * 15}%, transparent)`,
            animation: `pulseRing 3s ease-in-out infinite ${i * 0.2}s`,
          }}
        />
      ))}
      {/* Center dot */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 16,
          height: 16,
          marginLeft: -8,
          marginTop: -8,
          borderRadius: '50%',
          background: 'var(--accent-precision)',
          boxShadow:
            '0 0 30px color-mix(in oklch, var(--accent-precision) calc(100% * var(--glow-strength)), transparent)',
        }}
      />
      {/* Crosshair */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: -10,
          right: -10,
          height: 1,
          background: 'color-mix(in oklch, var(--accent-precision) 60%, transparent)',
          transform: 'translateY(-0.5px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: -10,
          bottom: -10,
          width: 1,
          background: 'color-mix(in oklch, var(--accent-precision) 60%, transparent)',
          transform: 'translateX(-0.5px)',
        }}
      />
      <style>{`
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.06); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

// ─── Animated art for Card Recall ────────────────────────────────────────────

function CardsArt() {
  const rotations = [-24, -10, 6, 22];
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', 'K', '7', 'Q'];

  return (
    <div style={{ position: 'relative', width: 220, height: 200 }}>
      {rotations.map((r, i) => {
        const isRed = i === 1 || i === 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: 0,
              left: `${50 + i * 20 - 30}%`,
              width: 78,
              height: 112,
              background: 'var(--bg-elev-2)',
              border: '2px solid var(--accent-recall)',
              borderRadius: 10,
              transform: `rotate(${r}deg) translateY(${Math.abs(r) * 0.4}px)`,
              transformOrigin: 'bottom center',
              boxShadow: `0 10px 30px -10px color-mix(in oklch, var(--accent-recall) calc(80% * var(--glow-strength)), transparent), inset 0 0 0 1px color-mix(in oklch, var(--accent-recall) 20%, transparent)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: 8,
              color: isRed ? 'var(--accent-recall)' : 'var(--text)',
              fontFamily: 'var(--font-pixel)',
              animation: `cardFloat 4s ease-in-out infinite ${i * 0.3}s`,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{values[i]}</div>
            <div style={{ fontSize: 30, alignSelf: 'center', lineHeight: 1 }}>{suits[i]}</div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                alignSelf: 'flex-end',
                lineHeight: 1,
                transform: 'rotate(180deg)',
              }}
            >
              {values[i]}
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes cardFloat {
          0%, 100% { translate: 0 0; }
          50%       { translate: 0 -6px; }
        }
      `}</style>
    </div>
  );
}

// ─── Stat line in game card footer ───────────────────────────────────────────

function StatLine({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span className="eyebrow" style={{ fontSize: 9 }}>
        {label}
      </span>
      <span
        className="score-slab tabular"
        style={{
          fontSize: 20,
          color: tone ? `var(--accent-${tone})` : 'var(--text)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Game card ────────────────────────────────────────────────────────────────

interface GameCardProps {
  tone: 'precision' | 'recall';
  subtitle: string;
  title: string;
  body: string;
  chips: string[];
  bestScore: string;
  recent: string;
  href: string;
  art: React.ReactNode;
}

function GameCard({
  tone,
  subtitle,
  title,
  body,
  chips,
  bestScore,
  recent,
  href,
  art,
}: GameCardProps) {
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <Panel
        glow={hover ? tone : undefined}
        style={{
          padding: 0,
          overflow: 'hidden',
          transform: hover ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'transform 0.35s var(--ease-out), box-shadow 0.35s var(--ease-out)',
          cursor: 'pointer',
          minHeight: 440,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface)',
          border: '1px solid var(--stroke)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Art panel */}
        <div
          style={{
            position: 'relative',
            height: 240,
            background: `
              radial-gradient(120% 80% at 50% 100%,
                color-mix(in oklch, var(--accent-${tone}) 35%, var(--bg)) 0%,
                var(--bg-elev) 70%),
              var(--bg-elev)
            `,
            overflow: 'hidden',
            borderBottom: '1.5px solid var(--stroke)',
          }}
        >
          {/* Perspective grid floor */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(color-mix(in oklch, var(--accent-${tone}) 30%, transparent) 1px, transparent 1px),
                linear-gradient(90deg, color-mix(in oklch, var(--accent-${tone}) 30%, transparent) 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
              transform: 'perspective(500px) rotateX(62deg) translateY(30%)',
              transformOrigin: 'bottom',
              opacity: hover ? 0.8 : 0.45,
              transition: 'opacity 0.4s',
              maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
            }}
          />

          {/* Scanlines overlay */}
          <div className="scanlines" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

          {/* Art */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              transform: hover ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.6s var(--ease-out)',
            }}
          >
            {art}
          </div>

          {/* Mode tag */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: `var(--accent-${tone})`,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              display: 'flex',
              gap: 6,
              alignItems: 'center',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: `var(--accent-${tone})`,
                boxShadow: `0 0 10px color-mix(in oklch, var(--accent-${tone}) calc(100% * var(--glow-strength)), transparent)`,
              }}
            />
            MODE · {tone.toUpperCase()}
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            flex: 1,
          }}
        >
          <div>
            <div
              className="eyebrow"
              style={{ color: `var(--accent-${tone})`, marginBottom: 8 }}
            >
              {subtitle}
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 40,
                letterSpacing: '-0.03em',
                fontWeight: 700,
                lineHeight: 1,
                fontFamily: 'var(--font-display)',
              }}
            >
              {title}
            </h2>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 14,
                lineHeight: 1.5,
                marginTop: 10,
                maxWidth: 420,
              }}
            >
              {body}
            </p>
          </div>

          {/* Chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {chips.map((c) => (
              <Chip key={c} tone={tone}>
                {c}
              </Chip>
            ))}
          </div>

          {/* Footer: stats + play button */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 18,
              borderTop: '1px dashed var(--stroke)',
            }}
          >
            <div style={{ display: 'flex', gap: 22 }}>
              <StatLine label="Best" value={bestScore} tone={tone} />
              <StatLine label="Recent" value={recent} />
            </div>
            <Button variant={tone} icon="play" size="md">
              Play
            </Button>
          </div>
        </div>
      </Panel>
    </Link>
  );
}

// ─── Activity row panel ───────────────────────────────────────────────────────

function ActivityPanel({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow: string;
}) {
  return (
    <Panel
      style={{
        padding: 22,
        background: 'var(--surface)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div className="eyebrow">{eyebrow}</div>
      {children}
    </Panel>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [precisionStats, setPrecisionStats] = useState<BestStats | null>(null);
  const [recallStats, setRecallStats] = useState<BestStats | null>(null);

  useEffect(() => {
    getBestStats('target-precision').then(setPrecisionStats).catch(() => {});
    getBestStats('card-recall').then(setRecallStats).catch(() => {});
  }, []);

  // Format stats display values
  const precisionBest = precisionStats
    ? precisionStats.bestScore.toLocaleString()
    : '—';
  const precisionRecent = precisionStats
    ? `LV ${precisionStats.bestLevel}`
    : '—';
  const recallBest = recallStats
    ? `${recallStats.bestLevel} / 52`
    : '—';
  const recallRecent = recallStats
    ? `${recallStats.bestLevel} / 52`
    : '—';

  return (
    <>
      {/* Allow scrolling on landing page — globals.css sets overflow:hidden on body */}
      <style>{`
        html, body { overflow: auto !important; height: auto !important; }
        @keyframes menuBlink { 50% { opacity: 0.35; } }
        .menu-insert-coin { animation: menuBlink 1.4s steps(2, end) infinite; }
      `}</style>

      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <ArcadeBackdrop />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <MenuHeader />

          {/* ── HERO ─────────────────────────────────────────────────────── */}
          <section
            style={{
              padding: 'clamp(32px, 6vw, 60px) clamp(16px, 4vw, 40px) 24px',
              maxWidth: 1200,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                gap: 24,
                flexWrap: 'wrap',
              }}
            >
              {/* Left: headline */}
              <div style={{ flex: '1 1 320px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <Chip tone="precision" dot>
                    Session ready · 2 games
                  </Chip>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span className="menu-insert-coin">▸ Insert focus</span>
                  </div>
                </div>

                <div
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    padding: '4px 8px',
                  }}
                >
                  <CornerBrackets color="var(--accent-precision)" size={14} />
                  <h1
                    style={{
                      fontSize: 'clamp(42px, 8vw, 120px)',
                      margin: 0,
                      lineHeight: 0.92,
                      letterSpacing: '-0.045em',
                      fontWeight: 700,
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    Pick your{' '}
                    <span className="aberration">training.</span>
                  </h1>
                </div>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: 'clamp(14px, 1.6vw, 18px)',
                    marginTop: 16,
                    maxWidth: 520,
                  }}
                >
                  Two drills for your attention and memory. Short, punchy,
                  repeatable. Pick one — your focus will sharpen by the end.
                </p>
              </div>

              {/* Right: quick stats */}
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  alignItems: 'center',
                  paddingBottom: 8,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="eyebrow">Today</span>
                  <span
                    className="score-slab tabular"
                    style={{
                      fontSize: 'clamp(24px, 3.2vw, 34px)',
                      color: 'var(--accent-combo)',
                    }}
                  >
                    00:12:08
                  </span>
                </div>
                <div
                  style={{ width: 1, height: 44, background: 'var(--stroke)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="eyebrow">Streak</span>
                  <span
                    className="score-slab tabular"
                    style={{ fontSize: 'clamp(24px, 3.2vw, 34px)' }}
                  >
                    7
                    <span
                      style={{
                        fontSize: 18,
                        color: 'var(--text-muted)',
                        marginLeft: 4,
                      }}
                    >
                      days
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── GAME CARDS ───────────────────────────────────────────────── */}
          <section
            style={{
              padding: '20px clamp(16px, 4vw, 40px) 48px',
              maxWidth: 1200,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))',
                gap: 20,
              }}
            >
              <GameCard
                tone="precision"
                subtitle="Focus · Speed"
                title="Target Precision"
                body="Targets appear at random. Outer ring collapses toward the bullseye. Tap early, tap center, chain combos. Miss and lose a life."
                chips={['Focus', 'Speed', 'Reflex']}
                bestScore={precisionBest}
                recent={precisionRecent}
                href="/game/target-precision"
                art={<TargetArt />}
              />
              <GameCard
                tone="recall"
                subtitle="Memory · Sequence"
                title="Card Recall"
                body="A shuffled deck appears one card at a time. Memorize the order. Then recall them in sequence — one mistake ends the round."
                chips={['Memory', 'Sequence', 'Patience']}
                bestScore={recallBest}
                recent={recallRecent}
                href="/game/card-recall"
                art={<CardsArt />}
              />
            </div>
          </section>

          {/* ── ACTIVITY ROW ─────────────────────────────────────────────── */}
          <section
            style={{
              padding: '0 clamp(16px, 4vw, 40px) 80px',
              maxWidth: 1200,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              {/* Last session */}
              <ActivityPanel eyebrow="Last session">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 10,
                  }}
                >
                  <Icon name="target" size={16} color="var(--accent-precision)" />
                  <span style={{ fontWeight: 600 }}>Target Precision</span>
                </div>
                <div className="score-slab tabular" style={{ fontSize: 28, marginTop: 8 }}>
                  {precisionStats ? precisionStats.bestScore.toLocaleString() : '—'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {precisionStats ? 'Best run' : 'No sessions yet'}
                </div>
              </ActivityPanel>

              {/* Weekly goal */}
              <ActivityPanel eyebrow="Weekly goal">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 6,
                    marginTop: 10,
                  }}
                >
                  <span
                    className="score-slab tabular"
                    style={{ fontSize: 28 }}
                  >
                    —
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>/ 20 sessions</span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: 'var(--bg-elev-2)',
                    borderRadius: 'var(--radius-pill)',
                    marginTop: 10,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: '0%',
                      height: '100%',
                      background: 'var(--accent-combo)',
                      borderRadius: 'inherit',
                    }}
                  />
                </div>
              </ActivityPanel>

              {/* All-time best */}
              <ActivityPanel eyebrow="All-time best">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 10,
                  }}
                >
                  <Icon name="trophy" size={16} color="var(--accent-combo)" />
                  <span style={{ fontWeight: 600 }}>
                    {precisionStats ? 'Top score' : 'No data yet'}
                  </span>
                </div>
                <div
                  className="score-slab tabular rainbow-hot"
                  style={{
                    fontSize: 28,
                    marginTop: 8,
                    fontFamily: 'var(--font-pixel)',
                  }}
                >
                  {precisionStats
                    ? precisionStats.bestScore.toLocaleString()
                    : '—'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Precision
                </div>
              </ActivityPanel>

              {/* Up next */}
              <ActivityPanel eyebrow="Up next">
                <div
                  style={{
                    fontSize: 14,
                    color: 'var(--text-muted)',
                    marginTop: 10,
                  }}
                >
                  Try Card Recall to train your memory and earn the{' '}
                  <span
                    style={{
                      color: 'var(--accent-recall)',
                      fontWeight: 600,
                    }}
                  >
                    Shuffler
                  </span>{' '}
                  badge.
                </div>
                <Link href="/game/card-recall" style={{ display: 'inline-block', marginTop: 12 }}>
                  <Button variant="recall" size="sm" icon="bolt">
                    Start
                  </Button>
                </Link>
              </ActivityPanel>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
