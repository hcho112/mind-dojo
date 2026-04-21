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
            <Link
              href="/stats"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)]">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span className="font-medium">Progress</span>
            </Link>
            <ThemeToggle />
          </div>

          {/* Info section */}
          <div className="border-t border-[var(--border)] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Built with</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['Next.js', 'React 19', 'TypeScript', 'Tailwind CSS', 'Canvas API', 'IndexedDB'].map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  {tech}
                </span>
              ))}
            </div>
            <a
              href="https://github.com/hcho112/mind-dojo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>github.com/hcho112/mind-dojo</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
