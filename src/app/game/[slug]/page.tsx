'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getGameEntry, DEFAULT_GAME } from '@/games/registry';
import { useTheme } from '@/theme/ThemeProvider';
import { setLastPlayedGame } from '@/storage/preferences';
import { openGameDB, saveResult } from '@/storage/gameStore';
import { MenuDrawer } from '@/components/shell/MenuDrawer';
import { GameHUD } from '@/components/shell/GameHUD';
import { StartScreen } from '@/components/screens/StartScreen';
import { GameSkeleton } from '@/components/screens/GameSkeleton';
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
    const entry = getGameEntry(slug);
    if (!entry) return;

    if (gameComponents[slug]) {
      // Already cached — no setState needed, initial state handles it
      return;
    }

    let cancelled = false;
    entry.loader().then((mod) => {
      if (cancelled) return;
      gameComponents[slug] = mod.default;
      setComponent(() => mod.default);
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Re-initialise when slug changes and component is already cached
  const cached = gameComponents[slug] || null;
  const resolved = Component ?? cached;

  return resolved;
}

interface GameSectionProps extends GameComponentProps {
  GameComponent: ComponentType<GameComponentProps>;
}

function GameSection({ GameComponent, ...props }: GameSectionProps) {
  return <GameComponent {...props} />;
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
  const [currentSlug, setCurrentSlug] = useState(slug);

  const engineRef = useRef<{ pause: () => void; resume: () => void; start: () => void } | null>(null);
  const gameOverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset game state when the slug changes (detected via derived state)
  if (currentSlug !== slug) {
    setCurrentSlug(slug);
    setGameState('idle');
    setScore(0);
    setLives(GAME_DEFAULTS.initialLives);
    setLevel(1);
    setTimeRemaining(0);
  }

  useEffect(() => {
    setLastPlayedGame(slug);
    openGameDB();
  }, [slug]);

  // Clean up game-over timer on unmount
  useEffect(() => {
    return () => {
      if (gameOverTimerRef.current) clearTimeout(gameOverTimerRef.current);
    };
  }, []);

  const handleStart = useCallback(() => {
    if (gameOverTimerRef.current) {
      clearTimeout(gameOverTimerRef.current);
      gameOverTimerRef.current = null;
    }
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
    gameOverTimerRef.current = setTimeout(() => {
      setGameState('idle');
      gameOverTimerRef.current = null;
    }, 1500);
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

  const gameProps = useMemo<Omit<GameSectionProps, 'GameComponent'>>(() => ({
    theme,
    onGameOver: handleGameOver,
    onScoreChange: setScore,
    onLivesChange: setLives,
    onLevelChange: setLevel,
    onCountdown: setTimeRemaining,
    engineRef,
  }), [theme, handleGameOver]);

  if (!gameEntry) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[var(--text-muted)]">Game not found</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {!GameComponent && <GameSkeleton />}

      {GameComponent && (
        <GameSection GameComponent={GameComponent} {...gameProps} />
      )}

      <GameHUD
        score={score}
        lives={lives}
        maxLives={GAME_DEFAULTS.initialLives}
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
