import { JobType, JOB_CONFIGS, BaseStats } from './job.model';

export class Character {
  id: string;
  name: string;
  job: JobType;
  currentHP: number;
  maxHP: number;
  strength: number;
  dexterity: number;
  intelligence: number;

  constructor(id: string, name: string, job: JobType) {
    const jobConfig = JOB_CONFIGS[job];
    const { health, strength, dexterity, intelligence } = jobConfig.baseStats;

    this.id = id;
    this.name = name;
    this.job = job;
    this.maxHP = health;
    this.currentHP = health;
    this.strength = strength;
    this.dexterity = dexterity;
    this.intelligence = intelligence;
  }

  get attackModifier(): number {
    const jobConfig = JOB_CONFIGS[this.job];
    const stats: BaseStats = {
      health: this.maxHP,
      strength: this.strength,
      dexterity: this.dexterity,
      intelligence: this.intelligence,
    };
    return jobConfig.attackModifier(stats);
  }

  get speedModifier(): number {
    const jobConfig = JOB_CONFIGS[this.job];
    const stats: BaseStats = {
      health: this.maxHP,
      strength: this.strength,
      dexterity: this.dexterity,
      intelligence: this.intelligence,
    };
    return jobConfig.speedModifier(stats);
  }

  get isAlive(): boolean {
    return this.currentHP > 0;
  }

  takeDamage(damage: number): void {
    this.currentHP = Math.max(0, this.currentHP - damage);
  }

  heal(amount: number): void {
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
  }
}
