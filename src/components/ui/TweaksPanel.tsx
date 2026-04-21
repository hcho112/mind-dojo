'use client';

import * as React from 'react';
import { Panel } from './Panel';
import { Icon } from './Icon';
import { useDesignTweaks } from '../../theme/DesignTweaksProvider';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * TweaksPanel — floating settings UI.
 * Mount once in your root layout. Toggle visibility with <TweaksToggle />.
 */
export function TweaksPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tweaks, setTweaks, reset } = useDesignTweaks();
  // Theme is managed by the existing ThemeProvider (html.dark class / Tailwind).
  // We delegate dark/light toggling to it to avoid two competing systems.
  const { theme, toggleTheme } = useTheme();
  if (!open) return null;

  const groupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
  const segStyle: React.CSSProperties = {
    display: 'flex', gap: 4,
    background: 'var(--bg-elev)',
    padding: 4,
    borderRadius: 10,
    border: '1px solid var(--stroke)',
  };
  const segBtn = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '7px 10px', borderRadius: 7,
    background: active ? 'var(--surface-alt)' : 'transparent',
    color: active ? 'var(--text)' : 'var(--text-muted)',
    border: 'none', fontSize: 12, cursor: 'pointer',
    fontFamily: 'var(--font-display)', fontWeight: 600,
  });

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, width: 280, zIndex: 9999, fontFamily: 'var(--font-display)' }}>
      <Panel inset style={{ padding: 16, background: 'var(--bg-elev)', borderStyle: 'solid' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="settings" size={14} />
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tweaks</span>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <Icon name="close" size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={groupStyle}>
            <span className="eyebrow" style={{ fontSize: 10 }}>Theme</span>
            <div style={segStyle}>
              {(['dark', 'light'] as const).map((t) => (
                <button key={t} style={segBtn(theme === t)} onClick={() => { if (theme !== t) toggleTheme(); }}>{t}</button>
              ))}
            </div>
          </div>

          <div style={groupStyle}>
            <span className="eyebrow" style={{ fontSize: 10 }}>Font pairing</span>
            <div style={segStyle}>
              {(['space','archivo','dm','manrope'] as const).map((k) => (
                <button key={k} style={{ ...segBtn(tweaks.font === k), fontSize: 11 }} onClick={() => setTweaks({ font: k })}>
                  {k === 'dm' ? 'DM' : k[0].toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={groupStyle}>
            <span className="eyebrow" style={{ fontSize: 10 }}>Button style</span>
            <div style={segStyle}>
              {(['chunky','flat','glossy'] as const).map((s) => (
                <button key={s} style={segBtn(tweaks.btnStyle === s)} onClick={() => setTweaks({ btnStyle: s })}>{s}</button>
              ))}
            </div>
          </div>

          <div style={groupStyle}>
            <span className="eyebrow" style={{ fontSize: 10 }}>Corner radius · {tweaks.radius}px</span>
            <input type="range" min={0} max={28} step={1} value={tweaks.radius}
              onChange={(e) => setTweaks({ radius: +e.target.value })}
              style={{ width: '100%', accentColor: 'var(--accent-precision)' }} />
          </div>

          <div style={groupStyle}>
            <span className="eyebrow" style={{ fontSize: 10 }}>Motion · {tweaks.motion.toFixed(1)}×</span>
            <input type="range" min={0} max={2} step={0.1} value={tweaks.motion}
              onChange={(e) => setTweaks({ motion: +e.target.value })}
              style={{ width: '100%', accentColor: 'var(--accent-recall)' }} />
          </div>

          <button onClick={reset} style={{
            padding: 8, fontSize: 11, background: 'transparent',
            border: '1px dashed var(--stroke)', color: 'var(--text-muted)',
            borderRadius: 8, cursor: 'pointer',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
          }}>Reset</button>
        </div>
      </Panel>
    </div>
  );
}

export function TweaksToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open tweaks"
      style={{
        position: 'fixed', bottom: 20, right: 20,
        width: 44, height: 44, borderRadius: 12,
        background: 'var(--surface)', color: 'var(--text)',
        border: '1.5px solid var(--stroke-strong)',
        cursor: 'pointer', display: 'grid', placeItems: 'center',
        zIndex: 9998, boxShadow: 'var(--shadow-card)',
      }}
    >
      <Icon name="settings" size={18} />
    </button>
  );
}

/** Convenience — mount once. Handles its own open/close state. */
export function TweaksDock() {
  const [open, setOpen] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  // Hide on /game/* routes
  React.useEffect(() => {
    const check = () => setHidden(window.location.pathname.startsWith('/game/'));
    check();
    window.addEventListener('popstate', check);
    // MutationObserver to catch Next.js client-side navigation
    const observer = new MutationObserver(check);
    observer.observe(document.querySelector('head') || document.body, { childList: true, subtree: true });
    return () => { window.removeEventListener('popstate', check); observer.disconnect(); };
  }, []);

  if (hidden) return null;

  return (
    <>
      {!open && <TweaksToggle onClick={() => setOpen(true)} />}
      <TweaksPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
