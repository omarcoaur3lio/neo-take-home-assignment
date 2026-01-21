export enum JobType {
  WARRIOR = 'Warrior',
  THIEF = 'Thief',
  MAGE = 'Mage',
}

export interface BaseStats {
  health: number;
  strength: number;
  dexterity: number;
  intelligence: number;
}

export type ModifierCalculator = (stats: BaseStats) => number;

export interface JobConfig {
  baseStats: BaseStats;
  attackModifier: ModifierCalculator;
  speedModifier: ModifierCalculator;
}

export const JOB_CONFIGS: Record<JobType, JobConfig> = {
  [JobType.WARRIOR]: {
    baseStats: {
      health: 20,
      strength: 10,
      dexterity: 5,
      intelligence: 5,
    },
    attackModifier: (stats) => stats.strength * 0.8 + stats.dexterity * 0.2,
    speedModifier: (stats) => stats.dexterity * 0.6 + stats.intelligence * 0.2,
  },
  [JobType.THIEF]: {
    baseStats: {
      health: 15,
      strength: 4,
      dexterity: 10,
      intelligence: 4,
    },
    attackModifier: (stats) =>
      stats.strength * 0.25 + stats.dexterity * 1.0 + stats.intelligence * 0.25,
    speedModifier: (stats) => stats.dexterity * 0.8,
  },
  [JobType.MAGE]: {
    baseStats: {
      health: 12,
      strength: 5,
      dexterity: 6,
      intelligence: 10,
    },
    attackModifier: (stats) =>
      stats.strength * 0.2 + stats.dexterity * 0.2 + stats.intelligence * 1.2,
    speedModifier: (stats) => stats.dexterity * 0.4 + stats.strength * 0.1,
  },
};
