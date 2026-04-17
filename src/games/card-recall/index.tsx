'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createDecks, shuffle, cardEquals, cardToString } from './CardDeck';
import Carousel from './Carousel';
import SuitValuePicker from './SuitValuePicker';
import type { Card, Suit, Value } from './config';
import type { GameComponentProps } from '../registry';

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

  // Keep a ref to deckCount so engineRef callbacks have access without stale closures
  const deckCountRef = useRef(1);
  const scoreRef = useRef(0);
  const currentIndexRef = useRef(0);
  const sequenceRef = useRef<Card[]>([]);
  const cardStatusesRef = useRef<CardStatus[]>([]);

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

    setSequence(deck);
    setCardStatuses(statuses);
    setCurrentIndex(0);
    setScore(0);
    setWrongGuessInfo(null);
    setPerfectRun(false);
    setGamePhase('viewing');
    setPaused(false);

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
    setGamePhase('recalling');
  }, []);

  const handleGuess = useCallback((suit: Suit, value: Value) => {
    if (pickerDisabled) return;

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

      const nextIndex = idx + 1;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);

      if (nextIndex >= seq.length) {
        // All cards guessed correctly — perfect run
        setPerfectRun(true);
        setGamePhase('gameover');
        onGameOver({ score: newScore, level: deckCountRef.current, timeOfDeath: 0 });
      }
    } else {
      // Wrong guess — mark wrong and show game over
      setPickerDisabled(true);

      const newStatuses = [...cardStatusesRef.current];
      newStatuses[idx] = 'wrong';
      cardStatusesRef.current = newStatuses;
      setCardStatuses(newStatuses);

      const guessStr = cardToString(guessCard);
      setWrongGuessInfo({ index: idx, guess: guessStr });
      setGamePhase('gameover');
      onGameOver({ score: scoreRef.current, level: deckCountRef.current, timeOfDeath: 0 });
    }
  }, [pickerDisabled, onScoreChange, onGameOver]);

  const handlePlayAgain = useCallback(() => {
    // Signal the game page to return to idle/start screen
    onGameOver({ score: scoreRef.current, level: deckCountRef.current, timeOfDeath: 0 });
  }, [onGameOver]);

  // Nothing to render before first start
  if (sequence.length === 0) return null;

  return (
    <div className="relative flex flex-col w-full h-full">
      {/* Pause overlay */}
      {paused && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <p className="text-white text-3xl font-bold tracking-wide">Paused</p>
        </div>
      )}

      {/* Viewing phase */}
      {gamePhase === 'viewing' && (
        <div className="flex flex-col items-center justify-center flex-1 w-full px-4 py-6">
          <p className="mb-6 text-sm font-medium uppercase tracking-widest" style={{ color: 'var(--label)' }}>
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
          {/* Progress info */}
          <div className="flex items-center justify-between px-5 py-3">
            <p className="text-sm font-medium" style={{ color: 'var(--label)' }}>
              Card <span className="font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>{currentIndex + 1}</span> of{' '}
              <span className="font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>{sequence.length}</span>
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--label)' }}>
              Score: <span className="font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>{score}</span>
            </p>
          </div>

          {/* Card indicator area — shows the hidden card face being guessed */}
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div
              className="rounded-xl shadow-md flex items-center justify-center"
              style={{
                width: '120px',
                aspectRatio: '2.5 / 3.5',
                background: 'linear-gradient(135deg, #4338ca, #7c3aed, #3730a3)',
              }}
            >
              <div
                className="rounded-lg border-2 border-white/30"
                style={{ width: '80%', height: '80%' }}
              />
            </div>
          </div>

          {/* Picker — pinned to bottom */}
          <div className="w-full">
            <SuitValuePicker onSelect={handleGuess} disabled={pickerDisabled} />
          </div>
        </div>
      )}

      {/* Game over / replay phase */}
      {gamePhase === 'gameover' && (
        <div className="flex flex-col items-center justify-center flex-1 w-full px-4 py-6">
          {!perfectRun && (
            <p className="mb-2 text-xl font-bold text-red-500">Wrong!</p>
          )}
          <p className="mb-6 text-sm font-medium" style={{ color: 'var(--label)' }}>
            Final score: <span className="font-bold" style={{ color: 'var(--foreground)' }}>{score}</span>
          </p>
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
    </div>
  );
}
