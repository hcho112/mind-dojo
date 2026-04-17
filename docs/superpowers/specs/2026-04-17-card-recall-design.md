# Card Recall — Design Spec

**Date:** 2026-04-17
**Status:** Draft
**Game:** Second game for Mind Dojo

## Overview

Card Recall is a short-term memory game where the player memorizes a shuffled card sequence and recalls it in order. The player views the full sequence at their own pace, then guesses cards one by one. The first wrong guess ends the run. Score = number of cards correctly recalled.

## Game Flow

1. **Setup** — player selects deck count (1, 2, 3...) via +/- selector on start screen
2. **View phase** — full shuffled sequence shown in a swipeable carousel. Player goes through at their own pace. "Ready" button visible at bottom.
3. **Recall phase** — carousel disappears. Player guesses cards in order using a two-step suit + value selector. Counter shows progress ("Card 3 of 52"). Each correct guess increments score.
4. **Game over** — first wrong guess ends the run. Carousel replay shows the full sequence: correctly guessed cards marked green, the wrong card marked red, remaining cards shown normally. Auto-scrolls to the wrong card.
5. **Perfect run** — if the player recalls every card, game over triggers as a perfect run with full score.

## Scoring & Storage

```ts
// Saved to IndexedDB via saveResult('card-recall', result)
{
  score: number;        // cards correctly recalled (e.g. 12)
  level: number;        // deck count used (e.g. 1)
  timeOfDeath: 0;       // not time-based, always 0
  timestamp: number;    // Date.now()
}
```

- **Best score** = highest cards recalled in a single run
- **Best level** = highest deck count attempted
- Stats page automatically includes Card Recall via the game registry

## Card Selection UI

Two-step tap with always-visible layout, fixed at the bottom of the screen. Mobile-first design.

```
┌─────────────────────────────────┐
│     Card 3 of 52      Score: 2  │  ← progress info (top)
│                                 │
│           [ ? ]                 │  ← current card slot
│                                 │
│─────────────────────────────────│
│                                 │
│   [♠]    [♥]    [♦]    [♣]     │  ← suit row (4 large buttons)
│                                 │
│  A  2  3  4  5  6  7           │  ← value grid (2 rows)
│  8  9  10  J  Q  K             │
│                                 │
└─────────────────────────────────┘
```

### Behavior

- **Suit row:** 4 large buttons, colored (♠ black, ♥ red, ♦ red, ♣ black). Tap to select — highlights with glow.
- **Value grid:** 13 buttons in 2 rows. Dimmed until a suit is selected. Tap a value to submit the guess (suit + value = answer).
- **No accidental submissions:** nothing happens until both suit AND value are tapped.
- **Suit persists:** selected suit stays highlighted between guesses. If the next card is the same suit, player only needs to tap the value (1 tap instead of 2).
- **Changing suit:** tap a different suit at any time before tapping a value. No penalty.
- **Correct guess:** brief green flash, card animates into "answered" state, advance to next card.
- **Wrong guess:** red shake animation, game over triggers.
- **Touch targets:** all buttons minimum 44px for mobile.

## Card Viewing Carousel

### View Phase Carousel

- Cards displayed one at a time, centered on screen
- Swipe left/right to navigate
- CSS `scroll-snap-type: x mandatory` for crisp snapping
- Neighboring cards peek from edges (~20px visible) to hint there's more
- Card counter at bottom: "3 / 52"
- Large "Ready" button below the counter
- Tapping "Ready" transitions to recall phase

### Game Over Replay Carousel

- Same carousel component reused
- Correctly guessed cards: green border/glow
- The wrong card: red border + shows "You said: ♥7" below the card
- Unguessed cards: normal styling
- Auto-scrolls to the wrong card on open (on perfect run, stays at first card with a "Perfect!" banner)
- Player can swipe through the rest to review
- "Play Again" button at bottom

## Architecture

### DOM-Based (Not Canvas)

Card Recall is turn-based UI — cards, buttons, carousel, animations. React + Tailwind handles this better than Canvas. No game loop or `requestAnimationFrame` needed.

Card Recall does NOT implement the `MiniGame` interface. The React component manages game state directly and communicates via the same `GameComponentProps` callbacks.

### File Structure

```
src/games/card-recall/
├── index.tsx            # Main game component (state machine, all phases)
├── CardDeck.ts          # Deck creation, shuffling logic
├── Card.tsx             # Single card visual component
├── Carousel.tsx         # Swipeable card carousel (view + replay)
├── SuitValuePicker.tsx  # Two-step suit + value selection UI
├── config.ts            # Constants
```

### State Machine

```
setup → viewing → recalling → gameover → setup
```

| State | UI | User Action |
|-------|-----|-------------|
| `setup` | Start screen: deck selector, best stats | Adjust decks, tap Start |
| `viewing` | Card carousel + "Ready" button | Swipe through cards, tap Ready |
| `recalling` | Progress counter + suit/value picker | Tap suit then value |
| `gameover` | Replay carousel (green/red) + score | Review, tap "Play Again" |

### engineRef Compatibility

The game page expects `engineRef` with `start`, `pause`, `resume`. Card Recall implements these as state transitions:

- `start(deckCount)` — shuffle deck(s), transition to `viewing`
- `pause()` — show pause overlay, block interaction
- `resume()` — remove pause overlay
- No `destroy()` needed — React cleanup handles unmount

### Integration with App Shell

- **GameComponentProps:** receives `theme`, `onGameOver`, `onScoreChange`, `onLevelChange`, `onCountdown`, `engineRef` — same as Target Precision
- **onScoreChange:** called on each correct guess with running total
- **onLevelChange:** called with deckCount at game start
- **onCountdown:** not used (no timer), but received and ignored
- **onGameOver:** called with `{ score, level: deckCount, timeOfDeath: 0 }`
- **Registry:** add entry with slug `card-recall`, dynamic import

### Game Page Compatibility

The game page (`/game/[slug]/page.tsx`) handles HUD, pause, menu, and start screen generically. Card Recall needs to manage its own internal phases (viewing, recalling, gameover) since the game page only knows `idle | playing | paused | levelTransition | gameover`.

- **Start screen → game page calls `engineRef.start()`** → Card Recall enters `viewing` phase internally
- **Game page sees `playing` state** throughout `viewing` and `recalling` phases
- **Card Recall emits `gameOver`** → game page handles the transition to `idle`
- **HUD:** score and level display will update via callbacks. Timer shows 0:00 (not relevant). Lives show hearts (not relevant). This is acceptable — the HUD items that don't apply simply show default values.

## Card Visuals

### Card Component (`Card.tsx`)

```
┌─────────────┐
│ A♠          │  ← top-left: value + mini suit
│             │
│     ♠       │  ← center: large suit (number cards)
│             │  OR face SVG (A/K/Q/J cards)
│          ♠A │  ← bottom-right: rotated value + mini suit
└─────────────┘
```

- **Number cards (2-10):** value text + centered suit symbol
- **Face cards (A, K, Q, J):** centered face SVG asset with suit color applied
- Card size: responsive, ~60% viewport width in carousel, max 200px
- Border radius: 12px
- White background with shadow (dark mode) or border (light mode)
- Red suits (`#dc2626`): hearts, diamonds
- Black suits (`#1a1a2e`): spades, clubs

### SVG Assets (`public/images/cards/`)

| File | Description |
|------|-------------|
| `spade.svg` | Spade suit symbol |
| `heart.svg` | Playing card heart |
| `diamond.svg` | Diamond suit symbol |
| `club.svg` | Club suit symbol |
| `face-a.svg` | Ace — decorative "A" with serif styling |
| `face-k.svg` | King — "K" with small crown above |
| `face-q.svg` | Queen — "Q" with small tiara above |
| `face-j.svg` | Jack — "J" with small shield above |

### Game Icon

`public/images/game-card-recall.svg` — card fan or deck icon for registry, menu, and start screen.

## Deck Logic (`CardDeck.ts`)

```ts
type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
type Value = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: Suit;
  value: Value;
}

function createDeck(): Card[] { ... }           // 52 cards
function createDecks(count: number): Card[] { ... }  // count * 52 cards
function shuffle(cards: Card[]): Card[] { ... }  // Fisher-Yates shuffle
```

## Performance

- No Canvas, no game loop — standard React rendering
- Carousel uses CSS scroll-snap (GPU-accelerated) — no JS-driven animation
- Card components are simple SVG/text — lightweight
- Deck shuffle is O(n) Fisher-Yates — instant even for multiple decks

## Theme Support

- Cards: white background in both themes, border in light mode, shadow in dark mode
- Selection buttons: follow `--label`, `--surface`, `--border`, `--accent` variables
- Carousel background: `--bg`
- Green/red feedback colors: same `gameColors` tokens as Target Precision
