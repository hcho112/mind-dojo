'use client';

import { Suit, Value, SUIT_COLORS, SUIT_SYMBOLS, isFaceCard } from './config';

interface PlayingCardProps {
  suit: Suit;
  value: Value;
  status?: 'default' | 'correct' | 'wrong' | 'hidden';
  wrongGuess?: string;
  className?: string;
}

function SuitIcon({ suit, size }: { suit: Suit; size: number }) {
  const symbol = SUIT_SYMBOLS[suit];
  return (
    <span
      style={{
        fontSize: size,
        lineHeight: 1,
        display: 'inline-block',
        color: SUIT_COLORS[suit],
      }}
    >
      {symbol}
    </span>
  );
}

export default function Card({
  suit,
  value,
  status = 'default',
  wrongGuess,
  className = '',
}: PlayingCardProps) {
  const suitColor = SUIT_COLORS[suit];
  const isHidden = status === 'hidden';

  const borderClass =
    status === 'correct'
      ? 'border-2 border-green-500'
      : status === 'wrong'
      ? 'border-2 border-red-500'
      : 'border border-gray-200 dark:border-gray-700';

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div
        className={`relative rounded-xl shadow-md overflow-hidden select-none ${borderClass} ${className}`}
        style={{ aspectRatio: '2.5 / 3.5', width: '100%' }}
      >
        {isHidden ? (
          /* Card back */
          <div className="w-full h-full bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 flex items-center justify-center">
            <div
              className="rounded-lg border-2 border-white/30"
              style={{ width: '80%', height: '80%' }}
            />
          </div>
        ) : (
          /* Card face */
          <div className="w-full h-full bg-white dark:bg-gray-50 flex flex-col p-1.5">
            {/* Top-left corner */}
            <div className="flex flex-col items-start leading-none" style={{ color: suitColor }}>
              <span className="font-bold text-sm leading-none">{value}</span>
              <SuitIcon suit={suit} size={12} />
            </div>

            {/* Center */}
            <div className="flex-1 flex flex-col items-center justify-center gap-1">
              {isFaceCard(value) ? (
                <>
                  <span
                    className="font-black leading-none"
                    style={{ fontSize: 36, color: suitColor }}
                  >
                    {value}
                  </span>
                  <SuitIcon suit={suit} size={24} />
                </>
              ) : (
                <SuitIcon suit={suit} size={48} />
              )}
            </div>

            {/* Bottom-right corner — rotated 180° */}
            <div
              className="flex flex-col items-end leading-none self-end"
              style={{ color: suitColor, transform: 'rotate(180deg)' }}
            >
              <span className="font-bold text-sm leading-none">{value}</span>
              <SuitIcon suit={suit} size={12} />
            </div>
          </div>
        )}
      </div>

      {/* Wrong-guess label shown below the card */}
      {status === 'wrong' && wrongGuess && (
        <p className="mt-1 text-xs text-red-500 font-medium">{wrongGuess}</p>
      )}
    </div>
  );
}
