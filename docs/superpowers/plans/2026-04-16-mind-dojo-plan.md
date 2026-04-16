# Mind Dojo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a brain-training mini-games app with an Engine-Shell architecture, starting with the first game "Target Precision."

**Architecture:** React/Next.js app shell handles UI (menus, HUD, themes, routing). Pure TypeScript game engines handle canvas rendering and game logic. Communication is event-driven through a `MiniGame` interface. Each game is code-split via `next/dynamic`.

**Tech Stack:** Next.js 15+ (App Router), React 19+, Tailwind CSS 4, TypeScript, Raw Canvas API, IndexedDB, localStorage, Vitest

**Spec:** `docs/superpowers/specs/2026-04-16-mind-dojo-design.md`

---

## File Map

### Create (new files)

| File | Responsibility |
|------|---------------|
| `src/engine/types.ts` | MiniGame interface, GameEventType, GameConfig, GameResult, GameEventCallback |
| `src/engine/loop.ts` | requestAnimationFrame game loop with delta-time |
| `src/engine/input.ts` | Canvas click/touch input handler |
| `src/engine/math.ts` | Distance calculation, easing, color interpolation |
| `src/storage/preferences.ts` | localStorage wrapper for theme + lastPlayedGame |
| `src/storage/gameStore.ts` | IndexedDB wrapper for game results |
| `src/theme/colors.ts` | Shell color palette (dark/light) |
| `src/theme/gameColors.ts` | In-game color tokens (gradient, bullseye, feedback) |
| `src/theme/ThemeProvider.tsx` | React context for dark/light theme |
| `src/games/registry.ts` | Game metadata registry with dynamic imports |
| `src/games/target-precision/config.ts` | Level progression, tuning constants |
| `src/games/target-precision/entities.ts` | Target class with object pooling |
| `src/games/target-precision/renderer.ts` | Canvas rendering (targets, background, effects) |
| `src/games/target-precision/engine.ts` | TargetPrecisionEngine implementing MiniGame |
| `src/games/target-precision/index.tsx` | React wrapper (canvas mount + event bridge) |
| `src/components/shell/MenuDrawer.tsx` | Slide-in drawer with game list + theme toggle |
| `src/components/shell/ThemeToggle.tsx` | Dark/light switch component |
| `src/components/shell/GameHUD.tsx` | In-game overlay (score, lives, timer, level) |
| `src/components/screens/StartScreen.tsx` | Pre-game screen with best stats |
| `src/app/layout.tsx` | Root layout with ThemeProvider |
| `src/app/page.tsx` | Redirect to last-played game |
| `src/app/game/[slug]/page.tsx` | Dynamic game route with code splitting |
| `src/__tests__/engine/math.test.ts` | Tests for math utilities |
| `src/__tests__/engine/loop.test.ts` | Tests for game loop |
| `src/__tests__/engine/input.test.ts` | Tests for input handler |
| `src/__tests__/storage/preferences.test.ts` | Tests for localStorage wrapper |
| `src/__tests__/storage/gameStore.test.ts` | Tests for IndexedDB wrapper |
| `src/__tests__/games/target-precision/config.test.ts` | Tests for level config |
| `src/__tests__/games/target-precision/entities.test.ts` | Tests for Target entity + object pool |
| `src/__tests__/games/target-precision/engine.test.ts` | Tests for game engine lifecycle + events |

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `vitest.config.ts`

- [ ] **Step 1: Initialize Next.js with Tailwind**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --turbopack
```

When prompted, accept defaults. This creates the full Next.js scaffold with App Router, TypeScript, Tailwind CSS, and ESLint.

- [ ] **Step 2: Verify the scaffold runs**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npm run dev &
sleep 5
curl -s http://localhost:3000 | head -20
kill %1
```

Expected: HTML response from Next.js dev server.

- [ ] **Step 3: Install Vitest and testing dependencies**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom fake-indexeddb
```

- [ ] **Step 4: Create vitest.config.ts**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['src/__tests__/**/*.test.ts', 'src/__tests__/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 5: Add test script to package.json**

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Clean up scaffold boilerplate**

Replace `src/app/page.tsx` with a minimal placeholder:

```tsx
export default function Home() {
  return <div>Mind Dojo</div>;
}
```

Replace `src/app/layout.tsx` with a minimal layout:

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mind Dojo',
  description: 'Brain training mini games',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Verify clean build**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 8: Commit**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind, TypeScript, Vitest"
```

---

## Task 2: Engine Types & Math Utilities

**Files:**
- Create: `src/engine/types.ts`, `src/engine/math.ts`, `src/__tests__/engine/math.test.ts`

- [ ] **Step 1: Create engine types**

Create `src/engine/types.ts`:

```ts
export interface GameConfig {
  theme: 'dark' | 'light';
}

export interface GameResult {
  score: number;
  level: number;
  timeOfDeath: number;
  timestamp: number;
}

export type GameEventType =
  | 'scoreChanged'
  | 'lifeLost'
  | 'levelUp'
  | 'gameOver'
  | 'countdown'
  | 'ready';

export interface ScoreChangedEvent {
  score: number;
}

export interface LifeLostEvent {
  livesRemaining: number;
}

export interface LevelUpEvent {
  level: number;
}

export interface GameOverEvent {
  finalScore: number;
  finalLevel: number;
  timeOfDeath: number;
}

export interface CountdownEvent {
  timeRemaining: number;
}

export type GameEventPayload =
  | ScoreChangedEvent
  | LifeLostEvent
  | LevelUpEvent
  | GameOverEvent
  | CountdownEvent
  | undefined;

export type GameEventCallback = (payload: GameEventPayload) => void;

export interface MiniGame {
  init(canvas: HTMLCanvasElement, config: GameConfig): void;
  start(): void;
  pause(): void;
  resume(): void;
  destroy(): void;
  on(event: GameEventType, callback: GameEventCallback): void;
  off(event: GameEventType, callback: GameEventCallback): void;
}
```

- [ ] **Step 2: Write failing tests for math utilities**

Create `src/__tests__/engine/math.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { distance, clamp, lerp, lerpColor, hexToRgb, rgbToHex } from '@/engine/math';

describe('distance', () => {
  it('returns 0 for same point', () => {
    expect(distance(5, 5, 5, 5)).toBe(0);
  });

  it('calculates distance between two points', () => {
    expect(distance(0, 0, 3, 4)).toBe(5);
  });

  it('works with negative coordinates', () => {
    expect(distance(-1, -1, 2, 3)).toBe(5);
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('lerp', () => {
  it('returns start at t=0', () => {
    expect(lerp(0, 100, 0)).toBe(0);
  });

  it('returns end at t=1', () => {
    expect(lerp(0, 100, 1)).toBe(100);
  });

  it('returns midpoint at t=0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });
});

describe('hexToRgb', () => {
  it('converts white', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('converts green', () => {
    expect(hexToRgb('#22c55e')).toEqual({ r: 34, g: 197, b: 94 });
  });
});

describe('rgbToHex', () => {
  it('converts white', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
  });

  it('converts black', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
  });
});

describe('lerpColor', () => {
  it('returns start color at t=0', () => {
    expect(lerpColor('#000000', '#ffffff', 0)).toBe('#000000');
  });

  it('returns end color at t=1', () => {
    expect(lerpColor('#000000', '#ffffff', 1)).toBe('#ffffff');
  });

  it('returns midpoint gray at t=0.5', () => {
    expect(lerpColor('#000000', '#ffffff', 0.5)).toBe('#808080');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/engine/math.test.ts
```

Expected: FAIL — module `@/engine/math` not found.

- [ ] **Step 4: Implement math utilities**

Create `src/engine/math.ts`:

```ts
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex color: ${hex}`);
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function lerpColor(colorA: string, colorB: string, t: number): string {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  return rgbToHex(
    lerp(a.r, b.r, t),
    lerp(a.g, b.g, t),
    lerp(a.b, b.b, t),
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/engine/math.test.ts
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
git add src/engine/types.ts src/engine/math.ts src/__tests__/engine/math.test.ts
git commit -m "feat: add engine types and math utilities"
```

---

## Task 3: Game Loop

**Files:**
- Create: `src/engine/loop.ts`, `src/__tests__/engine/loop.test.ts`

- [ ] **Step 1: Write failing tests for GameLoop**

Create `src/__tests__/engine/loop.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from '@/engine/loop';

describe('GameLoop', () => {
  let loop: GameLoop;
  let updateFn: ReturnType<typeof vi.fn>;
  let rafId: number;

  beforeEach(() => {
    rafId = 0;
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => {
      rafId++;
      return rafId;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    updateFn = vi.fn();
    loop = new GameLoop(updateFn);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts the loop and calls requestAnimationFrame', () => {
    loop.start();
    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it('stops the loop and calls cancelAnimationFrame', () => {
    loop.start();
    loop.stop();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('does not call update before start', () => {
    expect(updateFn).not.toHaveBeenCalled();
  });

  it('calls update with deltaTime when frame fires', () => {
    loop.start();

    const frameCb = vi.mocked(requestAnimationFrame).mock.calls[0][0];

    // First frame: deltaTime is 0 (initial)
    frameCb(1000);
    // Second frame: deltaTime should be 16ms
    const secondCb = vi.mocked(requestAnimationFrame).mock.calls[1][0];
    secondCb(1016);

    expect(updateFn).toHaveBeenCalledWith(16);
  });

  it('caps deltaTime to prevent spiral of death', () => {
    loop.start();

    const frameCb = vi.mocked(requestAnimationFrame).mock.calls[0][0];
    frameCb(1000);

    const secondCb = vi.mocked(requestAnimationFrame).mock.calls[1][0];
    // Simulate a 500ms gap (tab was backgrounded)
    secondCb(1500);

    // Should be capped at 100ms
    expect(updateFn).toHaveBeenLastCalledWith(100);
  });

  it('does not call update when paused', () => {
    loop.start();
    loop.pause();

    const frameCb = vi.mocked(requestAnimationFrame).mock.calls[0][0];
    frameCb(1000);

    // updateFn should not be called while paused
    // (the loop continues running to track time, but skips update)
    const callCountAtPause = updateFn.mock.calls.length;
    const secondCb = vi.mocked(requestAnimationFrame).mock.calls[1]?.[0];
    if (secondCb) secondCb(1016);

    expect(updateFn.mock.calls.length).toBe(callCountAtPause);
  });

  it('resumes after pause', () => {
    loop.start();
    const frameCb = vi.mocked(requestAnimationFrame).mock.calls[0][0];
    frameCb(1000);

    loop.pause();
    loop.resume();

    const nextCb = vi.mocked(requestAnimationFrame).mock.calls[vi.mocked(requestAnimationFrame).mock.calls.length - 1][0];
    nextCb(1100);

    // After resume, update should be called again
    expect(updateFn).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/engine/loop.test.ts
```

Expected: FAIL — module `@/engine/loop` not found.

- [ ] **Step 3: Implement GameLoop**

Create `src/engine/loop.ts`:

```ts
const MAX_DELTA = 100; // Cap at 100ms to prevent spiral of death

export class GameLoop {
  private rafId: number | null = null;
  private lastTimestamp: number = 0;
  private paused: boolean = false;
  private update: (deltaTime: number) => void;

  constructor(update: (deltaTime: number) => void) {
    this.update = update;
  }

  start(): void {
    this.paused = false;
    this.lastTimestamp = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastTimestamp = 0;
    this.paused = false;
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
    this.lastTimestamp = 0; // Reset to avoid huge delta on resume
  }

  private tick = (timestamp: number): void => {
    this.rafId = requestAnimationFrame(this.tick);

    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      return;
    }

    if (this.paused) {
      this.lastTimestamp = timestamp;
      return;
    }

    const rawDelta = timestamp - this.lastTimestamp;
    const deltaTime = Math.min(rawDelta, MAX_DELTA);
    this.lastTimestamp = timestamp;

    this.update(deltaTime);
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/engine/loop.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
git add src/engine/loop.ts src/__tests__/engine/loop.test.ts
git commit -m "feat: add game loop with delta-time and pause support"
```

---

## Task 4: Input Handler

**Files:**
- Create: `src/engine/input.ts`, `src/__tests__/engine/input.test.ts`

- [ ] **Step 1: Write failing tests for InputHandler**

Create `src/__tests__/engine/input.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InputHandler } from '@/engine/input';

function createMockCanvas(): HTMLCanvasElement {
  const listeners: Record<string, EventListener[]> = {};
  return {
    addEventListener: vi.fn((type: string, listener: EventListener) => {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: EventListener) => {
      if (listeners[type]) {
        listeners[type] = listeners[type].filter(l => l !== listener);
      }
    }),
    getBoundingClientRect: vi.fn(() => ({
      left: 10,
      top: 20,
      width: 800,
      height: 600,
      right: 810,
      bottom: 620,
      x: 10,
      y: 20,
      toJSON: () => {},
    })),
    width: 800,
    height: 600,
    __listeners: listeners,
  } as unknown as HTMLCanvasElement & { __listeners: Record<string, EventListener[]> };
}

describe('InputHandler', () => {
  let canvas: HTMLCanvasElement & { __listeners: Record<string, EventListener[]> };
  let handler: InputHandler;
  let clickCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    canvas = createMockCanvas() as HTMLCanvasElement & { __listeners: Record<string, EventListener[]> };
    clickCallback = vi.fn();
    handler = new InputHandler(canvas, clickCallback);
  });

  it('attaches click and touchstart listeners to canvas', () => {
    expect(canvas.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(canvas.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
  });

  it('converts click event to canvas-relative coordinates', () => {
    const clickListener = canvas.__listeners['click'][0];
    const event = new MouseEvent('click', { clientX: 110, clientY: 120 });
    clickListener(event);

    expect(clickCallback).toHaveBeenCalledWith(100, 100);
  });

  it('removes listeners on destroy', () => {
    handler.destroy();
    expect(canvas.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(canvas.removeEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/engine/input.test.ts
```

Expected: FAIL — module `@/engine/input` not found.

- [ ] **Step 3: Implement InputHandler**

Create `src/engine/input.ts`:

```ts
export type ClickCallback = (x: number, y: number) => void;

export class InputHandler {
  private canvas: HTMLCanvasElement;
  private callback: ClickCallback;

  constructor(canvas: HTMLCanvasElement, callback: ClickCallback) {
    this.canvas = canvas;
    this.callback = callback;
    this.canvas.addEventListener('click', this.handleClick);
    this.canvas.addEventListener('touchstart', this.handleTouch);
  }

  destroy(): void {
    this.canvas.removeEventListener('click', this.handleClick);
    this.canvas.removeEventListener('touchstart', this.handleTouch);
  }

  private handleClick = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.callback(x, y);
  };

  private handleTouch = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.callback(x, y);
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/engine/input.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
git add src/engine/input.ts src/__tests__/engine/input.test.ts
git commit -m "feat: add canvas input handler for click and touch"
```

---

## Task 5: Storage Layer

**Files:**
- Create: `src/storage/preferences.ts`, `src/storage/gameStore.ts`, `src/__tests__/storage/preferences.test.ts`, `src/__tests__/storage/gameStore.test.ts`

- [ ] **Step 1: Write failing tests for preferences**

Create `src/__tests__/storage/preferences.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getLastPlayedGame, setLastPlayedGame, getTheme, setTheme } from '@/storage/preferences';

describe('preferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('lastPlayedGame', () => {
    it('returns null when not set', () => {
      expect(getLastPlayedGame()).toBeNull();
    });

    it('stores and retrieves the slug', () => {
      setLastPlayedGame('target-precision');
      expect(getLastPlayedGame()).toBe('target-precision');
    });
  });

  describe('theme', () => {
    it('returns dark as default', () => {
      expect(getTheme()).toBe('dark');
    });

    it('stores and retrieves theme', () => {
      setTheme('light');
      expect(getTheme()).toBe('light');
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/storage/preferences.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement preferences**

Create `src/storage/preferences.ts`:

```ts
const KEYS = {
  LAST_PLAYED_GAME: 'mind-dojo:lastPlayedGame',
  THEME: 'mind-dojo:theme',
} as const;

export function getLastPlayedGame(): string | null {
  return localStorage.getItem(KEYS.LAST_PLAYED_GAME);
}

export function setLastPlayedGame(slug: string): void {
  localStorage.setItem(KEYS.LAST_PLAYED_GAME, slug);
}

export type Theme = 'dark' | 'light';

export function getTheme(): Theme {
  const stored = localStorage.getItem(KEYS.THEME);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(KEYS.THEME, theme);
}
```

- [ ] **Step 4: Run preferences tests to verify they pass**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/storage/preferences.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Write failing tests for gameStore**

Create `src/__tests__/storage/gameStore.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { openGameDB, saveResult, getBestStats, getHistory } from '@/storage/gameStore';
import type { GameResult } from '@/engine/types';

describe('gameStore', () => {
  beforeEach(async () => {
    // Delete the database between tests for isolation
    indexedDB.deleteDatabase('mind-dojo');
    await openGameDB();
  });

  it('returns empty stats when no results exist', async () => {
    const stats = await getBestStats('target-precision');
    expect(stats).toBeNull();
  });

  it('saves and retrieves best stats', async () => {
    const result: GameResult = {
      score: 100,
      level: 3,
      timeOfDeath: 15,
      timestamp: Date.now(),
    };
    await saveResult('target-precision', result);

    const stats = await getBestStats('target-precision');
    expect(stats).not.toBeNull();
    expect(stats!.bestScore).toBe(100);
    expect(stats!.bestLevel).toBe(3);
    expect(stats!.lastTimeOfDeath).toBe(15);
  });

  it('returns highest score and level across multiple results', async () => {
    await saveResult('target-precision', {
      score: 100, level: 3, timeOfDeath: 15, timestamp: 1000,
    });
    await saveResult('target-precision', {
      score: 250, level: 5, timeOfDeath: 8, timestamp: 2000,
    });
    await saveResult('target-precision', {
      score: 80, level: 2, timeOfDeath: 22, timestamp: 3000,
    });

    const stats = await getBestStats('target-precision');
    expect(stats!.bestScore).toBe(250);
    expect(stats!.bestLevel).toBe(5);
    // lastTimeOfDeath is from the most recent game (highest timestamp)
    expect(stats!.lastTimeOfDeath).toBe(22);
  });

  it('isolates stats by game slug', async () => {
    await saveResult('target-precision', {
      score: 100, level: 3, timeOfDeath: 15, timestamp: 1000,
    });
    await saveResult('other-game', {
      score: 500, level: 10, timeOfDeath: 5, timestamp: 2000,
    });

    const stats = await getBestStats('target-precision');
    expect(stats!.bestScore).toBe(100);
  });

  it('returns history ordered by most recent first', async () => {
    await saveResult('target-precision', {
      score: 100, level: 3, timeOfDeath: 15, timestamp: 1000,
    });
    await saveResult('target-precision', {
      score: 250, level: 5, timeOfDeath: 8, timestamp: 2000,
    });

    const history = await getHistory('target-precision');
    expect(history).toHaveLength(2);
    expect(history[0].score).toBe(250); // most recent first
    expect(history[1].score).toBe(100);
  });

  it('limits history results', async () => {
    for (let i = 0; i < 10; i++) {
      await saveResult('target-precision', {
        score: i * 10, level: 1, timeOfDeath: 20, timestamp: i * 1000,
      });
    }

    const history = await getHistory('target-precision', 3);
    expect(history).toHaveLength(3);
  });
});
```

- [ ] **Step 6: Run gameStore tests to verify they fail**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/storage/gameStore.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 7: Implement gameStore**

Create `src/storage/gameStore.ts`:

```ts
import type { GameResult } from '@/engine/types';

const DB_NAME = 'mind-dojo';
const DB_VERSION = 1;
const STORE_NAME = 'gameResults';

let dbPromise: Promise<IDBDatabase> | null = null;

export interface BestStats {
  bestScore: number;
  bestLevel: number;
  lastTimeOfDeath: number;
}

interface StoredResult extends GameResult {
  gameSlug: string;
}

export function openGameDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('gameSlug', 'gameSlug', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export async function saveResult(gameSlug: string, result: GameResult): Promise<void> {
  const db = await openGameDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const stored: StoredResult = { ...result, gameSlug };
  store.add(stored);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getBestStats(gameSlug: string): Promise<BestStats | null> {
  const db = await openGameDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('gameSlug');
  const request = index.getAll(gameSlug);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const results: StoredResult[] = request.result;
      if (results.length === 0) {
        resolve(null);
        return;
      }

      let bestScore = 0;
      let bestLevel = 0;
      let latestTimestamp = 0;
      let lastTimeOfDeath = 0;

      for (const r of results) {
        if (r.score > bestScore) bestScore = r.score;
        if (r.level > bestLevel) bestLevel = r.level;
        if (r.timestamp > latestTimestamp) {
          latestTimestamp = r.timestamp;
          lastTimeOfDeath = r.timeOfDeath;
        }
      }

      resolve({ bestScore, bestLevel, lastTimeOfDeath });
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getHistory(
  gameSlug: string,
  limit?: number,
): Promise<GameResult[]> {
  const db = await openGameDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('gameSlug');
  const request = index.getAll(gameSlug);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const results: StoredResult[] = request.result;
      // Sort by timestamp descending (most recent first)
      results.sort((a, b) => b.timestamp - a.timestamp);

      const limited = limit ? results.slice(0, limit) : results;
      resolve(
        limited.map(({ gameSlug: _, ...rest }) => rest as GameResult),
      );
    };
    request.onerror = () => reject(request.error);
  });
}
```

- [ ] **Step 8: Run all storage tests to verify they pass**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/storage/
```

Expected: All PASS.

- [ ] **Step 9: Commit**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
git add src/storage/ src/__tests__/storage/
git commit -m "feat: add storage layer (localStorage preferences + IndexedDB game results)"
```

---

## Task 6: Theme System

**Files:**
- Create: `src/theme/colors.ts`, `src/theme/gameColors.ts`, `src/theme/ThemeProvider.tsx`

- [ ] **Step 1: Create shell color palette**

Create `src/theme/colors.ts`:

```ts
export const palette = {
  dark: {
    bg: '#0a0a0f',
    surface: '#16161f',
    text: '#e8e8ed',
    textMuted: '#8888a0',
    accent: '#6366f1',
    border: '#2a2a3a',
  },
  light: {
    bg: '#f8f8fc',
    surface: '#ffffff',
    text: '#1a1a2e',
    textMuted: '#6b7280',
    accent: '#4f46e5',
    border: '#e2e2ea',
  },
} as const;

export type ThemeColors = typeof palette.dark;
```

- [ ] **Step 2: Create game color tokens**

Create `src/theme/gameColors.ts`:

```ts
export const gameColors = {
  targetGradient: {
    start: '#22c55e',  // green
    mid: '#f59e0b',    // orange
    end: '#ef4444',    // red
  },
  bullseye: {
    dark: '#ffffff',
    light: '#1a1a2e',
  },
  hitFeedback: '#6366f1',
  lifeLostVignette: '#ef4444',
  canvasBg: {
    dark: '#0a0a0f',
    light: '#f0f0f5',
  },
} as const;
```

- [ ] **Step 3: Create ThemeProvider**

Create `src/theme/ThemeProvider.tsx`:

```tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTheme, setTheme as storeTheme, type Theme } from '@/storage/preferences';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    storeTheme(next);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
```

- [ ] **Step 4: Verify no TypeScript errors**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No errors (or only pre-existing Next.js scaffold warnings).

- [ ] **Step 5: Commit**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
git add src/theme/
git commit -m "feat: add theme system with dark/light palette and ThemeProvider"
```

---

## Task 7: Target Precision — Config & Entities

**Files:**
- Create: `src/games/target-precision/config.ts`, `src/games/target-precision/entities.ts`, `src/__tests__/games/target-precision/config.test.ts`, `src/__tests__/games/target-precision/entities.test.ts`

- [ ] **Step 1: Write failing tests for config**

Create `src/__tests__/games/target-precision/config.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getLevelConfig, GAME_DEFAULTS } from '@/games/target-precision/config';

describe('getLevelConfig', () => {
  it('returns level 1 config', () => {
    const config = getLevelConfig(1);
    expect(config.maxTargets).toBe(1);
    expect(config.shrinkDuration).toBe(5000);
    expect(config.levelDuration).toBe(30000);
  });

  it('returns level 2 config with more targets and faster shrink', () => {
    const config = getLevelConfig(2);
    expect(config.maxTargets).toBe(2);
    expect(config.shrinkDuration).toBeLessThan(5000);
    expect(config.levelDuration).toBe(30000);
  });

  it('returns level 3 config with longer level duration', () => {
    const config = getLevelConfig(3);
    expect(config.maxTargets).toBe(3);
    expect(config.levelDuration).toBe(35000);
  });

  it('escalates beyond defined levels using formula', () => {
    const config = getLevelConfig(10);
    expect(config.maxTargets).toBeGreaterThan(3);
    expect(config.shrinkDuration).toBeLessThan(4000);
  });

  it('never goes below minimum shrink duration', () => {
    const config = getLevelConfig(100);
    expect(config.shrinkDuration).toBeGreaterThanOrEqual(GAME_DEFAULTS.minShrinkDuration);
  });
});

describe('GAME_DEFAULTS', () => {
  it('has correct initial lives', () => {
    expect(GAME_DEFAULTS.initialLives).toBe(3);
  });

  it('has bullseye hit radius', () => {
    expect(GAME_DEFAULTS.bullseyeRadius).toBe(8);
  });

  it('has inner circle radius', () => {
    expect(GAME_DEFAULTS.innerRadius).toBe(15);
  });

  it('has outer circle radius', () => {
    expect(GAME_DEFAULTS.outerRadius).toBe(60);
  });
});
```

- [ ] **Step 2: Run config tests to verify they fail**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/games/target-precision/config.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement config**

Create `src/games/target-precision/config.ts`:

```ts
export const GAME_DEFAULTS = {
  initialLives: 3,
  bullseyeRadius: 8,
  innerRadius: 15,
  outerRadius: 60,
  edgePadding: 80,
  minTargetDistance: 140,
  minShrinkDuration: 1500,
  basePoints: 100,
} as const;

export interface LevelConfig {
  maxTargets: number;
  shrinkDuration: number; // ms
  levelDuration: number;  // ms
}

const DEFINED_LEVELS: LevelConfig[] = [
  { maxTargets: 1, shrinkDuration: 5000, levelDuration: 30000 }, // Level 1
  { maxTargets: 2, shrinkDuration: 4500, levelDuration: 30000 }, // Level 2
  { maxTargets: 3, shrinkDuration: 4000, levelDuration: 35000 }, // Level 3
  { maxTargets: 4, shrinkDuration: 3500, levelDuration: 35000 }, // Level 4
  { maxTargets: 5, shrinkDuration: 3000, levelDuration: 40000 }, // Level 5
];

export function getLevelConfig(level: number): LevelConfig {
  if (level <= DEFINED_LEVELS.length) {
    return DEFINED_LEVELS[level - 1];
  }

  // Escalation formula for levels beyond the defined ones
  const lastDefined = DEFINED_LEVELS[DEFINED_LEVELS.length - 1];
  const extra = level - DEFINED_LEVELS.length;

  return {
    maxTargets: lastDefined.maxTargets + extra,
    shrinkDuration: Math.max(
      GAME_DEFAULTS.minShrinkDuration,
      lastDefined.shrinkDuration - extra * 200,
    ),
    levelDuration: lastDefined.levelDuration + extra * 5000,
  };
}
```

- [ ] **Step 4: Run config tests to verify they pass**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/games/target-precision/config.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Write failing tests for Target entity and pool**

Create `src/__tests__/games/target-precision/entities.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Target, TargetPool } from '@/games/target-precision/entities';
import { GAME_DEFAULTS } from '@/games/target-precision/config';

describe('Target', () => {
  it('initializes with correct properties', () => {
    const target = new Target();
    target.spawn(100, 200, 5000);

    expect(target.x).toBe(100);
    expect(target.y).toBe(200);
    expect(target.active).toBe(true);
    expect(target.elapsed).toBe(0);
    expect(target.duration).toBe(5000);
  });

  it('calculates progress as elapsed / duration', () => {
    const target = new Target();
    target.spawn(0, 0, 4000);
    target.elapsed = 2000;

    expect(target.progress).toBeCloseTo(0.5);
  });

  it('calculates outer radius based on progress', () => {
    const target = new Target();
    target.spawn(0, 0, 4000);

    // At progress 0, outer radius = GAME_DEFAULTS.outerRadius
    target.elapsed = 0;
    expect(target.currentOuterRadius).toBe(GAME_DEFAULTS.outerRadius);

    // At progress 1, outer radius = GAME_DEFAULTS.innerRadius
    target.elapsed = 4000;
    expect(target.currentOuterRadius).toBeCloseTo(GAME_DEFAULTS.innerRadius);
  });

  it('calculates countdown number', () => {
    const target = new Target();
    target.spawn(0, 0, 5000);

    target.elapsed = 0;
    expect(target.countdownNumber).toBe(5);

    target.elapsed = 1500;
    expect(target.countdownNumber).toBe(4);

    target.elapsed = 4999;
    expect(target.countdownNumber).toBe(1);
  });

  it('reports expired when elapsed >= duration', () => {
    const target = new Target();
    target.spawn(0, 0, 3000);

    target.elapsed = 2999;
    expect(target.isExpired).toBe(false);

    target.elapsed = 3000;
    expect(target.isExpired).toBe(true);
  });

  it('deactivates on reset', () => {
    const target = new Target();
    target.spawn(100, 200, 5000);
    target.reset();

    expect(target.active).toBe(false);
    expect(target.elapsed).toBe(0);
  });
});

describe('TargetPool', () => {
  it('acquires targets from the pool', () => {
    const pool = new TargetPool(5);
    const target = pool.acquire(100, 200, 4000);

    expect(target).not.toBeNull();
    expect(target!.x).toBe(100);
    expect(target!.active).toBe(true);
  });

  it('returns null when pool is exhausted', () => {
    const pool = new TargetPool(1);
    pool.acquire(0, 0, 1000);
    const second = pool.acquire(50, 50, 1000);

    expect(second).toBeNull();
  });

  it('recycles released targets', () => {
    const pool = new TargetPool(1);
    const target = pool.acquire(0, 0, 1000);
    pool.release(target!);

    const reused = pool.acquire(50, 50, 2000);
    expect(reused).not.toBeNull();
    expect(reused!.x).toBe(50);
  });

  it('returns all active targets', () => {
    const pool = new TargetPool(5);
    pool.acquire(0, 0, 1000);
    pool.acquire(50, 50, 1000);

    expect(pool.activeTargets).toHaveLength(2);
  });

  it('releaseAll resets all targets', () => {
    const pool = new TargetPool(5);
    pool.acquire(0, 0, 1000);
    pool.acquire(50, 50, 1000);
    pool.releaseAll();

    expect(pool.activeTargets).toHaveLength(0);
  });
});
```

- [ ] **Step 6: Run entity tests to verify they fail**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/games/target-precision/entities.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 7: Implement Target entity and TargetPool**

Create `src/games/target-precision/entities.ts`:

```ts
import { GAME_DEFAULTS } from './config';
import { lerp } from '@/engine/math';

export class Target {
  x: number = 0;
  y: number = 0;
  active: boolean = false;
  elapsed: number = 0;
  duration: number = 0;

  spawn(x: number, y: number, duration: number): void {
    this.x = x;
    this.y = y;
    this.active = true;
    this.elapsed = 0;
    this.duration = duration;
  }

  reset(): void {
    this.active = false;
    this.elapsed = 0;
  }

  get progress(): number {
    return Math.min(this.elapsed / this.duration, 1);
  }

  get currentOuterRadius(): number {
    return lerp(GAME_DEFAULTS.outerRadius, GAME_DEFAULTS.innerRadius, this.progress);
  }

  get countdownNumber(): number {
    const totalSeconds = Math.ceil(this.duration / 1000);
    const remaining = Math.ceil((this.duration - this.elapsed) / 1000);
    return Math.max(1, Math.min(remaining, totalSeconds));
  }

  get isExpired(): boolean {
    return this.elapsed >= this.duration;
  }
}

export class TargetPool {
  private pool: Target[];

  constructor(size: number) {
    this.pool = Array.from({ length: size }, () => new Target());
  }

  acquire(x: number, y: number, duration: number): Target | null {
    const target = this.pool.find(t => !t.active);
    if (!target) return null;
    target.spawn(x, y, duration);
    return target;
  }

  release(target: Target): void {
    target.reset();
  }

  releaseAll(): void {
    for (const target of this.pool) {
      target.reset();
    }
  }

  get activeTargets(): Target[] {
    return this.pool.filter(t => t.active);
  }
}
```

- [ ] **Step 8: Run entity tests to verify they pass**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/games/target-precision/entities.test.ts
```

Expected: All PASS.

- [ ] **Step 9: Commit**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
git add src/games/target-precision/config.ts src/games/target-precision/entities.ts src/__tests__/games/target-precision/
git commit -m "feat: add Target Precision config and entity system with object pooling"
```

---

## Task 8: Target Precision — Renderer

**Files:**
- Create: `src/games/target-precision/renderer.ts`

The renderer draws to canvas — it's tested visually in the browser rather than unit tested.

- [ ] **Step 1: Create renderer**

Create `src/games/target-precision/renderer.ts`:

```ts
import { Target } from './entities';
import { GAME_DEFAULTS } from './config';
import { lerpColor } from '@/engine/math';
import { gameColors } from '@/theme/gameColors';
import type { GameConfig } from '@/engine/types';

export class TargetPrecisionRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private theme: GameConfig['theme'];
  private dpr: number;

  // Pre-calculated gradient stops
  private gradientStops: string[] = [];
  private readonly GRADIENT_RESOLUTION = 100;

  constructor(canvas: HTMLCanvasElement, theme: GameConfig['theme']) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2d context');
    this.ctx = ctx;
    this.canvas = canvas;
    this.theme = theme;
    this.dpr = window.devicePixelRatio || 1;
    this.preCalculateGradient();
    this.setupCanvas();
  }

  private preCalculateGradient(): void {
    const { start, mid, end } = gameColors.targetGradient;
    this.gradientStops = [];

    for (let i = 0; i <= this.GRADIENT_RESOLUTION; i++) {
      const t = i / this.GRADIENT_RESOLUTION;
      if (t <= 0.5) {
        // green -> orange (first half)
        this.gradientStops.push(lerpColor(start, mid, t * 2));
      } else {
        // orange -> red (second half)
        this.gradientStops.push(lerpColor(mid, end, (t - 0.5) * 2));
      }
    }
  }

  setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  get width(): number {
    return this.canvas.width / this.dpr;
  }

  get height(): number {
    return this.canvas.height / this.dpr;
  }

  clear(): void {
    const bg = gameColors.canvasBg[this.theme];
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawTarget(target: Target): void {
    if (!target.active) return;

    const { x, y } = target;
    const outerR = target.currentOuterRadius;
    const innerR = GAME_DEFAULTS.innerRadius;
    const progress = target.progress;

    // Outer circle with gradient color
    const colorIndex = Math.min(
      Math.floor(progress * this.GRADIENT_RESOLUTION),
      this.GRADIENT_RESOLUTION,
    );
    const color = this.gradientStops[colorIndex];

    this.ctx.beginPath();
    this.ctx.arc(x, y, outerR, 0, Math.PI * 2);
    this.ctx.fillStyle = color + '33'; // 20% opacity fill
    this.ctx.fill();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Inner circle (bullseye)
    const bullseyeColor = gameColors.bullseye[this.theme];
    this.ctx.beginPath();
    this.ctx.arc(x, y, innerR, 0, Math.PI * 2);
    this.ctx.fillStyle = bullseyeColor + '22'; // subtle fill
    this.ctx.fill();
    this.ctx.strokeStyle = bullseyeColor;
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Bullseye dot (hit zone visual hint)
    this.ctx.beginPath();
    this.ctx.arc(x, y, GAME_DEFAULTS.bullseyeRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = bullseyeColor + '44';
    this.ctx.fill();

    // Countdown number
    this.ctx.fillStyle = bullseyeColor;
    this.ctx.font = 'bold 16px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(String(target.countdownNumber), x, y);
  }

  drawTargets(targets: Target[]): void {
    for (const target of targets) {
      this.drawTarget(target);
    }
  }

  drawHitEffect(x: number, y: number): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, GAME_DEFAULTS.outerRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = gameColors.hitFeedback + '33';
    this.ctx.fill();
  }

  drawLifeLostVignette(intensity: number): void {
    if (intensity <= 0) return;

    const alpha = Math.floor(intensity * 80).toString(16).padStart(2, '0');
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, this.width * 0.3,
      this.width / 2, this.height / 2, this.width * 0.7,
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, gameColors.lifeLostVignette + alpha);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  setTheme(theme: GameConfig['theme']): void {
    this.theme = theme;
  }
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No errors related to renderer.

- [ ] **Step 3: Commit**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
git add src/games/target-precision/renderer.ts
git commit -m "feat: add Target Precision canvas renderer with gradient and effects"
```

---

## Task 9: Target Precision — Game Engine

**Files:**
- Create: `src/games/target-precision/engine.ts`, `src/__tests__/games/target-precision/engine.test.ts`

- [ ] **Step 1: Write failing tests for the engine**

Create `src/__tests__/games/target-precision/engine.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TargetPrecisionEngine } from '@/games/target-precision/engine';
import type { GameConfig, GameOverEvent, LifeLostEvent, ScoreChangedEvent, LevelUpEvent } from '@/engine/types';

// Mock canvas and context
function createMockCanvas(): HTMLCanvasElement {
  const listeners: Record<string, EventListener[]> = {};
  return {
    addEventListener: vi.fn((type: string, listener: EventListener) => {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(listener);
    }),
    removeEventListener: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({
      left: 0, top: 0, width: 800, height: 600,
      right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {},
    })),
    getContext: vi.fn(() => ({
      fillRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      scale: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
    })),
    width: 800,
    height: 600,
    __listeners: listeners,
  } as unknown as HTMLCanvasElement & { __listeners: Record<string, EventListener[]> };
}

describe('TargetPrecisionEngine', () => {
  let engine: TargetPrecisionEngine;
  let canvas: ReturnType<typeof createMockCanvas>;
  const config: GameConfig = { theme: 'dark' };

  beforeEach(() => {
    vi.stubGlobal('devicePixelRatio', 1);
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => {
      return 1;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    canvas = createMockCanvas();
    engine = new TargetPrecisionEngine();
  });

  it('emits ready after init', () => {
    const readyCb = vi.fn();
    engine.on('ready', readyCb);
    engine.init(canvas, config);

    expect(readyCb).toHaveBeenCalled();
  });

  it('starts with correct initial state', () => {
    engine.init(canvas, config);
    engine.start();

    // Should have started the game loop
    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it('emits lifeLost when target expires', () => {
    const lifeLostCb = vi.fn();
    engine.on('lifeLost', lifeLostCb);
    engine.init(canvas, config);
    engine.start();

    // Simulate time passing to expire a target
    engine._testUpdate(6000); // Longer than level 1 shrink duration (5000ms)

    expect(lifeLostCb).toHaveBeenCalledWith(
      expect.objectContaining({ livesRemaining: expect.any(Number) }),
    );
  });

  it('emits gameOver when all lives lost', () => {
    const gameOverCb = vi.fn();
    engine.on('gameOver', gameOverCb);
    engine.init(canvas, config);
    engine.start();

    // Expire 3 targets to lose all 3 lives
    engine._testUpdate(6000);
    engine._testUpdate(6000);
    engine._testUpdate(6000);

    expect(gameOverCb).toHaveBeenCalledWith(
      expect.objectContaining({
        finalScore: expect.any(Number),
        finalLevel: expect.any(Number),
        timeOfDeath: expect.any(Number),
      }),
    );
  });

  it('emits scoreChanged on bullseye hit', () => {
    const scoreCb = vi.fn();
    engine.on('scoreChanged', scoreCb);
    engine.init(canvas, config);
    engine.start();

    // Spawn a target and hit it at its exact center
    engine._testUpdate(100); // Small tick to spawn a target
    const targets = engine._testGetActiveTargets();

    if (targets.length > 0) {
      const target = targets[0];
      engine._testHandleClick(target.x, target.y); // Perfect bullseye

      expect(scoreCb).toHaveBeenCalledWith(
        expect.objectContaining({ score: expect.any(Number) }),
      );
    }
  });

  it('cleans up on destroy', () => {
    engine.init(canvas, config);
    engine.start();
    engine.destroy();

    expect(cancelAnimationFrame).toHaveBeenCalled();
    expect(canvas.removeEventListener).toHaveBeenCalled();
  });

  it('can register and unregister event callbacks', () => {
    const cb = vi.fn();
    engine.on('scoreChanged', cb);
    engine.off('scoreChanged', cb);
    engine.init(canvas, config);
    engine.start();

    // Even if score changes, callback should not fire
    engine._testUpdate(100);
    const targets = engine._testGetActiveTargets();
    if (targets.length > 0) {
      engine._testHandleClick(targets[0].x, targets[0].y);
    }

    expect(cb).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/games/target-precision/engine.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement TargetPrecisionEngine**

Create `src/games/target-precision/engine.ts`:

```ts
import type {
  MiniGame,
  GameConfig,
  GameEventType,
  GameEventCallback,
  GameEventPayload,
} from '@/engine/types';
import { GameLoop } from '@/engine/loop';
import { InputHandler } from '@/engine/input';
import { distance } from '@/engine/math';
import { TargetPool, Target } from './entities';
import { TargetPrecisionRenderer } from './renderer';
import { getLevelConfig, GAME_DEFAULTS, type LevelConfig } from './config';

type EventListeners = Record<GameEventType, GameEventCallback[]>;

export class TargetPrecisionEngine implements MiniGame {
  private canvas!: HTMLCanvasElement;
  private renderer!: TargetPrecisionRenderer;
  private gameLoop!: GameLoop;
  private inputHandler!: InputHandler;
  private pool!: TargetPool;
  private config!: GameConfig;

  // Game state
  private score: number = 0;
  private lives: number = GAME_DEFAULTS.initialLives;
  private level: number = 1;
  private levelConfig!: LevelConfig;
  private levelTimeRemaining: number = 0;
  private running: boolean = false;
  private gameOver: boolean = false;

  // Effects
  private hitEffects: { x: number; y: number; age: number }[] = [];
  private vignetteIntensity: number = 0;

  // Events
  private listeners: EventListeners = {
    scoreChanged: [],
    lifeLost: [],
    levelUp: [],
    gameOver: [],
    countdown: [],
    ready: [],
  };

  // Countdown tracking
  private lastCountdownSecond: number = -1;

  init(canvas: HTMLCanvasElement, config: GameConfig): void {
    this.canvas = canvas;
    this.config = config;
    this.renderer = new TargetPrecisionRenderer(canvas, config.theme);
    this.pool = new TargetPool(20);
    this.gameLoop = new GameLoop(this.update);
    this.inputHandler = new InputHandler(canvas, this.handleClick);
    this.resetState();
    this.emit('ready', undefined);
  }

  start(): void {
    this.resetState();
    this.running = true;
    this.gameOver = false;
    this.levelConfig = getLevelConfig(this.level);
    this.levelTimeRemaining = this.levelConfig.levelDuration;
    this.lastCountdownSecond = Math.ceil(this.levelTimeRemaining / 1000);
    this.gameLoop.start();
  }

  pause(): void {
    this.gameLoop.pause();
  }

  resume(): void {
    this.gameLoop.resume();
  }

  destroy(): void {
    this.gameLoop.stop();
    this.inputHandler.destroy();
    this.pool.releaseAll();
  }

  on(event: GameEventType, callback: GameEventCallback): void {
    this.listeners[event].push(callback);
  }

  off(event: GameEventType, callback: GameEventCallback): void {
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  private emit(event: GameEventType, payload: GameEventPayload): void {
    for (const cb of this.listeners[event]) {
      cb(payload);
    }
  }

  private resetState(): void {
    this.score = 0;
    this.lives = GAME_DEFAULTS.initialLives;
    this.level = 1;
    this.running = false;
    this.gameOver = false;
    this.hitEffects = [];
    this.vignetteIntensity = 0;
    this.pool.releaseAll();
  }

  private update = (deltaTime: number): void => {
    if (!this.running || this.gameOver) return;

    // Update level timer
    this.levelTimeRemaining -= deltaTime;
    const currentSecond = Math.ceil(this.levelTimeRemaining / 1000);
    if (currentSecond !== this.lastCountdownSecond) {
      this.lastCountdownSecond = currentSecond;
      this.emit('countdown', { timeRemaining: Math.max(0, this.levelTimeRemaining / 1000) });
    }

    // Check level complete
    if (this.levelTimeRemaining <= 0) {
      this.advanceLevel();
      return;
    }

    // Update targets
    const activeTargets = this.pool.activeTargets;
    for (const target of activeTargets) {
      target.elapsed += deltaTime;

      if (target.isExpired) {
        this.pool.release(target);
        this.loseLife();
        if (this.gameOver) return;
      }
    }

    // Spawn targets to maintain level count
    this.spawnTargets();

    // Update effects
    this.updateEffects(deltaTime);

    // Render
    this.render();
  };

  private spawnTargets(): void {
    const active = this.pool.activeTargets;
    while (active.length < this.levelConfig.maxTargets) {
      const pos = this.findSpawnPosition(active);
      if (!pos) break;

      const target = this.pool.acquire(pos.x, pos.y, this.levelConfig.shrinkDuration);
      if (!target) break;
      active.push(target); // Update local reference
    }
  }

  private findSpawnPosition(
    activeTargets: Target[],
  ): { x: number; y: number } | null {
    const padding = GAME_DEFAULTS.edgePadding;
    const w = this.renderer.width;
    const h = this.renderer.height;
    const minDist = GAME_DEFAULTS.minTargetDistance;

    // Try up to 50 times to find a non-overlapping position
    for (let attempt = 0; attempt < 50; attempt++) {
      const x = padding + Math.random() * (w - padding * 2);
      const y = padding + Math.random() * (h - padding * 2);

      let valid = true;
      for (const target of activeTargets) {
        if (distance(x, y, target.x, target.y) < minDist) {
          valid = false;
          break;
        }
      }

      if (valid) return { x, y };
    }

    return null;
  }

  private handleClick = (x: number, y: number): void => {
    if (!this.running || this.gameOver) return;

    const targets = this.pool.activeTargets;
    let closestTarget: Target | null = null;
    let closestDist = Infinity;

    for (const target of targets) {
      const dist = distance(x, y, target.x, target.y);
      if (dist < closestDist) {
        closestDist = dist;
        closestTarget = target;
      }
    }

    if (closestTarget && closestDist <= GAME_DEFAULTS.bullseyeRadius) {
      // Hit! Calculate score
      const accuracyMultiplier = 1 - (closestDist / GAME_DEFAULTS.bullseyeRadius);
      const timeRatio = 1 - closestTarget.progress;
      const speedMultiplier = 0.5 + timeRatio * 0.5; // Range 0.5-1.0
      const basePoints = GAME_DEFAULTS.basePoints * this.level;
      const points = Math.round(accuracyMultiplier * speedMultiplier * basePoints);

      this.score += points;
      this.emit('scoreChanged', { score: this.score });

      // Add hit effect
      this.hitEffects.push({ x: closestTarget.x, y: closestTarget.y, age: 0 });

      this.pool.release(closestTarget);
    }
  };

  private loseLife(): void {
    this.lives--;
    this.vignetteIntensity = 1;
    this.emit('lifeLost', { livesRemaining: this.lives });

    if (this.lives <= 0) {
      this.running = false;
      this.gameOver = true;
      this.emit('gameOver', {
        finalScore: this.score,
        finalLevel: this.level,
        timeOfDeath: Math.max(0, this.levelTimeRemaining / 1000),
      });
    }
  }

  private advanceLevel(): void {
    this.level++;
    this.pool.releaseAll();
    this.levelConfig = getLevelConfig(this.level);
    this.levelTimeRemaining = this.levelConfig.levelDuration;
    this.lastCountdownSecond = Math.ceil(this.levelTimeRemaining / 1000);
    this.emit('levelUp', { level: this.level });
    this.emit('countdown', { timeRemaining: this.levelTimeRemaining / 1000 });
  }

  private updateEffects(deltaTime: number): void {
    // Fade vignette
    if (this.vignetteIntensity > 0) {
      this.vignetteIntensity = Math.max(0, this.vignetteIntensity - deltaTime / 500);
    }

    // Age and remove hit effects
    for (let i = this.hitEffects.length - 1; i >= 0; i--) {
      this.hitEffects[i].age += deltaTime;
      if (this.hitEffects[i].age > 300) {
        this.hitEffects.splice(i, 1);
      }
    }
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.drawTargets(this.pool.activeTargets);

    // Draw hit effects
    for (const effect of this.hitEffects) {
      this.renderer.drawHitEffect(effect.x, effect.y);
    }

    // Draw life lost vignette
    this.renderer.drawLifeLostVignette(this.vignetteIntensity);
  }

  // Test-only methods (prefixed with _test)
  _testUpdate(deltaTime: number): void {
    this.update(deltaTime);
  }

  _testGetActiveTargets(): Target[] {
    return this.pool.activeTargets;
  }

  _testHandleClick(x: number, y: number): void {
    this.handleClick(x, y);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run src/__tests__/games/target-precision/engine.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Run all tests to check for regressions**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
git add src/games/target-precision/engine.ts src/__tests__/games/target-precision/engine.test.ts
git commit -m "feat: implement Target Precision game engine with scoring, lives, levels"
```

---

## Task 10: Game Registry & React Wrapper

**Files:**
- Create: `src/games/registry.ts`, `src/games/target-precision/index.tsx`

- [ ] **Step 1: Create game registry**

Create `src/games/registry.ts`:

```ts
import type { ComponentType } from 'react';

export interface GameEntry {
  name: string;
  slug: string;
  description: string;
  loader: () => Promise<{ default: ComponentType<GameComponentProps> }>;
}

export interface GameComponentProps {
  theme: 'dark' | 'light';
  onGameOver: (result: { score: number; level: number; timeOfDeath: number }) => void;
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onLevelChange: (level: number) => void;
  onCountdown: (timeRemaining: number) => void;
  engineRef: React.MutableRefObject<{ pause: () => void; resume: () => void; start: () => void } | null>;
}

export const registry: Record<string, GameEntry> = {
  'target-precision': {
    name: 'Target Precision',
    slug: 'target-precision',
    description: 'Hit the bullseye before time runs out',
    loader: () => import('./target-precision'),
  },
};

export const DEFAULT_GAME = 'target-precision';

export function getGameSlugs(): string[] {
  return Object.keys(registry);
}

export function getGameEntry(slug: string): GameEntry | undefined {
  return registry[slug];
}
```

- [ ] **Step 2: Create React wrapper for Target Precision**

Create `src/games/target-precision/index.tsx`:

```tsx
'use client';

import { useRef, useEffect, useCallback } from 'react';
import { TargetPrecisionEngine } from './engine';
import type { GameComponentProps } from '../registry';
import type {
  ScoreChangedEvent,
  LifeLostEvent,
  LevelUpEvent,
  GameOverEvent,
  CountdownEvent,
  GameEventPayload,
} from '@/engine/types';

export default function TargetPrecisionGame({
  theme,
  onGameOver,
  onScoreChange,
  onLivesChange,
  onLevelChange,
  onCountdown,
  engineRef,
}: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineInstanceRef = useRef<TargetPrecisionEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new TargetPrecisionEngine();
    engineInstanceRef.current = engine;

    // Wire up events
    engine.on('scoreChanged', (p: GameEventPayload) => {
      const payload = p as ScoreChangedEvent;
      onScoreChange(payload.score);
    });
    engine.on('lifeLost', (p: GameEventPayload) => {
      const payload = p as LifeLostEvent;
      onLivesChange(payload.livesRemaining);
    });
    engine.on('levelUp', (p: GameEventPayload) => {
      const payload = p as LevelUpEvent;
      onLevelChange(payload.level);
    });
    engine.on('gameOver', (p: GameEventPayload) => {
      const payload = p as GameOverEvent;
      onGameOver({
        score: payload.finalScore,
        level: payload.finalLevel,
        timeOfDeath: payload.timeOfDeath,
      });
    });
    engine.on('countdown', (p: GameEventPayload) => {
      const payload = p as CountdownEvent;
      onCountdown(payload.timeRemaining);
    });

    // Expose pause/resume to parent
    engineRef.current = {
      pause: () => engine.pause(),
      resume: () => engine.resume(),
    };

    engine.init(canvas, { theme });

    // Handle resize
    const handleResize = () => {
      engine.destroy();
      engine.init(canvas, { theme });
    };

    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 200);
    };
    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
      engine.destroy();
      engineInstanceRef.current = null;
      engineRef.current = null;
    };
  }, [theme]); // Reinit on theme change

  const handleStart = useCallback(() => {
    engineInstanceRef.current?.start();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
```

Note: The `handleStart` function is exposed but the parent (game page) controls when `start()` is called via the engine ref or by re-rendering. We'll wire this up in Task 12.

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
git add src/games/registry.ts src/games/target-precision/index.tsx
git commit -m "feat: add game registry and Target Precision React wrapper"
```

---

## Task 11: App Shell Components

**Files:**
- Create: `src/components/shell/ThemeToggle.tsx`, `src/components/shell/MenuDrawer.tsx`, `src/components/shell/GameHUD.tsx`, `src/components/screens/StartScreen.tsx`

- [ ] **Step 1: Create ThemeToggle**

Create `src/components/shell/ThemeToggle.tsx`:

```tsx
'use client';

import { useTheme } from '@/theme/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg
        hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
      <span className="text-sm text-[var(--text-muted)]">
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
}
```

- [ ] **Step 2: Create MenuDrawer**

Create `src/components/shell/MenuDrawer.tsx`:

```tsx
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
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full w-72 z-50
          bg-[var(--surface)] border-r border-[var(--border)]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--text)]">Mind Dojo</h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
              aria-label="Close menu"
            >
              <span className="text-xl text-[var(--text)]">✕</span>
            </button>
          </div>

          {/* Game List */}
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
                <span className="text-lg">🎯</span>
                <div>
                  <p className="font-medium">{game.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{game.description}</p>
                </div>
              </Link>
            ))}
          </nav>

          {/* Footer */}
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
```

- [ ] **Step 3: Create GameHUD**

Create `src/components/shell/GameHUD.tsx`:

```tsx
'use client';

interface GameHUDProps {
  score: number;
  lives: number;
  level: number;
  timeRemaining: number;
  onMenuOpen: () => void;
  visible: boolean;
}

export function GameHUD({
  score,
  lives,
  level,
  timeRemaining,
  onMenuOpen,
  visible,
}: GameHUDProps) {
  if (!visible) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top row */}
      <div className="flex items-start justify-between p-4">
        {/* Menu button */}
        <button
          onClick={onMenuOpen}
          className="pointer-events-auto p-2 rounded-lg
            bg-black/20 dark:bg-white/10 backdrop-blur-sm
            hover:bg-black/30 dark:hover:bg-white/20 transition-colors"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" className="text-white">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Timer */}
        <div className="px-4 py-2 rounded-lg bg-black/20 dark:bg-white/10 backdrop-blur-sm">
          <span className="text-2xl font-mono font-bold text-white">{timeStr}</span>
        </div>

        {/* Level */}
        <div className="px-3 py-2 rounded-lg bg-black/20 dark:bg-white/10 backdrop-blur-sm">
          <span className="text-lg font-bold text-white">LV {level}</span>
        </div>
      </div>

      {/* Bottom row */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center p-4 gap-4">
        {/* Lives */}
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-xl transition-opacity ${i < lives ? 'opacity-100' : 'opacity-30'}`}
            >
              ❤️
            </span>
          ))}
        </div>

        {/* Score */}
        <div className="px-4 py-2 rounded-lg bg-black/20 dark:bg-white/10 backdrop-blur-sm">
          <span className="text-2xl font-mono font-bold text-white">
            {score.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create StartScreen**

Create `src/components/screens/StartScreen.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { getBestStats, type BestStats } from '@/storage/gameStore';

interface StartScreenProps {
  gameName: string;
  gameSlug: string;
  onStart: () => void;
  visible: boolean;
}

export function StartScreen({ gameName, gameSlug, onStart, visible }: StartScreenProps) {
  const [stats, setStats] = useState<BestStats | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (visible) {
      getBestStats(gameSlug).then((s) => {
        setStats(s);
        setLoaded(true);
      });
    }
  }, [gameSlug, visible]);

  if (!visible) return null;

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center
        bg-[var(--bg)]/90 backdrop-blur-sm cursor-pointer"
      onClick={onStart}
    >
      {/* Game name */}
      <h1 className="text-4xl font-bold text-[var(--text)] mb-8">{gameName}</h1>

      {/* Stats */}
      {loaded && (
        <div className="flex gap-8 mb-12">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Best Score
            </p>
            <p className="text-2xl font-mono font-bold text-[var(--text)]">
              {stats ? stats.bestScore.toLocaleString() : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Best Level
            </p>
            <p className="text-2xl font-mono font-bold text-[var(--text)]">
              {stats ? stats.bestLevel : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Last Time
            </p>
            <p className="text-2xl font-mono font-bold text-[var(--text)]">
              {stats ? formatTime(stats.lastTimeOfDeath) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Start prompt */}
      <p className="text-lg text-[var(--text-muted)] animate-pulse">
        Click anywhere to start
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Verify no TypeScript errors**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
git add src/components/
git commit -m "feat: add shell components (MenuDrawer, GameHUD, ThemeToggle, StartScreen)"
```

---

## Task 12: App Routes & Layout Integration

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/game/[slug]/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update globals.css with theme CSS variables**

Add to `src/app/globals.css` (keep existing Tailwind imports, add after them):

```css
@import "tailwindcss";

:root {
  --bg: #f8f8fc;
  --surface: #ffffff;
  --text: #1a1a2e;
  --text-muted: #6b7280;
  --accent: #4f46e5;
  --border: #e2e2ea;
}

.dark {
  --bg: #0a0a0f;
  --surface: #16161f;
  --text: #e8e8ed;
  --text-muted: #8888a0;
  --accent: #6366f1;
  --border: #2a2a3a;
}

html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
  background-color: var(--bg);
  color: var(--text);
}
```

- [ ] **Step 2: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { ThemeProvider } from '@/theme/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mind Dojo',
  description: 'Brain training mini games',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[var(--bg)] text-[var(--text)] h-screen overflow-hidden">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Update home page to redirect**

Replace `src/app/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { DEFAULT_GAME } from '@/games/registry';

export default function Home() {
  redirect(`/game/${DEFAULT_GAME}`);
}
```

- [ ] **Step 4: Create the dynamic game route**

Create `src/app/game/[slug]/page.tsx`:

```tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { registry, getGameEntry, DEFAULT_GAME } from '@/games/registry';
import { useTheme } from '@/theme/ThemeProvider';
import { setLastPlayedGame } from '@/storage/preferences';
import { openGameDB, saveResult } from '@/storage/gameStore';
import { MenuDrawer } from '@/components/shell/MenuDrawer';
import { GameHUD } from '@/components/shell/GameHUD';
import { StartScreen } from '@/components/screens/StartScreen';
import { GAME_DEFAULTS } from '@/games/target-precision/config';
import type { GameComponentProps } from '@/games/registry';
import type { ComponentType } from 'react';

// Dynamically import game components
const gameComponents: Record<string, ComponentType<GameComponentProps>> = {};

function useGameComponent(slug: string) {
  const [Component, setComponent] = useState<ComponentType<GameComponentProps> | null>(
    () => gameComponents[slug] || null,
  );

  useEffect(() => {
    if (gameComponents[slug]) {
      setComponent(() => gameComponents[slug]);
      return;
    }

    const entry = getGameEntry(slug);
    if (!entry) return;

    entry.loader().then((mod) => {
      gameComponents[slug] = mod.default;
      setComponent(() => mod.default);
    });
  }, [slug]);

  return Component;
}

export default function GamePage() {
  const params = useParams();
  const slug = (params.slug as string) || DEFAULT_GAME;
  const { theme } = useTheme();

  const gameEntry = getGameEntry(slug);
  const GameComponent = useGameComponent(slug);

  // Game state
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(GAME_DEFAULTS.initialLives);
  const [level, setLevel] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const engineRef = useRef<{ pause: () => void; resume: () => void } | null>(null);

  // Save last played game
  useEffect(() => {
    setLastPlayedGame(slug);
    openGameDB(); // Ensure DB is ready
  }, [slug]);

  // Reset state when game changes
  useEffect(() => {
    setGameState('idle');
    setScore(0);
    setLives(GAME_DEFAULTS.initialLives);
    setLevel(1);
    setTimeRemaining(0);
  }, [slug]);

  const handleStart = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLives(GAME_DEFAULTS.initialLives);
    setLevel(1);
    // Engine start is triggered by the game component when it detects gameState change
  }, []);

  const handleGameOver = useCallback((result: { score: number; level: number; timeOfDeath: number }) => {
    setGameState('gameover');
    saveResult(slug, {
      score: result.score,
      level: result.level,
      timeOfDeath: result.timeOfDeath,
      timestamp: Date.now(),
    });
    // After a brief delay, show start screen again
    setTimeout(() => setGameState('idle'), 1500);
  }, [slug]);

  const handleMenuOpen = useCallback(() => {
    setMenuOpen(true);
    engineRef.current?.pause();
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false);
    if (gameState === 'playing') {
      engineRef.current?.resume();
    }
  }, [gameState]);

  if (!gameEntry) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[var(--text-muted)]">Game not found</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Game canvas */}
      {GameComponent && (
        <GameComponent
          theme={theme}
          onGameOver={handleGameOver}
          onScoreChange={setScore}
          onLivesChange={setLives}
          onLevelChange={setLevel}
          onCountdown={setTimeRemaining}
          engineRef={engineRef}
        />
      )}

      {/* HUD overlay */}
      <GameHUD
        score={score}
        lives={lives}
        level={level}
        timeRemaining={timeRemaining}
        onMenuOpen={handleMenuOpen}
        visible={gameState === 'playing'}
      />

      {/* Start screen overlay */}
      <StartScreen
        gameName={gameEntry.name}
        gameSlug={slug}
        onStart={handleStart}
        visible={gameState === 'idle'}
      />

      {/* Menu drawer */}
      <MenuDrawer
        isOpen={menuOpen}
        onClose={handleMenuClose}
        currentSlug={slug}
      />
    </div>
  );
}
```

- [ ] **Step 5: Update Target Precision wrapper to respond to game state**

Update `src/games/target-precision/index.tsx` — replace the entire file:

```tsx
'use client';

import { useRef, useEffect } from 'react';
import { TargetPrecisionEngine } from './engine';
import type { GameComponentProps } from '../registry';
import type {
  ScoreChangedEvent,
  LifeLostEvent,
  LevelUpEvent,
  GameOverEvent,
  CountdownEvent,
  GameEventPayload,
} from '@/engine/types';

export default function TargetPrecisionGame({
  theme,
  onGameOver,
  onScoreChange,
  onLivesChange,
  onLevelChange,
  onCountdown,
  engineRef,
}: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineInstanceRef = useRef<TargetPrecisionEngine | null>(null);
  const startRequestedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new TargetPrecisionEngine();
    engineInstanceRef.current = engine;

    engine.on('scoreChanged', (p: GameEventPayload) => {
      const payload = p as ScoreChangedEvent;
      onScoreChange(payload.score);
    });
    engine.on('lifeLost', (p: GameEventPayload) => {
      const payload = p as LifeLostEvent;
      onLivesChange(payload.livesRemaining);
    });
    engine.on('levelUp', (p: GameEventPayload) => {
      const payload = p as LevelUpEvent;
      onLevelChange(payload.level);
    });
    engine.on('gameOver', (p: GameEventPayload) => {
      const payload = p as GameOverEvent;
      onGameOver({
        score: payload.finalScore,
        level: payload.finalLevel,
        timeOfDeath: payload.timeOfDeath,
      });
    });
    engine.on('countdown', (p: GameEventPayload) => {
      const payload = p as CountdownEvent;
      onCountdown(payload.timeRemaining);
    });

    engineRef.current = {
      pause: () => engine.pause(),
      resume: () => engine.resume(),
      start: () => engine.start(),
    } as { pause: () => void; resume: () => void };

    engine.init(canvas, { theme });

    // If start was requested before engine was ready
    if (startRequestedRef.current) {
      engine.start();
      startRequestedRef.current = false;
    }

    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (engineInstanceRef.current) {
          engineInstanceRef.current.destroy();
          engineInstanceRef.current.init(canvas, { theme });
        }
      }, 200);
    };
    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
      engine.destroy();
      engineInstanceRef.current = null;
      engineRef.current = null;
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
```

- [ ] **Step 6: Update GamePage handleStart to call engine.start()**

In `src/app/game/[slug]/page.tsx`, update `handleStart` to start the engine:

```ts
  const handleStart = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLives(GAME_DEFAULTS.initialLives);
    setLevel(1);
    engineRef.current?.start();
  }, []);
```

And update the engineRef declaration to match the `GameComponentProps` type:

```ts
  const engineRef = useRef<{ pause: () => void; resume: () => void; start: () => void } | null>(null);
```

- [ ] **Step 7: Verify the app builds**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npm run build
```

Expected: Build succeeds.

- [ ] **Step 8: Start dev server and test in browser**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npm run dev
```

Open `http://localhost:3000` in a browser. Verify:
1. Redirects to `/game/target-precision`
2. Start screen shows with game name and "—" stats
3. Click to start — game begins, targets appear on canvas
4. HUD shows score, timer, level, lives
5. Hamburger opens menu drawer, game pauses
6. Close menu, game resumes
7. Theme toggle switches dark/light
8. Losing all lives → game over → returns to start screen

- [ ] **Step 9: Commit**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
git add src/app/ src/games/registry.ts src/games/target-precision/index.tsx
git commit -m "feat: wire up app routes, game page, and full game lifecycle"
```

---

## Task 13: Polish & Final Integration

**Files:**
- Modify: various files for polish

- [ ] **Step 1: Add loading skeleton for game components**

Create `src/components/screens/GameSkeleton.tsx`:

```tsx
export function GameSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]">
      <div className="text-[var(--text-muted)] animate-pulse">Loading game...</div>
    </div>
  );
}
```

- [ ] **Step 2: Run all tests**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npx vitest run
```

Expected: All tests PASS.

- [ ] **Step 3: Run lint**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npm run lint
```

Expected: No errors (warnings are acceptable).

- [ ] **Step 4: Run build**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Manual browser test — full gameplay loop**

Start dev server and verify the complete flow:
1. First visit → redirects to target-precision
2. Start screen shows "—" for all stats
3. Click to start → targets spawn, HUD visible
4. Hit targets by clicking bullseye → score increases
5. Miss targets (let them expire) → life lost, red vignette
6. Game over → brief pause → start screen with updated stats
7. Play again → stats now show previous best
8. Open menu → game pauses → switch theme → close menu → game resumes
9. Refresh page → loads directly into target-precision (remembered)

- [ ] **Step 6: Commit**

```bash
cd /Users/hyunjuncho/Documents/work/mind-dojo
git add -A
git commit -m "feat: polish and finalize Mind Dojo v1 with Target Precision"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Scaffold Next.js project | package.json, vitest.config.ts |
| 2 | Engine types & math | engine/types.ts, engine/math.ts |
| 3 | Game loop | engine/loop.ts |
| 4 | Input handler | engine/input.ts |
| 5 | Storage layer | storage/preferences.ts, storage/gameStore.ts |
| 6 | Theme system | theme/colors.ts, theme/ThemeProvider.tsx |
| 7 | Target Precision config & entities | games/target-precision/config.ts, entities.ts |
| 8 | Target Precision renderer | games/target-precision/renderer.ts |
| 9 | Target Precision engine | games/target-precision/engine.ts |
| 10 | Game registry & React wrapper | games/registry.ts, games/target-precision/index.tsx |
| 11 | App shell components | components/shell/*, components/screens/* |
| 12 | App routes & layout | app/layout.tsx, app/page.tsx, app/game/[slug]/page.tsx |
| 13 | Polish & final integration | Various |
