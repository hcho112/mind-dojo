export const GAME_DEFAULTS = {
  initialLives: 3,
  bullseyeRadius: 8,
  innerRadius: 15,
  outerRadius: 60,
  edgePadding: 80,
  minTargetDistance: 140,
  minShrinkDuration: 1500,
  basePoints: 100,
} as const;

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
