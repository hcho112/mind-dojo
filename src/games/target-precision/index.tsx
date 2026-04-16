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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new TargetPrecisionEngine();
    engineInstanceRef.current = engine;

    engine.on('scoreChanged', (p: GameEventPayload) => {
      onScoreChange((p as ScoreChangedEvent).score);
    });
    engine.on('lifeLost', (p: GameEventPayload) => {
      onLivesChange((p as LifeLostEvent).livesRemaining);
    });
    engine.on('levelUp', (p: GameEventPayload) => {
      onLevelChange((p as LevelUpEvent).level);
    });
    engine.on('gameOver', (p: GameEventPayload) => {
      const payload = p as GameOverEvent;
      onGameOver({ score: payload.finalScore, level: payload.finalLevel, timeOfDeath: payload.timeOfDeath });
    });
    engine.on('countdown', (p: GameEventPayload) => {
      onCountdown((p as CountdownEvent).timeRemaining);
    });

    engineRef.current = {
      pause: () => engine.pause(),
      resume: () => engine.resume(),
      start: () => engine.start(),
    };

    engine.init(canvas, { theme });

    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (engineInstanceRef.current) {
          engineInstanceRef.current.destroy();
          engineInstanceRef.current.init(canvas, { theme });
        }
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
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
