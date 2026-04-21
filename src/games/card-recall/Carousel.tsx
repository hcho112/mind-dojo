'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Card } from './config';
import PlayingCard from './Card';
import { Button } from '@/components/ui/Button';

interface CarouselProps {
  cards: Card[];
  currentIndex?: number;
  cardStatuses?: ('default' | 'correct' | 'wrong')[];
  wrongGuess?: { index: number; guess: string };
  onReady?: () => void;
  showReady?: boolean;
  showPlayAgain?: boolean;
  onPlayAgain?: () => void;
  perfectRun?: boolean;
}

// 3D coverflow card gap (horizontal distance between adjacent card centers)
const CARD_GAP = 130;

export default function Carousel({
  cards,
  currentIndex,
  cardStatuses,
  wrongGuess,
  onReady,
  showReady = false,
  showPlayAgain = false,
  onPlayAgain,
  perfectRun = false,
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);

  // Pointer drag state
  const dragRef = useRef({ startX: 0, startIndex: 0, active: false, moved: false, lastSteps: 0 });
  const [dragging, setDragging] = useState(false);

  // Auto-navigate to wrong card on mount (game-over replay)
  useEffect(() => {
    if (wrongGuess !== undefined) {
      setVisibleIndex(wrongGuess.index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Controlled navigation when currentIndex prop changes
  useEffect(() => {
    if (currentIndex === undefined) return;
    setVisibleIndex(currentIndex);
  }, [currentIndex]);

  // Pointer drag handlers — same step-based approach as reference
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = {
      startX: e.clientX,
      startIndex: visibleIndex,
      active: true,
      moved: false,
      lastSteps: 0,
    };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [visibleIndex]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const delta = e.clientX - dragRef.current.startX;
    if (Math.abs(delta) > 4) dragRef.current.moved = true;
    const steps = Math.round(-delta / CARD_GAP);
    if (steps !== dragRef.current.lastSteps) {
      dragRef.current.lastSteps = steps;
      const target = Math.max(0, Math.min(cards.length - 1, dragRef.current.startIndex + steps));
      setVisibleIndex(target);
    }
  }, [cards.length]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const moved = dragRef.current.moved;
    dragRef.current.active = false;
    setDragging(false);

    if (!moved) {
      // Tap: left half = prev, right half = next
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width / 2) {
        setVisibleIndex(i => Math.max(0, i - 1));
      } else {
        setVisibleIndex(i => Math.min(cards.length - 1, i + 1));
      }
    }
  }, [cards.length]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Perfect run banner */}
      {perfectRun && (
        <p
          className="mb-3 text-2xl font-bold tracking-wide animate-pulse"
          style={{ color: 'var(--accent-recall)', fontFamily: 'var(--font-pixel)' }}
        >
          Perfect!
        </p>
      )}

      {/* 3D coverflow track */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full select-none overflow-hidden"
        style={{
          height: 'min(300px, 60vw)',
          touchAction: 'pan-y',
          cursor: dragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Center anchor for absolute positioning */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 }}>
          {cards.map((card, i) => {
            const offset = i - visibleIndex;
            if (Math.abs(offset) > 3) return null; // only render nearby cards
            const status = cardStatuses?.[i] ?? 'default';
            const isWrongCard = wrongGuess?.index === i;
            const x = offset * CARD_GAP;
            const absO = Math.abs(offset);
            const scale = Math.max(0.5, 1 - absO * 0.18);
            const rot = offset * -7;
            const opacity = Math.max(0.18, 1 - absO * 0.32);
            const isCenter = offset === 0;
            const cardW = 160;
            const cardH = 224; // 2.5/3.5 ratio

            return (
              <div
                key={`${i}-${card.suit}-${card.value}`}
                style={{
                  position: 'absolute',
                  left: x,
                  top: 0,
                  width: cardW,
                  height: cardH,
                  marginLeft: -cardW / 2,
                  marginTop: -cardH / 2,
                  transform: `scale(${scale}) rotate(${rot}deg)`,
                  transformOrigin: 'center',
                  transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), left 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                  opacity,
                  zIndex: 100 - Math.abs(offset),
                  pointerEvents: 'none',
                  willChange: 'transform, opacity, left',
                  filter: isCenter
                    ? 'drop-shadow(0 0 28px color-mix(in oklch, var(--accent-recall) 50%, transparent))'
                    : 'none',
                }}
              >
                <PlayingCard
                  suit={card.suit}
                  value={card.value}
                  status={status}
                  wrongGuess={isWrongCard ? wrongGuess?.guess : undefined}
                />
              </div>
            );
          })}
        </div>

        {/* Edge fade gradients */}
        <div
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 80,
            background: 'linear-gradient(90deg, var(--bg) 0%, transparent 100%)',
            pointerEvents: 'none', zIndex: 200,
          }}
        />
        <div
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
            background: 'linear-gradient(-90deg, var(--bg) 0%, transparent 100%)',
            pointerEvents: 'none', zIndex: 200,
          }}
        />

        {/* Sequence dots */}
        <div
          style={{
            position: 'absolute', bottom: 10, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 4, padding: '0 32px',
            flexWrap: 'wrap', pointerEvents: 'none', zIndex: 200,
          }}
        >
          {cards.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === visibleIndex ? 24 : 6,
                height: 6,
                borderRadius: 3,
                background: i <= visibleIndex
                  ? 'var(--accent-recall)'
                  : 'var(--bg-elev-2)',
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Card counter */}
      <p
        className="mt-4 text-sm tabular-nums"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
      >
        {visibleIndex + 1} / {cards.length}
      </p>

      {/* Ready button — view phase */}
      {showReady && onReady && (
        <Button
          variant="recall"
          size="lg"
          icon="check"
          onClick={onReady}
          className="mt-5"
        >
          Ready to recall
        </Button>
      )}

      {/* Play Again button — game over */}
      {showPlayAgain && onPlayAgain && (
        <Button
          variant="recall"
          size="lg"
          icon="bolt"
          onClick={onPlayAgain}
          className="mt-5"
        >
          Play Again
        </Button>
      )}
    </div>
  );
}
