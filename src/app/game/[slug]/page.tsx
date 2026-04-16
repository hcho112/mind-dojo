'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getGameEntry, DEFAULT_GAME } from '@/games/registry';
import { useTheme } from '@/theme/ThemeProvider';
import { setLastPlayedGame } from '@/storage/preferences';
import { openGameDB, saveResult } from '@/storage/gameStore';
import { MenuDrawer } from '@/components/shell/MenuDrawer';
import { GameHUD } from '@/components/shell/GameHUD';
import { StartScreen } from '@/components/screens/StartScreen';
import { GAME_DEFAULTS } from '@/games/target-precision/config';
import type { GameComponentProps } from '@/games/registry';
import type { ComponentType } from 'react';

// Cache loaded components to avoid reloading
const gameComponents: Record<string, ComponentType<GameComponentProps>> = {};

function useGameComponent(slug: string) {
  const [Component, setComponent] = useState<ComponentType<GameComponentProps> | null>(
    () => gameComponents[slug] || null,
  );

  useEffect(() => {
    if (gameComponents[slug]) {
      setComponent(() => gameComponents[slug]);
      return;
    }

    const entry = getGameEntry(slug);
    if (!entry) return;

    entry.loader().then((mod) => {
      gameComponents[slug] = mod.default;
      setComponent(() => mod.default);
    });
  }, [slug]);

  return Component;
}

export default function GamePage() {
  const params = useParams();
  const slug = (params.slug as string) || DEFAULT_GAME;
  const { theme } = useTheme();

  const gameEntry = getGameEntry(slug);
  const GameComponent = useGameComponent(slug);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(GAME_DEFAULTS.initialLives);
  const [level, setLevel] = useState<number>(1);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const engineRef = useRef<{ pause: () => void; resume: () => void; start: () => void } | null>(null);

  useEffect(() => {
    setLastPlayedGame(slug);
    openGameDB();
  }, [slug]);

  useEffect(() => {
    setGameState('idle');
    setScore(0);
    setLives(GAME_DEFAULTS.initialLives);
    setLevel(1);
    setTimeRemaining(0);
  }, [slug]);

  const handleStart = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLives(GAME_DEFAULTS.initialLives);
    setLevel(1);
    engineRef.current?.start();
  }, []);

  const handleGameOver = useCallback((result: { score: number; level: number; timeOfDeath: number }) => {
    setGameState('gameover');
    saveResult(slug, {
      score: result.score,
      level: result.level,
      timeOfDeath: result.timeOfDeath,
      timestamp: Date.now(),
    });
    setTimeout(() => setGameState('idle'), 1500);
  }, [slug]);

  const handleMenuOpen = useCallback(() => {
    setMenuOpen(true);
    engineRef.current?.pause();
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false);
    if (gameState === 'playing') {
      engineRef.current?.resume();
    }
  }, [gameState]);

  if (!gameEntry) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[var(--text-muted)]">Game not found</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {GameComponent && (
        <GameComponent
          theme={theme}
          onGameOver={handleGameOver}
          onScoreChange={setScore}
          onLivesChange={setLives}
          onLevelChange={setLevel}
          onCountdown={setTimeRemaining}
          engineRef={engineRef}
        />
      )}

      <GameHUD
        score={score}
        lives={lives}
        level={level}
        timeRemaining={timeRemaining}
        onMenuOpen={handleMenuOpen}
        visible={gameState === 'playing'}
      />

      <StartScreen
        gameName={gameEntry.name}
        gameSlug={slug}
        onStart={handleStart}
        visible={gameState === 'idle'}
      />

      <MenuDrawer
        isOpen={menuOpen}
        onClose={handleMenuClose}
        currentSlug={slug}
      />
    </div>
  );
}
