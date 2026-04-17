'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { registry } from '@/games/registry';
import { ThemeToggle } from './ThemeToggle';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlug: string;
}

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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full w-full max-w-72 z-50
          bg-[var(--surface)] border-r border-[var(--border)]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--text)]">Mind Dojo</h2>
            <button
              onClick={onClose}
              className="p-3 rounded hover:bg-black/10 dark:hover:bg-white/10"
              aria-label="Close menu"
            >
              <span className="text-xl text-[var(--text)]">✕</span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-2">
            <p className="px-3 py-1 text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Games
            </p>
            {Object.values(registry).map((game) => (
              <Link
                key={game.slug}
                href={`/game/${game.slug}`}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                  ${currentSlug === game.slug
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
              >
                <img src={game.icon} alt="" width={36} height={36} className="rounded-lg" />
                <div>
                  <p className="font-medium">{game.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{game.description}</p>
                </div>
              </Link>
            ))}
          </nav>

          <div className="border-t border-[var(--border)] p-3">
            <ThemeToggle />
            <div className="mt-2 px-3 py-2 rounded-lg opacity-50 cursor-not-allowed">
              <span className="text-sm text-[var(--text-muted)]">Options (coming soon)</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
