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

const isRedSuit = (suit: Suit) => suit === 'hearts' || suit === 'diamonds';

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

  const wrapperStyle: React.CSSProperties = disabled
    ? { opacity: 0.5, pointerEvents: 'none' }
    : {};

  // Shared dock button style builder
  function dockBtnStyle(active: boolean, red?: boolean): React.CSSProperties {
    return {
      height: 52,
      minWidth: 44,
      display: 'grid',
      placeItems: 'center',
      background: active
        ? 'color-mix(in oklch, var(--accent-recall) 22%, var(--bg-elev))'
        : 'var(--bg-elev)',
      color: active
        ? 'var(--accent-recall)'
        : red
        ? 'var(--accent-recall)'
        : 'var(--text)',
      border: `1.5px solid ${active ? 'var(--accent-recall)' : 'var(--stroke)'}`,
      borderRadius: 10,
      fontFamily: 'var(--font-pixel)',
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      transform: active ? 'scale(1.04)' : 'scale(1)',
      boxShadow: active
        ? '0 0 20px -6px color-mix(in oklch, var(--accent-recall) calc(100% * var(--glow-strength, 0.6)), transparent)'
        : 'none',
      opacity: active ? 1 : 0.65,
      WebkitTapHighlightColor: 'transparent',
    };
  }

  return (
    <div
      className="w-full"
      style={{
        padding: 10,
        border: '1.5px solid var(--stroke)',
        borderTopLeftRadius: 'var(--radius-lg)',
        borderTopRightRadius: 'var(--radius-lg)',
        background: 'var(--bg-elev)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxShadow: '0 -8px 30px -20px rgba(0,0,0,0.8)',
        ...wrapperStyle,
      }}
    >
      {/* Suit row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {SUITS.map((suit) => {
          const isSelected = selectedSuit === suit;
          const red = isRedSuit(suit);
          return (
            <button
              key={suit}
              onClick={() => handleSuitPress(suit)}
              aria-label={suit}
              aria-pressed={isSelected}
              style={dockBtnStyle(isSelected, red)}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{SUIT_SYMBOLS[suit]}</span>
            </button>
          );
        })}
      </div>

      {/* Value rows — always active, any order */}
      {VALUE_ROWS.map((row, rowIdx) => (
        <div
          key={rowIdx}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}
        >
          {row.map((value) => {
            const isSelected = selectedValue === value;
            return (
              <button
                key={value}
                onClick={() => handleValuePress(value)}
                aria-pressed={isSelected}
                style={dockBtnStyle(isSelected)}
              >
                {value}
              </button>
            );
          })}
          {/* Filler cell in row 2 to keep 7-column grid aligned */}
          {rowIdx === 1 && <div />}
        </div>
      ))}
    </div>
  );
}
