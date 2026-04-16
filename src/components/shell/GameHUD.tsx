'use client';

interface GameHUDProps {
  score: number;
  lives: number;
  level: number;
  timeRemaining: number;
  onMenuOpen: () => void;
  visible: boolean;
}

export function GameHUD({ score, lives, level, timeRemaining, onMenuOpen, visible }: GameHUDProps) {
  if (!visible) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <div className="flex items-start justify-between p-4">
        <button
          onClick={onMenuOpen}
          className="pointer-events-auto p-2 rounded-lg
            bg-black/20 dark:bg-white/10 backdrop-blur-sm
            hover:bg-black/30 dark:hover:bg-white/20 transition-colors"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" className="text-white">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="px-4 py-2 rounded-lg bg-black/20 dark:bg-white/10 backdrop-blur-sm">
          <span className="text-2xl font-mono font-bold text-white">{timeStr}</span>
        </div>

        <div className="px-3 py-2 rounded-lg bg-black/20 dark:bg-white/10 backdrop-blur-sm">
          <span className="text-lg font-bold text-white">LV {level}</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center p-4 gap-4">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-xl transition-opacity ${i < lives ? 'opacity-100' : 'opacity-30'}`}
            >
              ❤️
            </span>
          ))}
        </div>

        <div className="px-4 py-2 rounded-lg bg-black/20 dark:bg-white/10 backdrop-blur-sm">
          <span className="text-2xl font-mono font-bold text-white">
            {score.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
