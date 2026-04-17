'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createDecks, shuffle, cardEquals, cardToString } from './CardDeck';
import Carousel from './Carousel';
import SuitValuePicker from './SuitValuePicker';
import { SUIT_SYMBOLS } from './config';
import type { Card, Suit, Value } from './config';
import type { GameComponentProps } from '../registry';
import { audioManager } from '@/engine/audio';

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
  const [feedbackFlash, setFeedbackFlash] = useState<'correct' | 'wrong' | null>(null);

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

      // Green flash feedback
      setFeedbackFlash('correct');
      setTimeout(() => setFeedbackFlash(null), 300);

      const nextIndex = idx + 1;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);

      if (nextIndex >= seq.length) {
        // Perfect run
        setPerfectRun(true);
        setGamePhase('gameover');
        onGameOver({ score: newScore, level: deckCountRef.current, timeOfDeath: 0 });
      }

      // Allow next guess after brief delay
      setTimeout(() => { guessInProgressRef.current = false; }, 150);
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
        onGameOver({ score: scoreRef.current, level: deckCountRef.current, timeOfDeath: 0 });
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
              Card <span className="font-bold tabular-nums">{currentIndex + 1}</span> of{' '}
              <span className="font-bold tabular-nums">{sequence.length}</span>
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--label)' }}>
              Score: <span className="font-bold tabular-nums">{score}</span>
            </p>
          </div>

          {/* Card placeholder with feedback animation */}
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div
              className={`rounded-xl shadow-md flex items-center justify-center transition-all duration-150
                ${feedbackFlash === 'correct' ? 'ring-4 ring-green-500 scale-105' : ''}
                ${feedbackFlash === 'wrong' ? 'ring-4 ring-red-500 animate-[shake_0.3s_ease-in-out]' : ''}`}
              style={{
                width: '120px',
                aspectRatio: '2.5 / 3.5',
                background: 'linear-gradient(135deg, #4338ca, #7c3aed, #3730a3)',
              }}
            >
              <div
                className="rounded-lg border-2 border-white/30 animate-pulse"
                style={{ width: '80%', height: '80%' }}
              />
            </div>
          </div>

          {/* Picker */}
          <div className="w-full" style={{ paddingBottom: 'var(--safe-bottom)' }}>
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
            Cards recalled: <span className="font-bold">{score}</span> / {sequence.length}
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
