'use client';

import { useState, useEffect, useCallback } from 'react';
import { SUITS, VALUES, SUIT_SYMBOLS, type Suit, type Value } from './config';

interface SuitValuePickerProps {
  onSelect: (suit: Suit, value: Value) => void;
  disabled?: boolean;
  resetKey?: number; // increment to reset selections (e.g. after correct guess)
}

const VALUE_ROWS: Value[][] = [
  ['A', '2', '3', '4', '5', '6', '7'],
  ['8', '9', '10', 'J', 'Q', 'K'],
];

const SUIT_BG: Record<Suit, string> = {
  hearts: 'rgba(220,38,38,0.12)',
  diamonds: 'rgba(220,38,38,0.12)',
  spades: 'rgba(26,26,46,0.10)',
  clubs: 'rgba(26,26,46,0.10)',
};

export default function SuitValuePicker({ onSelect, disabled = false, resetKey = 0 }: SuitValuePickerProps) {
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null);
  const [selectedValue, setSelectedValue] = useState<Value | null>(null);

  // Reset both selections when resetKey changes (correct guess from parent)
  useEffect(() => {
    setSelectedSuit(null);
    setSelectedValue(null);
  }, [resetKey]);

  // Auto-submit when both suit and value are selected
  const trySubmit = useCallback((suit: Suit | null, value: Value | null) => {
    if (suit && value && !disabled) {
      onSelect(suit, value);
    }
  }, [onSelect, disabled]);

  function handleSuitPress(suit: Suit) {
    if (disabled) return;
    setSelectedSuit(suit);
    trySubmit(suit, selectedValue);
  }

  function handleValuePress(value: Value) {
    if (disabled) return;
    setSelectedValue(value);
    trySubmit(selectedSuit, value);
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
                  : '2px solid var(--border)',
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

      {/* Value grid — always active, any order */}
      <div className="flex flex-col gap-2">
        {VALUE_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-2">
            {row.map((value) => {
              const isSelected = selectedValue === value;
              return (
                <button
                  key={value}
                  onClick={() => handleValuePress(value)}
                  className="flex-1 flex items-center justify-center rounded-xl font-semibold text-base transition-all active:scale-95"
                  style={{
                    minHeight: '48px',
                    background: 'var(--surface)',
                    border: isSelected
                      ? '2px solid var(--accent)'
                      : '1px solid var(--border)',
                    color: 'var(--label)',
                    opacity: isSelected ? 1 : 0.75,
                  }}
                >
                  {value}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
