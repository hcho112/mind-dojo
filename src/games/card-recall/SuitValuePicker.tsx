'use client';

import { useState } from 'react';
import { SUITS, VALUES, SUIT_SYMBOLS, type Suit, type Value } from './config';

interface SuitValuePickerProps {
  onSelect: (suit: Suit, value: Value) => void;
  disabled?: boolean;
}

const VALUE_ROWS: Value[][] = [
  ['A', '2', '3', '4', '5', '6', '7'],
  ['8', '9', '10', 'J', 'Q', 'K'],
];

// Background tints for suit buttons
const SUIT_BG: Record<Suit, string> = {
  hearts: 'rgba(220,38,38,0.12)',
  diamonds: 'rgba(220,38,38,0.12)',
  spades: 'rgba(26,26,46,0.10)',
  clubs: 'rgba(26,26,46,0.10)',
};

export default function SuitValuePicker({ onSelect, disabled = false }: SuitValuePickerProps) {
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null);

  function handleSuitPress(suit: Suit) {
    if (disabled) return;
    setSelectedSuit(suit);
  }

  function handleValuePress(value: Value) {
    if (disabled || !selectedSuit) return;
    onSelect(selectedSuit, value);
    // Keep selectedSuit highlighted for subsequent guesses
  }

  const wrapperClass = disabled ? 'opacity-50 pointer-events-none' : '';

  return (
    <div
      className={`w-full rounded-t-2xl shadow-2xl px-3 pt-3 pb-4 ${wrapperClass}`}
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* Suit row */}
      <div className="flex gap-2 mb-3">
        {SUITS.map((suit) => {
          const isSelected = selectedSuit === suit;
          return (
            <button
              key={suit}
              onClick={() => handleSuitPress(suit)}
              className="flex-1 flex flex-col items-center justify-center rounded-xl transition-all active:scale-95"
              style={{
                minHeight: '52px',
                background: SUIT_BG[suit],
                border: isSelected
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
                opacity: isSelected ? 1 : 0.55,
                color: (suit === 'hearts' || suit === 'diamonds') ? '#dc2626' : 'var(--label)',
              }}
              aria-label={suit}
              aria-pressed={isSelected}
            >
              <span className="text-2xl leading-none select-none">{SUIT_SYMBOLS[suit]}</span>
            </button>
          );
        })}
      </div>

      {/* Value grid */}
      <div
        className="flex flex-col gap-2"
        style={{ opacity: selectedSuit ? 1 : 0.4, transition: 'opacity 0.15s' }}
      >
        {VALUE_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-2">
            {row.map((value) => (
              <button
                key={value}
                onClick={() => handleValuePress(value)}
                disabled={!selectedSuit}
                className="flex-1 flex items-center justify-center rounded-xl font-semibold text-base transition-all active:scale-95"
                style={{
                  minHeight: '48px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--label)',
                  cursor: selectedSuit ? 'pointer' : 'default',
                }}
              >
                {value}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
