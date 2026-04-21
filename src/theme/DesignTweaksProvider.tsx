'use client';

import * as React from 'react';

export type Theme = 'dark' | 'light';
export type FontPair = 'space' | 'archivo' | 'dm' | 'manrope';
export type BtnStyle = 'chunky' | 'flat' | 'glossy';

export interface DesignTweaks {
  theme: Theme;
  font: FontPair;
  btnStyle: BtnStyle;
  radius: number;  // 0–28 px
  motion: number;  // 0–2 ×
}

export const DEFAULT_TWEAKS: DesignTweaks = {
  theme: 'dark',
  font: 'space',
  btnStyle: 'chunky',
  radius: 14,
  motion: 1,
};

const FONT_MAP: Record<FontPair, [string, string]> = {
  space: ['Space Grotesk', 'JetBrains Mono'],
  archivo: ['Archivo', 'JetBrains Mono'],
  dm: ['DM Sans', 'JetBrains Mono'],
  manrope: ['Manrope', 'JetBrains Mono'],
};

interface Ctx {
  tweaks: DesignTweaks;
  setTweaks: (patch: Partial<DesignTweaks>) => void;
  reset: () => void;
}

const DesignTweaksCtx = React.createContext<Ctx | null>(null);

/**
 * DesignTweaksProvider
 *
 * Wraps the app, persists tweaks to localStorage, and applies them to
 * <html> via data-attributes and CSS-variable overrides.
 *
 * IMPORTANT: if your app already manages dark/light mode (next-themes,
 * a ThemeProvider, etc.), delegate the theme key to that system instead of
 * setting data-theme here. See the note at the end of this file.
 */
export function DesignTweaksProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial?: Partial<DesignTweaks>;
}) {
  const [tweaks, setState] = React.useState<DesignTweaks>(() => {
    if (typeof window === 'undefined') return { ...DEFAULT_TWEAKS, ...initial };
    try {
      const saved = localStorage.getItem('md-tweaks');
      if (saved) return { ...DEFAULT_TWEAKS, ...initial, ...JSON.parse(saved) };
    } catch {}
    return { ...DEFAULT_TWEAKS, ...initial };
  });

  // Apply to <html>
  // NOTE: `theme` (dark/light) is intentionally NOT applied here.
  // The existing ThemeProvider manages the `dark` CSS class on <html> for
  // Tailwind dark mode. Applying `data-theme` here would create a second
  // competing source of truth. Font, radius, button style, and motion are
  // safe to manage here as they are independent CSS variables.
  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-btn-style', tweaks.btnStyle);

    const [display, mono] = FONT_MAP[tweaks.font];
    root.style.setProperty('--font-display', `'${display}', system-ui, sans-serif`);
    root.style.setProperty('--font-body', `'${display}', system-ui, sans-serif`);
    root.style.setProperty('--font-mono', `'${mono}', ui-monospace, monospace`);
    root.style.setProperty('--radius-md', `${tweaks.radius}px`);
    root.style.setProperty('--radius-lg', `${tweaks.radius * 1.55}px`);
    root.style.setProperty('--radius-sm', `${Math.max(4, tweaks.radius * 0.55)}px`);
    root.style.setProperty('--motion-scale', String(tweaks.motion));

    try { localStorage.setItem('md-tweaks', JSON.stringify(tweaks)); } catch {}
  }, [tweaks]);

  const setTweaks = React.useCallback(
    (patch: Partial<DesignTweaks>) => setState((s) => ({ ...s, ...patch })),
    [],
  );
  const reset = React.useCallback(() => setState(DEFAULT_TWEAKS), []);

  const value = React.useMemo(() => ({ tweaks, setTweaks, reset }), [tweaks, setTweaks, reset]);
  return <DesignTweaksCtx.Provider value={value}>{children}</DesignTweaksCtx.Provider>;
}

export function useDesignTweaks() {
  const ctx = React.useContext(DesignTweaksCtx);
  if (!ctx) throw new Error('useDesignTweaks must be used inside <DesignTweaksProvider>');
  return ctx;
}

/**
 * NOTE ON EXISTING THEME SYSTEMS
 *
 * If your app uses `next-themes` or a similar provider that already sets
 * `html.class="dark"` or similar:
 *
 * 1. In tokens.css, change the light/dark selector to match. Examples:
 *
 *      [data-theme="dark"] {}           // default here
 *      html.dark {}                     // next-themes default
 *      [data-mode="dark"] {}            // custom
 *
 * 2. Remove the `root.setAttribute('data-theme', ...)` line above, and
 *    instead read the current theme from next-themes' useTheme() and
 *    pass it through (or just skip syncing theme here — keep the rest).
 *
 * 3. Have the Tweaks panel's Theme toggle call next-themes' setTheme()
 *    instead of setTweaks({ theme }).
 */
