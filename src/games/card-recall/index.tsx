'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createDecks, shuffle, cardEquals, cardToString } from './CardDeck';
import Carousel from './Carousel';
import PlayingCard from './Card';
import SuitValuePicker from './SuitValuePicker';
import { SUIT_SYMBOLS } from './config';
import type { Card, Suit, Value } from './config';
import type { GameComponentProps } from '../registry';
import { audioManager } from '@/engine/audio';
import { getBestStats, type BestStats } from '@/storage/gameStore';

function MiniCardStrip({ cards }: { cards: Card[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  // Auto-scroll to the latest card
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollLeft = container.scrollWidth;
    }
  }, [cards.length]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = scrollRef.current;
    if (!container) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    scrollStartX.current = container.scrollLeft;
    container.style.cursor = 'grabbing';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const container = scrollRef.current;
    if (!container) return;
    container.scrollLeft = scrollStartX.current - (e.clientX - dragStartX.current);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const container = scrollRef.current;
    if (container) container.style.cursor = 'grab';
  }, []);

  if (cards.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="flex gap-1.5 overflow-x-auto select-none px-2 py-2"
      style={{
        cursor: 'grab',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        maxWidth: '85vw',
        border: '1.5px solid var(--stroke)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-elev)',
      }}
    >
      {cards.map((card, i) => (
        <div key={`${i}-${card.suit}-${card.value}`} className="flex-shrink-0" style={{ width: '36px' }}>
          <PlayingCard suit={card.suit} value={card.value} status="correct" mini />
        </div>
      ))}
    </div>
  );
}

type GamePhase = 'viewing' | 'recalling' | 'gameover';
type CardStatus = 'default' | 'correct' | 'wrong';

interface WrongGuessInfo {
  index: number;
  guess: string;
}

export default function CardRecallGame({
  onGameOver,
  onScoreChange,
  onLevelChange,
  engineRef,
}: GameComponentProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('viewing');
  const [sequence, setSequence] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [cardStatuses, setCardStatuses] = useState<CardStatus[]>([]);
  const [wrongGuessInfo, setWrongGuessInfo] = useState<WrongGuessInfo | null>(null);
  const [perfectRun, setPerfectRun] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pickerDisabled, setPickerDisabled] = useState(false);
  const recallStartTimeRef = useRef(0);
  const [feedbackFlash, setFeedbackFlash] = useState<'correct' | 'wrong' | null>(null);
  const [pickerResetKey, setPickerResetKey] = useState(0);
  const [revealedCard, setRevealedCard] = useState<Card | null>(null);
  const [bestStatsData, setBestStatsData] = useState<BestStats | null>(null);

  const deckCountRef = useRef(1);
  const scoreRef = useRef(0);
  const currentIndexRef = useRef(0);
  const sequenceRef = useRef<Card[]>([]);
  const cardStatusesRef = useRef<CardStatus[]>([]);
  const guessInProgressRef = useRef(false); // guard against rapid double-tap

  // Sync refs with state
  useEffect(() => { sequenceRef.current = sequence; }, [sequence]);
  useEffect(() => { cardStatusesRef.current = cardStatuses; }, [cardStatuses]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  const startGame = useCallback((deckCount: number = 1) => {
    const count = Math.max(1, deckCount);
    deckCountRef.current = count;

    const deck = shuffle(createDecks(count));
    const statuses: CardStatus[] = Array(deck.length).fill('default');

    scoreRef.current = 0;
    currentIndexRef.current = 0;
    guessInProgressRef.current = false;

    setSequence(deck);
    setCardStatuses(statuses);
    setCurrentIndex(0);
    setScore(0);
    setWrongGuessInfo(null);
    setPerfectRun(false);
    setGamePhase('viewing');
    setPaused(false);
    setPickerDisabled(false);
    setFeedbackFlash(null);
    setPickerResetKey(0);
    setRevealedCard(null);

    onScoreChange(0);
    onLevelChange(count);
  }, [onScoreChange, onLevelChange]);

  // Wire up the engine ref
  useEffect(() => {
    engineRef.current = {
      start: (startLevel?: number) => startGame(startLevel),
      pause: () => setPaused(true),
      resume: () => setPaused(false),
    };
    return () => {
      engineRef.current = null;
    };
  }, [engineRef, startGame]);

  const handleReady = useCallback(() => {
    recallStartTimeRef.current = Date.now();
    setGamePhase('recalling');
  }, []);

  const handleGuess = useCallback((suit: Suit, value: Value) => {
    // Guard against rapid double-tap and disabled state
    if (pickerDisabled || guessInProgressRef.current) return;
    guessInProgressRef.current = true;

    const seq = sequenceRef.current;
    const idx = currentIndexRef.current;
    const expected = seq[idx];
    const guessCard: Card = { suit, value };
    const isCorrect = cardEquals(guessCard, expected);

    if (isCorrect) {
      // Mark correct
      const newStatuses = [...cardStatusesRef.current];
      newStatuses[idx] = 'correct';
      cardStatusesRef.current = newStatuses;
      setCardStatuses(newStatuses);

      const newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      setScore(newScore);
      onScoreChange(newScore);
      audioManager.playSfx('pop');

      // Show the revealed card with animation
      setRevealedCard(expected);
      setFeedbackFlash('correct');

      // Reset picker selections
      setPickerResetKey(prev => prev + 1);

      const nextIndex = idx + 1;
      currentIndexRef.current = nextIndex;

      // After reveal animation, advance to next card
      setTimeout(() => {
        setFeedbackFlash(null);
        setRevealedCard(null);
        setCurrentIndex(nextIndex);

        if (nextIndex >= seq.length) {
          setPerfectRun(true);
          setGamePhase('gameover');
          const elapsedSeconds = Math.round((Date.now() - recallStartTimeRef.current) / 1000);
          onGameOver({ score: newScore, level: deckCountRef.current, timeOfDeath: elapsedSeconds });
          getBestStats('card-recall').then(setBestStatsData).catch(() => {});
        }

        guessInProgressRef.current = false;
      }, 600);
    } else {
      // Wrong guess
      setPickerDisabled(true);

      const newStatuses = [...cardStatusesRef.current];
      newStatuses[idx] = 'wrong';
      cardStatusesRef.current = newStatuses;
      setCardStatuses(newStatuses);

      const guessStr = `You said: ${SUIT_SYMBOLS[suit]}${value}`;
      setWrongGuessInfo({ index: idx, guess: guessStr });

      // Red flash + shake feedback, then transition to gameover
      setFeedbackFlash('wrong');
      setTimeout(() => {
        setFeedbackFlash(null);
        setGamePhase('gameover');
        const elapsedSeconds = Math.round((Date.now() - recallStartTimeRef.current) / 1000);
        onGameOver({ score: scoreRef.current, level: deckCountRef.current, timeOfDeath: elapsedSeconds });
        getBestStats('card-recall').then(setBestStatsData).catch(() => {});
        guessInProgressRef.current = false;
      }, 500);
    }
  }, [pickerDisabled, onScoreChange, onGameOver]);

  const handlePlayAgain = useCallback(() => {
    // Signal the game page to return to idle — use timeOfDeath=-1 as sentinel
    onGameOver({ score: 0, level: deckCountRef.current, timeOfDeath: -1 });
  }, [onGameOver]);

  // Nothing to render before first start
  if (sequence.length === 0) return null;

  return (
    <div className="relative flex flex-col w-full h-full">
      {/* Pause overlay — tap to resume */}
      {paused && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
          style={{
            background: 'color-mix(in oklch, var(--bg) 80%, transparent)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
          onClick={() => setPaused(false)}
        >
          <div
            style={{
              padding: '24px 36px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-elev)',
              border: '1px solid var(--stroke)',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 32, color: 'var(--accent-recall)', letterSpacing: '0.08em', marginBottom: 8 }}>
              Paused
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Tap to resume
            </p>
          </div>
        </div>
      )}

      {/* Viewing phase — memorize */}
      {gamePhase === 'viewing' && (
        <div className="flex flex-col items-center justify-center flex-1 w-full px-4 py-6">
          <p
            className="mb-6 text-xs uppercase tracking-widest"
            style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}
          >
            Memorize the sequence
          </p>
          <Carousel
            cards={sequence}
            showReady={true}
            onReady={handleReady}
          />
        </div>
      )}

      {/* Recalling phase */}
      {gamePhase === 'recalling' && (
        <div className="flex flex-col w-full h-full">
          {/* Card area — centers the mini strip + flip card together */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4 min-h-0">
            {/* Mini strip of correctly guessed cards — above the flip card */}
            {score > 0 && (
              <MiniCardStrip cards={sequence.slice(0, currentIndex)} />
            )}

            {/* Flip card container */}
            <div
              style={{
                width: 'min(140px, 38vw)',
                perspective: '600px',
              }}
            >
              <div
                className={`transition-all duration-500 ${feedbackFlash === 'wrong' ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: revealedCard ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front — card back (face down) with accent-recall gradient + scanlines */}
                <div
                  className="scanlines"
                  style={{
                    width: '100%',
                    aspectRatio: '2.5 / 3.5',
                    borderRadius: 'var(--radius-lg)',
                    background: `repeating-linear-gradient(
                      45deg,
                      var(--accent-recall-deep) 0 6px,
                      var(--accent-recall) 6px 12px
                    )`,
                    border: '2px solid var(--accent-recall)',
                    boxShadow: '0 0 40px -10px color-mix(in oklch, var(--accent-recall) 50%, transparent)',
                    backfaceVisibility: 'hidden',
                    position: 'relative',
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
                        fontSize: 20,
                        color: 'var(--accent-recall)',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      MD
                    </span>
                  </div>
                </div>

                {/* Back — revealed card (face up) */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {revealedCard && (
                    <div
                      style={{
                        width: '100%',
                        outline: '3px solid oklch(0.72 0.2 145)',
                        outlineOffset: '2px',
                        borderRadius: 'var(--radius-lg)',
                      }}
                    >
                      <PlayingCard suit={revealedCard.suit} value={revealedCard.value} status="correct" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress pill — centered above picker */}
          <div className="flex justify-center" style={{ paddingBottom: '10px' }}>
            <div
              style={{
                padding: '8px 16px',
                border: '1.5px solid var(--stroke)',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--bg-elev)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--text-muted)',
                display: 'flex',
                gap: 16,
                alignItems: 'baseline',
              }}
            >
              <span>
                Card{' '}
                <b style={{ color: 'var(--text)' }}>{currentIndex + 1}</b>
                {' '}of{' '}
                <b style={{ color: 'var(--text)' }}>{sequence.length}</b>
              </span>
              <span>
                Score:{' '}
                <b style={{ color: 'var(--accent-recall)' }}>{score}</b>
              </span>
            </div>
          </div>

          {/* Picker — safe-bottom aware */}
          <div
            className="w-full"
            style={{ paddingBottom: 'max(0px, var(--safe-bottom))' }}
          >
            <SuitValuePicker onSelect={handleGuess} disabled={pickerDisabled} resetKey={pickerResetKey} />
          </div>
        </div>
      )}

      {/* Game over / replay phase */}
      {gamePhase === 'gameover' && (
        <div className="flex flex-col items-center flex-1 w-full px-4 py-4 overflow-y-auto">
          {!perfectRun && (
            <p
              className="mb-1 text-lg font-bold"
              style={{ color: 'oklch(0.65 0.22 25)', fontFamily: 'var(--font-pixel)' }}
            >
              Wrong!
            </p>
          )}

          {/* Stats comparison */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 12, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="eyebrow" style={{ marginBottom: 2 }}>This Run</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 26, fontWeight: 700, color: 'var(--accent-recall)' }}>
                {score}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
                / {sequence.length} cards
              </div>
            </div>
            {bestStatsData && (
              <div style={{ textAlign: 'center' }}>
                <div className="eyebrow" style={{ marginBottom: 2, color: 'var(--accent-combo)' }}>Best</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 26, fontWeight: 700, color: 'var(--accent-combo)' }}>
                  {bestStatsData.bestScore}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
                  cards recalled
                </div>
              </div>
            )}
          </div>

          {score >= (bestStatsData?.bestScore ?? Infinity) && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-combo)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              New Record!
            </div>
          )}

          <Carousel
            cards={sequence}
            cardStatuses={cardStatuses}
            wrongGuess={wrongGuessInfo ?? undefined}
            showPlayAgain={true}
            onPlayAgain={handlePlayAgain}
            perfectRun={perfectRun}
          />
        </div>
      )}

      {/* Shake keyframe */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-6px); }
        }
      `}</style>
    </div>
  );
}
