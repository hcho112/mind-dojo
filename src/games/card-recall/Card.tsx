'use client';

import { Suit, Value, SUIT_SYMBOLS, isFaceCard } from './config';

interface PlayingCardProps {
  suit: Suit;
  value: Value;
  status?: 'default' | 'correct' | 'wrong' | 'hidden';
  wrongGuess?: string;
  mini?: boolean;
  className?: string;
}

function SuitIcon({ suit, size }: { suit: Suit; size: number }) {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  return (
    <span
      style={{
        fontSize: size,
        lineHeight: 1,
        display: 'inline-block',
        color: isRed ? 'var(--accent-recall)' : 'var(--text)',
        fontFamily: 'var(--font-pixel)',
      }}
    >
      {SUIT_SYMBOLS[suit]}
    </span>
  );
}

// Pip layout positions for number cards (2-10)
// Each position is [x%, y%] relative to the center area
function getPipPositions(count: number): [number, number][] {
  switch (count) {
    case 2:
      return [[50, 25], [50, 75]];
    case 3:
      return [[50, 20], [50, 50], [50, 80]];
    case 4:
      return [[35, 30], [65, 30], [35, 70], [65, 70]];
    case 5:
      return [[35, 25], [65, 25], [50, 50], [35, 75], [65, 75]];
    case 6:
      return [[35, 20], [65, 20], [35, 50], [65, 50], [35, 80], [65, 80]];
    case 7:
      return [[35, 18], [65, 18], [50, 36], [35, 50], [65, 50], [35, 82], [65, 82]];
    case 8:
      return [[35, 16], [65, 16], [50, 33], [35, 50], [65, 50], [50, 67], [35, 84], [65, 84]];
    case 9:
      return [[35, 15], [65, 15], [35, 38], [65, 38], [50, 50], [35, 62], [65, 62], [35, 85], [65, 85]];
    case 10:
      return [[35, 12], [65, 12], [50, 27], [35, 38], [65, 38], [35, 62], [65, 62], [50, 73], [35, 88], [65, 88]];
    default:
      return [[50, 50]];
  }
}

function getNumericValue(value: Value): number {
  if (value === 'A') return 1;
  const n = parseInt(value, 10);
  return isNaN(n) ? 0 : n;
}

function PipLayout({ suit, value }: { suit: Suit; value: Value }) {
  const count = getNumericValue(value);
  if (count === 0) return null;

  const isRed = suit === 'hearts' || suit === 'diamonds';
  const positions = getPipPositions(count);
  const pipSize = count <= 3 ? 32 : count <= 5 ? 26 : count <= 7 ? 22 : 18;

  return (
    <div className="relative w-full h-full">
      {positions.map(([x, y], i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: pipSize,
            lineHeight: 1,
            color: isRed ? 'var(--accent-recall)' : 'var(--text)',
            fontFamily: 'var(--font-pixel)',
          }}
        >
          {SUIT_SYMBOLS[suit]}
        </span>
      ))}
    </div>
  );
}

export default function Card({
  suit,
  value,
  status = 'default',
  wrongGuess,
  mini = false,
  className = '',
}: PlayingCardProps) {
  const isRedSuit = suit === 'hearts' || suit === 'diamonds';
  const suitColor = isRedSuit ? 'var(--accent-recall)' : 'var(--text)';
  const isHidden = status === 'hidden';

  const borderStyle =
    status === 'correct'
      ? { border: '2px solid oklch(0.72 0.2 145)' }
      : status === 'wrong'
      ? { border: '2px solid oklch(0.65 0.22 25)' }
      : { border: '1.5px solid var(--stroke-strong)' };

  // Mini mode — compact value + suit only
  if (mini) {
    return (
      <div
        className={`rounded-lg overflow-hidden select-none flex items-center justify-center ${className}`}
        style={{
          aspectRatio: '2.5 / 3.5',
          width: '100%',
          background: 'var(--surface)',
          ...borderStyle,
        }}
      >
        <div
          className="flex flex-col items-center leading-none"
          style={{ color: suitColor, fontFamily: 'var(--font-pixel)' }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</span>
          <SuitIcon suit={suit} size={14} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative overflow-hidden select-none noise ${className}`}
        style={{
          aspectRatio: '2.5 / 3.5',
          width: '100%',
          borderRadius: 'var(--radius-lg)',
          ...borderStyle,
        }}
      >
        {isHidden ? (
          /* Card back — accent-recall gradient + scanlines overlay */
          <div
            className="scanlines w-full h-full flex items-center justify-center"
            style={{
              background: `repeating-linear-gradient(
                45deg,
                var(--accent-recall-deep) 0 6px,
                var(--accent-recall) 6px 12px
              )`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 8,
                border: '1.5px dashed color-mix(in oklch, var(--accent-recall) 80%, transparent)',
                borderRadius: 'calc(var(--radius-lg) - 6px)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 24,
                  color: 'var(--accent-recall)',
                  letterSpacing: '-0.04em',
                }}
              >
                MD
              </span>
            </div>
          </div>
        ) : (
          <div
            className="w-full h-full flex flex-col p-2"
            style={{ background: 'var(--surface)' }}
          >
            {/* Top-left corner */}
            <div
              className="flex flex-col items-start leading-none"
              style={{ color: suitColor, fontFamily: 'var(--font-pixel)' }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {value}
              </span>
              <SuitIcon suit={suit} size={16} />
            </div>

            {/* Center */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {isFaceCard(value) ? (
                <div className="flex flex-col items-center gap-1">
                  <span
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: 48,
                      fontWeight: 900,
                      lineHeight: 1,
                      color: suitColor,
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {value}
                  </span>
                  <SuitIcon suit={suit} size={30} />
                </div>
              ) : (
                <PipLayout suit={suit} value={value} />
              )}
            </div>

            {/* Bottom-right corner — rotated 180° */}
            <div
              className="flex flex-col items-end leading-none self-end"
              style={{ color: suitColor, transform: 'rotate(180deg)', fontFamily: 'var(--font-pixel)' }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {value}
              </span>
              <SuitIcon suit={suit} size={16} />
            </div>
          </div>
        )}
      </div>

      {status === 'wrong' && wrongGuess && (
        <p
          className="mt-1 text-xs font-medium"
          style={{ color: 'oklch(0.65 0.22 25)', fontFamily: 'var(--font-mono)' }}
        >
          {wrongGuess}
        </p>
      )}
    </div>
  );
}
