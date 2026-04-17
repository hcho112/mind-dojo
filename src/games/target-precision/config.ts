export const GAME_DEFAULTS = {
  initialLives: 3,
  minShrinkDuration: 1500,
  basePoints: 100,
} as const;

// Design ratios — all sizes relative to the shorter canvas dimension
const RATIOS = {
  bullseyeRadius: 0.022,
  innerRadius: 0.04,
  outerRadius: 0.15,
  edgePadding: 0.12,
  minTargetDistance: 0.2,
  countdownFontSize: 0.028,
} as const;

export interface ScaledDimensions {
  bullseyeRadius: number;
  innerRadius: number;
  outerRadius: number;
  edgePadding: number;
  minTargetDistance: number;
  countdownFontSize: number;
}

export function getScaledDimensions(canvasWidth: number, canvasHeight: number): ScaledDimensions {
  const base = Math.min(canvasWidth, canvasHeight);
  return {
    bullseyeRadius: Math.max(6, base * RATIOS.bullseyeRadius),
    innerRadius: Math.max(10, base * RATIOS.innerRadius),
    outerRadius: Math.max(30, base * RATIOS.outerRadius),
    edgePadding: Math.max(40, base * RATIOS.edgePadding),
    minTargetDistance: Math.max(60, base * RATIOS.minTargetDistance),
    countdownFontSize: Math.max(8, base * RATIOS.countdownFontSize),
  };
}

export interface LevelConfig {
  maxTargets: number;
  shrinkDuration: number;
  levelDuration: number;
}

const DEFINED_LEVELS: LevelConfig[] = [
  { maxTargets: 1, shrinkDuration: 5000, levelDuration: 30000 },
  { maxTargets: 2, shrinkDuration: 4500, levelDuration: 30000 },
  { maxTargets: 3, shrinkDuration: 4000, levelDuration: 35000 },
  { maxTargets: 4, shrinkDuration: 3500, levelDuration: 35000 },
  { maxTargets: 5, shrinkDuration: 3000, levelDuration: 40000 },
];

export function getLevelConfig(level: number): LevelConfig {
  if (level <= DEFINED_LEVELS.length) {
    return DEFINED_LEVELS[level - 1];
  }
  const lastDefined = DEFINED_LEVELS[DEFINED_LEVELS.length - 1];
  const extra = level - DEFINED_LEVELS.length;
  return {
    maxTargets: lastDefined.maxTargets + extra,
    shrinkDuration: Math.max(
      GAME_DEFAULTS.minShrinkDuration,
      lastDefined.shrinkDuration - extra * 200,
    ),
    levelDuration: lastDefined.levelDuration + extra * 5000,
  };
}
