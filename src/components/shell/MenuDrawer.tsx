'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { registry } from '@/games/registry';
import { Icon } from '@/components/ui/Icon';
import { ThemeToggle } from './ThemeToggle';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlug: string;
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 14px',
  borderRadius: 'var(--radius-md)',
  textDecoration: 'none',
  color: 'var(--text)',
  fontFamily: 'var(--font-display)',
  fontSize: 14,
  fontWeight: 500,
  transition: 'background 0.15s',
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  width: '100%',
  textAlign: 'left' as const,
};

export function MenuDrawer({ isOpen, onClose, currentSlug }: MenuDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 40,
            transition: 'opacity 0.2s',
          }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          maxWidth: 300,
          zIndex: 50,
          background: 'var(--bg-elev)',
          borderRight: '1px solid var(--stroke)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s var(--ease-out)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 16px',
            borderBottom: '1px solid var(--stroke)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-precision)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 0 20px -4px color-mix(in oklch, var(--accent-precision) calc(60% * var(--glow-strength, 1)), transparent)',
              }}
            >
              <Icon name="target" size={16} color="#07121A" />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: '-0.02em',
              }}
            >
              Mind Dojo
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--stroke)',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            className="menu-row-hover"
            aria-label="Close menu"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Home link */}
        <div style={{ padding: '8px 10px 0' }}>
          <Link href="/" onClick={onClose} style={rowStyle} className="menu-row-hover">
            <Icon name="spark" size={18} color="var(--text-muted)" />
            <span>Home</span>
          </Link>
        </div>

        {/* Games */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
          <div className="eyebrow" style={{ padding: '8px 14px 6px', fontSize: 10 }}>
            Games
          </div>
          {Object.values(registry).map((game) => {
            const isActive = currentSlug === game.slug;
            const accent = game.accent || 'var(--accent-precision)';
            return (
              <Link
                key={game.slug}
                href={`/game/${game.slug}`}
                onClick={onClose}
                style={{
                  ...rowStyle,
                  background: isActive
                    ? `color-mix(in oklch, ${accent} 12%, transparent)`
                    : 'transparent',
                  color: isActive ? accent : 'var(--text)',
                  borderLeft: isActive ? `2px solid ${accent}` : '2px solid transparent',
                }}
                className={isActive ? '' : 'menu-row-hover'}
              >
                <img
                  src={game.icon}
                  alt=""
                  width={32}
                  height={32}
                  style={{ borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{game.name}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-dim)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {game.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div style={{ borderTop: '1px solid var(--stroke)', padding: '8px 10px' }}>
          <Link href="/stats" onClick={onClose} style={rowStyle} className="menu-row-hover">
            <Icon name="trophy" size={18} color="var(--text-muted)" />
            <span>Progress</span>
          </Link>

          <ThemeToggle />

          <Link href="/about" onClick={onClose} style={rowStyle} className="menu-row-hover">
            <Icon name="eye" size={18} color="var(--text-muted)" />
            <span>About</span>
          </Link>
        </div>
      </div>

      <style>{`
        .menu-row-hover:hover {
          background: var(--bg-elev-2) !important;
        }
      `}</style>
    </>
  );
}
