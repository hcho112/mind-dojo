'use client';

import { useRouter } from 'next/navigation';
import { registry } from '@/games/registry';
import { Icon } from '@/components/ui/Icon';

// SVG icons for each tech — inline for zero network requests
const techIcons: Record<string, React.ReactNode> = {
  nextjs: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.251 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.86-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.572 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z"/></svg>,
  react: <svg width="20" height="20" viewBox="0 0 24 24" fill="#61DAFB"><path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.31 0-.592.06-.838.174-1.14.555-1.528 2.242-1.073 4.558-2.322.757-3.792 1.843-3.792 3.08 0 1.237 1.47 2.323 3.792 3.08-.455 2.316-.067 4.002 1.073 4.557.246.116.529.174.838.174 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.31 0 .592-.058.838-.174 1.14-.555 1.528-2.242 1.073-4.558 2.322-.756 3.793-1.843 3.793-3.08 0-1.236-1.47-2.322-3.793-3.08.455-2.315.067-4.001-1.073-4.557a1.636 1.636 0 0 0-.838-.174zM12 15.68a3.697 3.697 0 0 1-3.697-3.697A3.697 3.697 0 0 1 12 8.287a3.697 3.697 0 0 1 3.697 3.696A3.697 3.697 0 0 1 12 15.68z"/></svg>,
  typescript: <svg width="20" height="20" viewBox="0 0 24 24" fill="#3178C6"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.42.276.69.394c.268.118.58.245.936.382.48.186.926.39 1.34.612.413.222.77.476 1.073.764.303.288.541.623.717 1.006.176.383.264.836.264 1.36 0 .947-.317 1.67-.951 2.166-.634.496-1.587.744-2.86.744a7.925 7.925 0 0 1-1.11-.078 6.683 6.683 0 0 1-1.045-.234 5.996 5.996 0 0 1-.905-.378 3.85 3.85 0 0 1-.498-.31V16.15c.232.2.497.39.793.57.296.177.618.328.961.455a6.04 6.04 0 0 0 1.976.382c.316 0 .602-.027.857-.082.256-.055.473-.136.653-.242a1.166 1.166 0 0 0 .429-.405.992.992 0 0 0 .154-.551c0-.218-.061-.41-.183-.574a2.025 2.025 0 0 0-.525-.456 5.78 5.78 0 0 0-.81-.406 22.434 22.434 0 0 0-1.036-.416 8.69 8.69 0 0 1-1.27-.601 4.44 4.44 0 0 1-.972-.749 3.054 3.054 0 0 1-.62-.976 3.41 3.41 0 0 1-.218-1.255c0-.887.296-1.59.887-2.11.591-.522 1.465-.783 2.622-.783zm-8.49 1.098h6.5v2.129h-2.047v8.273H9.9v-8.273H7.997z"/></svg>,
  tailwind: <svg width="20" height="20" viewBox="0 0 24 24" fill="#06B6D4"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/></svg>,
  canvas: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4"/><line x1="3" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="21" y2="12"/></svg>,
  indexeddb: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/></svg>,
  vitest: <svg width="20" height="20" viewBox="0 0 24 24" fill="#6E9F18"><path d="M12.53.82l11.12 5.56a.58.58 0 0 1 0 1.04l-11.12 5.56a1.16 1.16 0 0 1-1.06 0L.35 7.42a.58.58 0 0 1 0-1.04L11.47.82a1.16 1.16 0 0 1 1.06 0zM23.76 11.44L12.53 17a1.16 1.16 0 0 1-1.06 0L.24 11.44M23.76 16.26L12.53 21.82a1.16 1.16 0 0 1-1.06 0L.24 16.26"/></svg>,
  claude: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#D97706"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="10" r="1.2" fill="#fff"/><circle cx="15" cy="10" r="1.2" fill="#fff"/></svg>,
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
  { key: 'claude', name: 'Claude Code', description: 'AI-powered development — architecture, implementation, debugging, and code review', url: 'https://claude.ai/code' },
  { key: 'claude', name: 'Claude Design', description: 'Design system, component specs, screen layouts, and visual tokens', url: 'https://claude.ai' },
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
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--bg-elev-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {techIcons[tool.key]}
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
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--bg-elev-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {techIcons[tech.key]}
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
