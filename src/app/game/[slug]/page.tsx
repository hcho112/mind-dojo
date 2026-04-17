'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getGameEntry, DEFAULT_GAME } from '@/games/registry';
import { useTheme } from '@/theme/ThemeProvider';
import { setLastPlayedGame, getSoundEnabled, setSoundEnabled } from '@/storage/preferences';
import { openGameDB, saveResult } from '@/storage/gameStore';
import { MenuDrawer } from '@/components/shell/MenuDrawer';
import { GameHUD } from '@/components/shell/GameHUD';
import { StartScreen } from '@/components/screens/StartScreen';
import { GameSkeleton } from '@/components/screens/GameSkeleton';
import { GAME_DEFAULTS } from '@/games/target-precision/config';
import { audioManager } from '@/engine/audio';
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

type GameState = 'idle' | 'playing' | 'paused' | 'levelTransition' | 'gameover';

export default function GamePage() {
  const params = useParams();
  const slug = (params.slug as string) || DEFAULT_GAME;
  const { theme } = useTheme();

  const gameEntry = getGameEntry(slug);
  const GameComponent = useGameComponent(slug);

  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(GAME_DEFAULTS.initialLives);
  const [level, setLevel] = useState<number>(1);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [currentSlug, setCurrentSlug] = useState(slug);

  const engineRef = useRef<{ pause: () => void; resume: () => void; start: (startLevel?: number) => void } | null>(null);
  const gameOverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track state before menu opened so we can restore it
  const stateBeforeMenuRef = useRef<GameState>('idle');

  // Reset game state when the slug changes
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

  // Initialize audio on mount, read persisted preference
  useEffect(() => {
    const enabled = getSoundEnabled();
    setSoundEnabledState(enabled);
    audioManager.musicEnabled = enabled;
    audioManager.sfxEnabled = enabled;
    audioManager.preload('pop', '/sounds/pop.mp3');
    audioManager.setSfxVolume('pop', 0.9);
    audioManager.initBgMusic('/sounds/bg-music.mp3', 0.3);
    return () => {
      audioManager.stopBgMusic();
      if (gameOverTimerRef.current) clearTimeout(gameOverTimerRef.current);
    };
  }, []);

  const handleStart = useCallback((startLevel: number = 1) => {
    if (gameOverTimerRef.current) {
      clearTimeout(gameOverTimerRef.current);
      gameOverTimerRef.current = null;
    }
    setGameState('playing');
    setScore(0);
    setLives(GAME_DEFAULTS.initialLives);
    setLevel(startLevel);
    engineRef.current?.start(startLevel);
    const entry = getGameEntry(slug);
    if (!entry?.disableBgMusic) {
      audioManager.playBgMusic();
    }
  }, [slug]);

  const handleGameOver = useCallback((result: { score: number; level: number; timeOfDeath: number }) => {
    audioManager.stopBgMusic();
    saveResult(slug, {
      score: result.score,
      level: result.level,
      timeOfDeath: result.timeOfDeath,
      timestamp: Date.now(),
    });

    const entry = getGameEntry(slug);
    if (entry?.selfManagedGameOver) {
      // Game manages its own game-over screen — stay in 'playing' so the game component stays mounted
      // Game will call onGameOver again with timeOfDeath=-1 to signal "return to idle"
      if (result.timeOfDeath === -1) {
        setGameState('idle');
      }
    } else {
      setGameState('gameover');
      gameOverTimerRef.current = setTimeout(() => {
        setGameState('idle');
        gameOverTimerRef.current = null;
      }, 1500);
    }
  }, [slug]);

  const handleLevelUp = useCallback((newLevel: number) => {
    setLevel(newLevel);
    const entry = getGameEntry(slug);
    if (entry?.selfManagedGameOver) {
      // Turn-based games just report their level/deck count — no transition overlay
      return;
    }
    // Real-time games: engine paused itself in advanceLevel()
    setGameState('levelTransition');
  }, [slug]);

  const handleContinueLevel = useCallback(() => {
    setGameState('playing');
    engineRef.current?.resume();
  }, []);

  const handlePause = useCallback(() => {
    setGameState('paused');
    engineRef.current?.pause();
    audioManager.pauseBgMusic();
  }, []);

  const handleResume = useCallback(() => {
    setGameState('playing');
    engineRef.current?.resume();
    const entry = getGameEntry(slug);
    if (!entry?.disableBgMusic) {
      audioManager.playBgMusic();
    }
  }, [slug]);

  const handleToggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setSoundEnabled(next);
    audioManager.musicEnabled = next;
    audioManager.sfxEnabled = next;
    const entry = getGameEntry(slug);
    if (next && gameState === 'playing' && !entry?.disableBgMusic) {
      audioManager.playBgMusic();
    } else if (!next) {
      audioManager.pauseBgMusic();
    }
  }, [soundEnabled, gameState, slug]);

  const handleMenuOpen = useCallback(() => {
    stateBeforeMenuRef.current = gameState;
    setMenuOpen(true);
    // Only pause if actively playing
    if (gameState === 'playing') {
      engineRef.current?.pause();
    }
  }, [gameState]);

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false);
    // Resume only if we were playing before the menu opened
    if (stateBeforeMenuRef.current === 'playing') {
      engineRef.current?.resume();
    }
  }, []);

  const gameProps = useMemo<Omit<GameSectionProps, 'GameComponent'>>(() => ({
    theme,
    onGameOver: handleGameOver,
    onScoreChange: setScore,
    onLivesChange: setLives,
    onLevelChange: handleLevelUp,
    onCountdown: setTimeRemaining,
    engineRef,
  }), [theme, handleGameOver, handleLevelUp]);

  if (!gameEntry) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[var(--text-muted)]">Game not found</p>
      </div>
    );
  }

  const isGameActive = gameState === 'playing' || gameState === 'paused' || gameState === 'levelTransition';

  return (
    <div className="relative w-screen overflow-hidden" style={{ height: '100dvh' }}>
      {!GameComponent && <GameSkeleton />}

      {GameComponent && (
        <GameSection GameComponent={GameComponent} {...gameProps} />
      )}

      {/* HUD — visible during active game states */}
      <GameHUD
        score={score}
        lives={lives}
        maxLives={gameEntry?.selfManagedGameOver ? 0 : GAME_DEFAULTS.initialLives}
        level={level}
        levelPrefix={gameEntry?.hudLevelPrefix}
        timeRemaining={timeRemaining}
        showTimer={gameEntry?.hudShowTimer !== false}
        soundEnabled={soundEnabled}
        onMenuOpen={handleMenuOpen}
        onPause={handlePause}
        onToggleSound={handleToggleSound}
        visible={isGameActive}
      />

      {/* Pause overlay */}
      {gameState === 'paused' && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center
            bg-black/50 backdrop-blur-sm cursor-pointer"
          onClick={handleResume}
        >
          <div className="px-8 py-4 rounded-2xl bg-[var(--surface)]/90 backdrop-blur-md">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-2 text-center">Paused</h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] text-center animate-pulse">Tap to resume</p>
          </div>
        </div>
      )}

      {/* Level transition overlay */}
      {gameState === 'levelTransition' && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center
            bg-black/50 backdrop-blur-sm cursor-pointer"
          onClick={handleContinueLevel}
        >
          <div className="px-8 py-6 rounded-2xl bg-[var(--surface)]/90 backdrop-blur-md text-center">
            <p className="text-sm uppercase tracking-wider text-[var(--accent)] mb-1">Level Complete</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-4">Level {level}</h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] animate-pulse">Tap to continue</p>
          </div>
        </div>
      )}

      {/* Start screen */}
      <StartScreen
        gameName={gameEntry.name}
        gameSlug={slug}
        gameIcon={gameEntry.icon}
        levelLabel={gameEntry.levelLabel}
        alwaysShowLevelSelector={gameEntry.alwaysShowLevelSelector}
        onStart={handleStart}
        onMenuOpen={handleMenuOpen}
        visible={gameState === 'idle'}
      />

      {/* Menu drawer — accessible from any state */}
      <MenuDrawer
        isOpen={menuOpen}
        onClose={handleMenuClose}
        currentSlug={slug}
      />
    </div>
  );
}
