'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Card } from './config';
import PlayingCard from './Card';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleIndex, setVisibleIndex] = useState(0);

  // Auto-scroll to wrong card on mount (game-over replay)
  useEffect(() => {
    if (wrongGuess !== undefined) {
      requestAnimationFrame(() => {
        const target = cardRefs.current[wrongGuess.index];
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          setVisibleIndex(wrongGuess.index);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Controlled scroll when currentIndex prop changes
  useEffect(() => {
    if (currentIndex === undefined) return;
    const target = cardRefs.current[currentIndex];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setVisibleIndex(currentIndex);
    }
  }, [currentIndex]);

  function handleScroll() {
    const container = scrollContainerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    let closest = 0;
    let closestDist = Infinity;
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const elRect = el.getBoundingClientRect();
      const elCenter = elRect.left + elRect.width / 2;
      const dist = Math.abs(containerCenter - elCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setVisibleIndex(closest);
  }

  // Mouse drag-to-scroll (desktop)
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    scrollStartX.current = container.scrollLeft;
    container.style.cursor = 'grabbing';
    container.style.scrollSnapType = 'none'; // disable snap while dragging
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const dx = e.clientX - dragStartX.current;
    container.scrollLeft = scrollStartX.current - dx;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const container = scrollContainerRef.current;
    if (!container) return;
    container.style.cursor = 'grab';
    container.style.scrollSnapType = 'x mandatory'; // re-enable snap
  }, []);

  // Clean up drag on mouse leave
  const handleMouseLeave = useCallback(() => {
    if (isDragging.current) {
      handleMouseUp();
    }
  }, [handleMouseUp]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Perfect run banner */}
      {perfectRun && (
        <p className="mb-3 text-2xl font-bold text-green-500 tracking-wide animate-pulse">
          Perfect!
        </p>
      )}

      {/* Horizontal scroll container with snap */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="w-full flex overflow-x-auto snap-x snap-mandatory select-none"
        style={{
          cursor: 'grab',
          paddingLeft: 'calc(50% - min(120px, 40vw))',
          paddingRight: 'calc(50% - min(120px, 40vw))',
          gap: '16px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        {cards.map((card, i) => {
          const status = cardStatuses?.[i] ?? 'default';
          const isWrongCard = wrongGuess?.index === i;
          return (
            <div
              key={`${i}-${card.suit}-${card.value}`}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="snap-center flex-shrink-0"
              style={{ width: 'min(240px, 80vw)' }}
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

      {/* Card counter */}
      <p
        className="mt-4 text-sm font-medium tabular-nums"
        style={{ color: 'var(--label)' }}
      >
        {visibleIndex + 1} / {cards.length}
      </p>

      {/* Ready button — view phase */}
      {showReady && onReady && (
        <button
          onClick={onReady}
          className="mt-5 w-56 py-4 rounded-2xl text-lg font-bold text-white shadow-lg active:scale-95 transition-transform"
          style={{ background: 'var(--accent)' }}
        >
          Ready
        </button>
      )}

      {/* Play Again button — game over */}
      {showPlayAgain && onPlayAgain && (
        <button
          onClick={onPlayAgain}
          className="mt-5 w-56 py-4 rounded-2xl text-lg font-bold text-white shadow-lg active:scale-95 transition-transform"
          style={{ background: 'var(--accent)' }}
        >
          Play Again
        </button>
      )}
    </div>
  );
}
