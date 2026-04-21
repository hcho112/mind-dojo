'use client';

import { useRouter } from 'next/navigation';
import { registry } from '@/games/registry';
import { Icon } from '@/components/ui/Icon';

// Favicon URLs from each tech's official website
const techFavicons: Record<string, string> = {
  nextjs: 'https://nextjs.org/favicon.ico',
  react: 'https://react.dev/favicon-32x32.png',
  typescript: 'https://www.typescriptlang.org/favicon-32x32.png',
  tailwind: 'https://tailwindcss.com/favicons/favicon-32x32.png',
  canvas: 'https://developer.mozilla.org/favicon-48x48.png',
  indexeddb: 'https://developer.mozilla.org/favicon-48x48.png',
  vitest: 'https://vitest.dev/favicon.ico',
  'claude-code': '/images/claude-icon.svg',
  'claude-design': '/images/claude-icon.svg',
};

const TECH_STACK = [
  { key: 'nextjs', name: 'Next.js 16', description: 'React framework with App Router and Turbopack', url: 'https://nextjs.org' },
  { key: 'react', name: 'React 19', description: 'UI library with hooks and concurrent features', url: 'https://react.dev' },
  { key: 'typescript', name: 'TypeScript', description: 'Type-safe JavaScript for the entire codebase', url: 'https://typescriptlang.org' },
  { key: 'tailwind', name: 'Tailwind CSS 4', description: 'Utility-first CSS with design token integration', url: 'https://tailwindcss.com' },
  { key: 'canvas', name: 'Canvas API', description: 'Hardware-accelerated 2D rendering for Target Precision', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API' },
  { key: 'indexeddb', name: 'IndexedDB', description: 'Client-side database for all scores and progress', url: 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API' },
  { key: 'vitest', name: 'Vitest', description: 'Fast unit testing with 73+ tests', url: 'https://vitest.dev' },
];

const AI_TOOLS = [
  { key: 'claude-code', name: 'Claude Code', description: 'AI-powered development — architecture, implementation, debugging, and code review', url: 'https://claude.ai/code' },
  { key: 'claude-design', name: 'Claude Design', description: 'Design system, component specs, screen layouts, and visual tokens', url: 'https://claude.ai' },
];

const GAMES = Object.values(registry).map((g) => ({
  name: g.name,
  description: g.description,
  icon: g.icon,
  accent: g.accent || 'var(--accent-precision)',
}));

const cardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '14px 16px',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-elev)',
  border: '1px solid var(--stroke)',
  textDecoration: 'none',
  color: 'var(--text)',
  transition: 'all 0.15s',
};

export default function AboutPage() {
  const router = useRouter();

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
          }}
          aria-label="Go back"
        >
          <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
            <Icon name="arrow" size={18} />
          </span>
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>
          About
        </h1>
      </div>

      <div style={{ padding: 16, maxWidth: 500, margin: '0 auto' }}>
        {/* Hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0 32px' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 0 40px -8px color-mix(in oklch, var(--accent-precision) calc(70% * var(--glow-strength, 1)), transparent)',
              marginBottom: 14,
            }}
          >
            <img src="/icon.svg" alt="Mind Dojo" width={72} height={72} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.03em', marginBottom: 6 }}>
            Mind Dojo
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, maxWidth: 340 }}>
            Browser-based mini games that train cognitive skills — focus, speed, and memory. No backend, no accounts. All progress saved locally.
          </p>
        </div>

        {/* Games */}
        <div style={{ marginBottom: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 10, paddingLeft: 2 }}>Games</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {GAMES.map((game) => (
              <div
                key={game.name}
                style={{
                  ...cardStyle,
                  borderLeft: `3px solid ${game.accent}`,
                }}
              >
                <img src={game.icon} alt="" width={40} height={40} style={{ borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>{game.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 1 }}>{game.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Built with AI */}
        <div style={{ marginBottom: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 10, paddingLeft: 2 }}>Built with AI</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {AI_TOOLS.map((tool, i) => (
              <a
                key={i}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                style={cardStyle}
                className="about-card-hover"
              >
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--bg-elev-2)', display: 'grid', placeItems: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  <img src={techFavicons[tool.key]} alt="" width={20} height={20} style={{ objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>{tool.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1 }}>{tool.description}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div style={{ marginBottom: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 10, paddingLeft: 2 }}>Tech Stack</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TECH_STACK.map((tech) => (
              <a
                key={tech.key}
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                style={cardStyle}
                className="about-card-hover"
              >
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--bg-elev-2)', display: 'grid', placeItems: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  <img src={techFavicons[tech.key]} alt="" width={20} height={20} style={{ objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>{tech.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1 }}>{tech.description}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Source Code */}
        <div style={{ marginBottom: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 10, paddingLeft: 2 }}>Source Code</div>
          <a
            href="https://github.com/hcho112/mind-dojo"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...cardStyle, padding: '18px 16px' }}
            className="about-card-hover"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>hcho112/mind-dojo</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>Open source on GitHub</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase', paddingBottom: 8 }}>
          No backend · No accounts · 100% client-side
        </p>
      </div>

      <style>{`
        .about-card-hover:hover {
          background: var(--bg-elev-2) !important;
          border-color: var(--stroke-strong) !important;
        }
      `}</style>
    </div>
  );
}
