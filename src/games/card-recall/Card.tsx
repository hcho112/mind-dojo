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
        color: isRed ? 'var(--card-red)' : 'var(--card-black)',
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
            color: isRed ? 'var(--card-red)' : 'var(--card-black)',
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
  const suitColor = isRedSuit ? 'var(--card-red)' : 'var(--card-black)';
  const isHidden = status === 'hidden';

  const borderClass =
    status === 'correct'
      ? 'border-2 border-green-500'
      : status === 'wrong'
      ? 'border-2 border-red-500'
      : 'border border-gray-200 dark:border-[#6b6660]';

  // Mini mode — compact value + suit only
  if (mini) {
    return (
      <div
        className={`rounded-lg overflow-hidden select-none flex items-center justify-center ${borderClass} ${className}`}
        style={{ aspectRatio: '2.5 / 3.5', width: '100%', backgroundColor: 'var(--card-bg)' }}
      >
        <div className="flex flex-col items-center leading-none" style={{ color: suitColor }}>
          <span className="font-bold" style={{ fontSize: 14 }}>{value}</span>
          <SuitIcon suit={suit} size={14} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative rounded-xl shadow-md overflow-hidden select-none ${borderClass} ${className}`}
        style={{ aspectRatio: '2.5 / 3.5', width: '100%' }}
      >
        {isHidden ? (
          <div className="w-full h-full bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 flex items-center justify-center">
            <div
              className="rounded-lg border-2 border-white/30"
              style={{ width: '80%', height: '80%' }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col p-2" style={{ backgroundColor: 'var(--card-bg)' }}>
            {/* Top-left corner */}
            <div className="flex flex-col items-start leading-none" style={{ color: suitColor }}>
              <span className="font-bold text-lg leading-none">{value}</span>
              <SuitIcon suit={suit} size={16} />
            </div>

            {/* Center */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {isFaceCard(value) ? (
                <div className="flex flex-col items-center gap-1">
                  <span
                    className="font-black leading-none"
                    style={{ fontSize: 48, color: suitColor }}
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
              style={{ color: suitColor, transform: 'rotate(180deg)' }}
            >
              <span className="font-bold text-lg leading-none">{value}</span>
              <SuitIcon suit={suit} size={16} />
            </div>
          </div>
        )}
      </div>

      {status === 'wrong' && wrongGuess && (
        <p className="mt-1 text-xs text-red-500 font-medium">{wrongGuess}</p>
      )}
    </div>
  );
}
