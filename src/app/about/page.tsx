'use client';

import { useRouter } from 'next/navigation';
import { registry } from '@/games/registry';

const TECH_STACK = [
  { name: 'Next.js 16', description: 'React framework with App Router', url: 'https://nextjs.org' },
  { name: 'React 19', description: 'UI library with hooks and server components', url: 'https://react.dev' },
  { name: 'TypeScript', description: 'Type-safe JavaScript', url: 'https://typescriptlang.org' },
  { name: 'Tailwind CSS 4', description: 'Utility-first CSS framework', url: 'https://tailwindcss.com' },
  { name: 'Canvas API', description: 'Hardware-accelerated 2D game rendering', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API' },
  { name: 'IndexedDB', description: 'Client-side database for scores and progress', url: 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API' },
  { name: 'Vitest', description: 'Unit testing framework', url: 'https://vitest.dev' },
];

const GAMES = Object.values(registry).map((g) => ({
  name: g.name,
  description: g.description,
  icon: g.icon,
}));

export default function AboutPage() {
  const router = useRouter();

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
        <h1 className="text-xl font-bold text-[var(--text)]">About</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        {/* App info */}
        <div className="flex flex-col items-center mb-8 pt-4">
          <img src="/icon.svg" alt="Mind Dojo" width={64} height={64} className="mb-3 rounded-2xl" />
          <h2 className="text-2xl font-bold text-[var(--text)] mb-1">Mind Dojo</h2>
          <p className="text-sm text-[var(--text-muted)] text-center">
            A collection of browser-based mini games designed to be fun while training cognitive skills like focus, speed, and memory.
          </p>
        </div>

        {/* Games */}
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3 px-1">Games</h3>
          <div className="flex flex-col gap-2">
            {GAMES.map((game) => (
              <div key={game.name} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <img src={game.icon} alt="" width={40} height={40} className="rounded-lg" />
                <div>
                  <p className="font-medium text-[var(--text)]">{game.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{game.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3 px-1">Tech Stack</h3>
          <div className="flex flex-col gap-2">
            {TECH_STACK.map((tech) => (
              <a
                key={tech.name}
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl transition-colors hover:opacity-80"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div>
                  <p className="font-medium text-[var(--text)]">{tech.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{tech.description}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] flex-shrink-0 ml-2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Source code */}
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3 px-1">Source Code</h3>
          <a
            href="https://github.com/hcho112/mind-dojo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:opacity-80"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--text)] flex-shrink-0">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <div>
              <p className="font-medium text-[var(--text)]">hcho112/mind-dojo</p>
              <p className="text-xs text-[var(--text-muted)]">View source code on GitHub</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] flex-shrink-0 ml-auto">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] pb-4">
          No backend. All progress saved locally in your browser.
        </p>
      </div>
    </div>
  );
}
