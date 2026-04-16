'use client';

import { useRef, useEffect } from 'react';
import { TargetPrecisionEngine } from './engine';
import type { GameComponentProps } from '../registry';
import type {
  ScoreChangedEvent, LifeLostEvent, LevelUpEvent, GameOverEvent, CountdownEvent, GameEventPayload,
} from '@/engine/types';

export default function TargetPrecisionGame({
  theme, onGameOver, onScoreChange, onLivesChange, onLevelChange, onCountdown, engineRef,
}: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineInstanceRef = useRef<TargetPrecisionEngine | null>(null);

  // Keep callback refs fresh to avoid stale closures in engine event listeners
  const onGameOverRef = useRef(onGameOver);
  const onScoreChangeRef = useRef(onScoreChange);
  const onLivesChangeRef = useRef(onLivesChange);
  const onLevelChangeRef = useRef(onLevelChange);
  const onCountdownRef = useRef(onCountdown);

  useEffect(() => { onGameOverRef.current = onGameOver; }, [onGameOver]);
  useEffect(() => { onScoreChangeRef.current = onScoreChange; }, [onScoreChange]);
  useEffect(() => { onLivesChangeRef.current = onLivesChange; }, [onLivesChange]);
  useEffect(() => { onLevelChangeRef.current = onLevelChange; }, [onLevelChange]);
  useEffect(() => { onCountdownRef.current = onCountdown; }, [onCountdown]);

  // Initialize engine once on mount, clean up on unmount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new TargetPrecisionEngine();
    engineInstanceRef.current = engine;

    engine.on('scoreChanged', (p: GameEventPayload) => {
      onScoreChangeRef.current((p as ScoreChangedEvent).score);
    });
    engine.on('lifeLost', (p: GameEventPayload) => {
      onLivesChangeRef.current((p as LifeLostEvent).livesRemaining);
    });
    engine.on('levelUp', (p: GameEventPayload) => {
      onLevelChangeRef.current((p as LevelUpEvent).level);
    });
    engine.on('gameOver', (p: GameEventPayload) => {
      const payload = p as GameOverEvent;
      onGameOverRef.current({ score: payload.finalScore, level: payload.finalLevel, timeOfDeath: payload.timeOfDeath });
    });
    engine.on('countdown', (p: GameEventPayload) => {
      onCountdownRef.current((p as CountdownEvent).timeRemaining);
    });

    engineRef.current = {
      pause: () => engine.pause(),
      resume: () => engine.resume(),
      start: () => engine.start(),
    };

    engine.init(canvas, { theme });

    // Debounced resize — just re-setup the canvas, don't destroy engine
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        engineInstanceRef.current?.resize();
      }, 200);
    };
    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
      engine.destroy();
      engineInstanceRef.current = null;
      engineRef.current = null;
    };
  }, []); // Mount once — no theme dependency

  // Handle theme changes without destroying the engine
  useEffect(() => {
    engineInstanceRef.current?.setTheme(theme);
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
