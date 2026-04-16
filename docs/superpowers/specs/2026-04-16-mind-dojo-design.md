# Mind Dojo — Design Spec

**Date:** 2026-04-16
**Status:** Draft

## Overview

Mind Dojo is a browser-based collection of brain-training mini games. Each game targets a specific cognitive skill (focus, speed, memory, logic, etc.). The app is built with Next.js (latest), React 19+, and Tailwind CSS. Game rendering uses the raw Canvas API for maximum performance. There is no backend — all scores and preferences are stored client-side in IndexedDB and localStorage.

Games are added incrementally. The first game is **Target Precision**, a focus/speed game.

## Tech Stack

- **Framework:** Next.js (latest, App Router) + React 19+
- **Styling:** Tailwind CSS
- **Game Rendering:** Raw Canvas API with `requestAnimationFrame`
- **Storage:** IndexedDB (game results), localStorage (preferences)
- **Code Splitting:** `next/dynamic` with `ssr: false` per game module
- **No external game libraries** — pure TypeScript engine layer

## Architecture: Engine-Shell Split

The app is divided into two layers:

### App Shell (React/Next.js)

Handles all non-game UI: navigation, menu drawer, start screen, HUD overlay, theme toggle. Built with React components and Tailwind CSS.

### Game Engine (Pure TypeScript)

Handles all game logic, canvas rendering, and input processing. Each game is a self-contained engine class. No React dependency — fully testable in isolation.

### Communication

React and the engine communicate through a narrow interface:

- **React → Engine:** lifecycle calls (`init`, `start`, `pause`, `resume`, `destroy`)
- **Engine → React:** event emissions (`scoreChanged`, `lifeLost`, `levelUp`, `gameOver`, `countdown`, `ready`)

Neither side reaches into the other's internals.

## Project Structure

```
mind-dojo/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (theme provider, menu)
│   │   ├── page.tsx                # Redirects to last-played game
│   │   └── game/
│   │       └── [slug]/
│   │           └── page.tsx        # Dynamic game route
│   │
│   ├── components/
│   │   ├── shell/
│   │   │   ├── MenuDrawer.tsx      # Slide-in game list + theme toggle
│   │   │   ├── ThemeToggle.tsx     # Dark/light switch
│   │   │   └── GameHUD.tsx         # Score, lives, level, timer overlay
│   │   └── screens/
│   │       └── StartScreen.tsx     # Pre-game screen with stats
│   │
│   ├── games/                      # Each game is a self-contained module
│   │   ├── registry.ts             # Game metadata (name, slug, dynamic import)
│   │   └── target-precision/
│   │       ├── index.tsx           # React wrapper (canvas mount + shell bridge)
│   │       ├── engine.ts           # Pure TS game engine class
│   │       ├── renderer.ts         # Canvas rendering logic
│   │       ├── entities.ts         # Target object, spawn logic
│   │       └── config.ts           # Level configs, tuning constants
│   │
│   ├── engine/                     # Shared engine interfaces & utilities
│   │   ├── types.ts                # MiniGame interface, GameEvent types
│   │   ├── loop.ts                 # requestAnimationFrame game loop
│   │   ├── input.ts                # Click/touch input handler
│   │   └── math.ts                 # Distance calculations, easing functions
│   │
│   ├── storage/
│   │   ├── gameStore.ts            # IndexedDB wrapper for scores/state
│   │   └── preferences.ts         # localStorage for theme, last game
│   │
│   └── theme/
│       ├── colors.ts               # Shell color palette (dark/light)
│       ├── ThemeProvider.tsx        # React context for theme
│       └── gameColors.ts           # In-game color tokens (shared across games)
```

## Engine-Shell Interface

### MiniGame Interface

```ts
interface MiniGame {
  init(canvas: HTMLCanvasElement, config: GameConfig): void;
  start(): void;
  pause(): void;
  resume(): void;
  destroy(): void;
  on(event: GameEventType, callback: GameEventCallback): void;
  off(event: GameEventType, callback: GameEventCallback): void;
}
```

### Event Types

```ts
type GameEventType =
  | 'scoreChanged'    // { score: number }
  | 'lifeLost'        // { livesRemaining: number }
  | 'levelUp'         // { level: number }
  | 'gameOver'        // { finalScore, finalLevel, timeOfDeath }
  | 'countdown'       // { timeRemaining: number }
  | 'ready';          // engine initialized, awaiting start()
```

### Game Config

```ts
interface GameConfig {
  theme: 'dark' | 'light';
}
```

### Game Result

```ts
interface GameResult {
  score: number;
  level: number;
  timeOfDeath: number;  // seconds remaining on level clock when player died
  timestamp: number;    // Date.now()
}
```

### Data Flow

1. React mounts game component, creates canvas, calls `engine.init(canvas, config)`
2. Engine emits `ready`. Start screen displays.
3. User clicks "Start" → React calls `engine.start()`
4. Engine runs its own `requestAnimationFrame` loop
5. Engine emits events → React updates HUD
6. On `gameOver` → React saves result to IndexedDB, shows start screen with updated stats

## Code Splitting

Each game is loaded via `next/dynamic` with `ssr: false`. The game registry maps slugs to dynamic imports:

```ts
// games/registry.ts
export const registry: Record<string, GameEntry> = {
  'target-precision': {
    name: 'Target Precision',
    slug: 'target-precision',
    description: 'Hit the bullseye before time runs out',
    loader: () => import('./target-precision'),
  },
};
```

```ts
// app/game/[slug]/page.tsx
const GameComponent = dynamic(
  () => registry[slug].loader,
  { ssr: false, loading: () => <GameSkeleton /> }
);
```

Only the selected game's bundle loads. Shared engine utilities are a small common chunk.

## Target Precision — Game Design

### Core Mechanic

Targets appear at random positions on the canvas. Each target consists of:

- **Outer circle:** starts at ~60px radius, shrinks toward the inner circle over the target's countdown
- **Inner circle:** fixed ~15px radius — the bullseye
- **Countdown number:** integer displayed at the center, decrements each second
- **Color gradient:** outer circle transitions green → orange → red as countdown progresses

### Hit Detection

- Strict bullseye: only clicks within ~8px of the target's exact center count as hits
- Clicks outside the bullseye radius are a miss — no penalty
- Hit zone radius is configurable in `config.ts`

### Scoring

```
points = accuracyMultiplier * speedMultiplier * basePoints
```

- `accuracyMultiplier`: inversely proportional to distance from center (max 1.0 at pixel-perfect)
- `speedMultiplier`: proportional to remaining countdown time (earlier hit = higher)
- `basePoints`: scales with current level

### Level Progression

| Level | Max Simultaneous Targets | Shrink Duration | Level Timer |
|-------|--------------------------|-----------------|-------------|
| 1     | 1                        | 5.0s            | 30s         |
| 2     | 2                        | 4.5s            | 30s         |
| 3     | 3                        | 4.0s            | 35s         |
| ...   | escalating               | decreasing      | adjusting   |

Exact values are tunable constants in `config.ts`.

### Spawn Logic

- Random position within canvas bounds, padded from edges to prevent clipping
- Minimum distance between simultaneous targets to prevent overlap
- New target spawns when an existing one is hit or expires (maintains the level's target count)

### Lives

- Player starts with 3 lives (configurable in `config.ts`)
- Lose 1 life when any target's countdown expires (outer circle fully shrinks)
- Visual feedback on life loss: brief red vignette or screen shake
- Game over when lives reach 0

### Game Loop

1. Level starts → level timer begins counting down → targets start spawning
2. Player clicks targets for points
3. Expired targets cost lives
4. Level timer reaches 0 with lives remaining → advance to next level
5. Lives reach 0 → game over → emit `gameOver` with final stats

## App Shell

### Navigation Flow

1. App opens → read `lastPlayedGame` from localStorage
2. If exists → redirect to `/game/[slug]`
3. If first visit → redirect to `/game/target-precision`

### Menu Drawer

- Activated by hamburger icon at top-left
- Slides in from the left
- Contents:
  - List of available games from `registry.ts` (name + icon/emoji)
  - Current game highlighted
  - Theme toggle (dark/light)
  - "Options" entry (placeholder, disabled for now)
- Opening the menu during gameplay calls `engine.pause()`
- Closing the menu calls `engine.resume()`

### Start Screen

Displayed before each game session:

- Game name (e.g. "Target Precision")
- Personal best stats from IndexedDB:
  - Best Score (e.g. `1,250`)
  - Best Level (e.g. `7`)
  - Last Time (e.g. `0:23` — time on clock when player died)
- All stats show `--` on first play
- "Click to Start" prompt
- Clicking/tapping triggers `engine.start()`

### In-Game HUD

React components positioned absolutely over the canvas:

- **Top left:** Menu button (hamburger)
- **Top center:** Level timer countdown (e.g. `0:27`)
- **Top right:** Level indicator (e.g. `LV 3`)
- **Bottom center:** Score (e.g. `1,050`)
- **Near score or top area:** Lives as icons (e.g. 3 hearts)

HUD listens to engine events and updates via React state.

## Storage

### localStorage (`preferences.ts`)

| Key              | Type     | Purpose                        |
|------------------|----------|--------------------------------|
| `lastPlayedGame` | string   | Slug of last played game       |
| `theme`          | string   | `'dark'` or `'light'`         |

### IndexedDB (`gameStore.ts`)

**Database:** `mind-dojo`
**Object Store:** `gameResults`

```ts
{
  id: auto-increment,
  gameSlug: string,
  score: number,
  level: number,
  timeOfDeath: number,
  timestamp: number,
}
```

Indexed by `gameSlug` for fast queries.

**Helper functions:**
- `saveResult(result)` — called on every game over
- `getBestStats(slug)` — returns best score, best level, and timeOfDeath from the most recent game session
- `getHistory(slug, limit?)` — returns recent results (for future stats features)

## Theming

### Shell Colors (`colors.ts`)

```ts
const palette = {
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
};
```

Shell UI uses Tailwind's `dark:` variant, driven by `ThemeProvider` context.

### Game Colors (`gameColors.ts`)

Shared across all games for visual consistency:

- Target gradient: `#22c55e` (green) → `#f59e0b` (orange) → `#ef4444` (red)
- Bullseye: white/light in dark mode, dark in light mode
- Hit feedback: accent color flash
- Life lost: red vignette

Game colors remain consistent across themes — only the canvas background adapts to dark/light. This preserves each game's visual identity regardless of theme.

## Performance

### Rendering

- Single `requestAnimationFrame` loop per game
- Delta-time based animation: all movement calculated from time elapsed between frames, not frame count — consistent across 60Hz/120Hz/144Hz
- Canvas sized to `devicePixelRatio` for crisp retina rendering
- Full canvas redraw per frame (appropriate for active game with moving targets)

### Input

- Single click/touch listener on the canvas element
- On input: calculate distances to all active targets in one pass
- Find nearest target, check if within bullseye radius

### Memory

- Object pooling for targets: reuse objects instead of creating/GC-ing per spawn
- Pre-calculate color gradient stops on engine init, not per frame
- Zero allocations in the render loop (no object creation, no array spreading)

### Responsive Canvas

- Canvas fills the viewport
- Target sizes and positions use relative units internally, converted to pixels at render
- Debounced resize handler to avoid layout thrashing
