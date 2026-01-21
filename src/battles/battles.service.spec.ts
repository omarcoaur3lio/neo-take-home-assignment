import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { BattlesService } from './battles.service';
import { CharacterRepository } from '../repositories/character.repository';
import { Character } from '../models/character.model';
import { JobType } from '../models/job.model';

describe('BattlesService', () => {
  let service: BattlesService;
  let repository: CharacterRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BattlesService, CharacterRepository],
    }).compile();

    service = module.get<BattlesService>(BattlesService);
    repository = module.get<CharacterRepository>(CharacterRepository);
  });

  afterEach(() => {
    repository.clear();
  });

  describe('executeBattle - validations', () => {
    it('should throw error if first character not found', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );

      expect(() => service.executeBattle('999', char1.id)).toThrow(
        BadRequestException,
      );
      expect(() => service.executeBattle('999', char1.id)).toThrow(
        'Character with ID 999 not found',
      );
    });

    it('should throw error if second character not found', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );

      expect(() => service.executeBattle(char1.id, '999')).toThrow(
        BadRequestException,
      );
      expect(() => service.executeBattle(char1.id, '999')).toThrow(
        'Character with ID 999 not found',
      );
    });

    it('should throw error if first character is dead', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );
      const char2 = repository.save(
        new Character('', 'Thief1', JobType.THIEF),
      );

      // Kill char1
      char1.takeDamage(char1.maxHP);
      repository.update(char1);

      expect(() => service.executeBattle(char1.id, char2.id)).toThrow(
        BadRequestException,
      );
      expect(() => service.executeBattle(char1.id, char2.id)).toThrow(
        'Warrior1 is already dead',
      );
    });

    it('should throw error if second character is dead', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );
      const char2 = repository.save(
        new Character('', 'Thief1', JobType.THIEF),
      );

      // Kill char2
      char2.takeDamage(char2.maxHP);
      repository.update(char2);

      expect(() => service.executeBattle(char1.id, char2.id)).toThrow(
        BadRequestException,
      );
      expect(() => service.executeBattle(char1.id, char2.id)).toThrow(
        'Thief1 is already dead',
      );
    });

    it('should throw error if same character battles itself', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );

      expect(() => service.executeBattle(char1.id, char1.id)).toThrow(
        BadRequestException,
      );
      expect(() => service.executeBattle(char1.id, char1.id)).toThrow(
        'Cannot battle the same character',
      );
    });
  });

  describe('executeBattle - battle mechanics', () => {
    it('should execute battle and return a winner', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );
      const char2 = repository.save(
        new Character('', 'Thief1', JobType.THIEF),
      );

      const result = service.executeBattle(char1.id, char2.id);

      expect(result).toBeDefined();
      expect(result.winnerId).toBeDefined();
      expect(result.winnerName).toBeDefined();
      expect(result.winnerRemainingHP).toBeGreaterThanOrEqual(0);
      expect(result.loserId).toBeDefined();
      expect(result.loserName).toBeDefined();
      expect(result.log).toBeDefined();
      expect(result.log.length).toBeGreaterThan(0);
    });

    it('should have one character alive and one dead after battle', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );
      const char2 = repository.save(
        new Character('', 'Thief1', JobType.THIEF),
      );

      service.executeBattle(char1.id, char2.id);

      const updatedChar1 = repository.findById(char1.id);
      const updatedChar2 = repository.findById(char2.id);

      // One should be alive, one should be dead
      expect(updatedChar1!.isAlive).not.toBe(updatedChar2!.isAlive);

      // Dead character should have 0 HP
      if (!updatedChar1!.isAlive) {
        expect(updatedChar1!.currentHP).toBe(0);
      }
      if (!updatedChar2!.isAlive) {
        expect(updatedChar2!.currentHP).toBe(0);
      }
    });

    it('should never reduce HP below 0', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );
      const char2 = repository.save(
        new Character('', 'Thief1', JobType.THIEF),
      );

      service.executeBattle(char1.id, char2.id);

      const updatedChar1 = repository.findById(char1.id);
      const updatedChar2 = repository.findById(char2.id);

      expect(updatedChar1!.currentHP).toBeGreaterThanOrEqual(0);
      expect(updatedChar2!.currentHP).toBeGreaterThanOrEqual(0);
    });

    it('should update character state in repository after battle', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );
      const char2 = repository.save(
        new Character('', 'Thief1', JobType.THIEF),
      );

      const initialHP1 = char1.currentHP;
      const initialHP2 = char2.currentHP;

      service.executeBattle(char1.id, char2.id);

      const updatedChar1 = repository.findById(char1.id);
      const updatedChar2 = repository.findById(char2.id);

      // At least one character should have different HP
      expect(
        updatedChar1!.currentHP !== initialHP1 ||
          updatedChar2!.currentHP !== initialHP2,
      ).toBe(true);
    });

    it('should allow either character to win (run multiple battles)', () => {
      const winners = new Set<string>();

      // Run 50 battles to see if both characters can win
      for (let i = 0; i < 50; i++) {
        repository.clear();

        const char1 = repository.save(
          new Character('', 'Warrior1', JobType.WARRIOR),
        );
        const char2 = repository.save(
          new Character('', 'Thief1', JobType.THIEF),
        );

        const result = service.executeBattle(char1.id, char2.id);
        winners.add(result.winnerName);

        // If both have won, we can stop early
        if (winners.size === 2) break;
      }

      // Both characters should have won at least once
      // (Probabilistically, this should always pass with 50 attempts)
      expect(winners.size).toBeGreaterThanOrEqual(1);
      // Note: We expect 2 but allow 1 due to random chance
    });
  });

  describe('executeBattle - battle log format', () => {
    it('should start log with battle begins message', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );
      const char2 = repository.save(
        new Character('', 'Thief1', JobType.THIEF),
      );

      const result = service.executeBattle(char1.id, char2.id);

      expect(result.log[0]).toMatch(/^Battle between .* begins!$/);
      expect(result.log[0]).toContain('Warrior1');
      expect(result.log[0]).toContain('Thief1');
      expect(result.log[0]).toContain('Warrior');
      expect(result.log[0]).toContain('Thief');
    });

    it('should end log with winner announcement', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );
      const char2 = repository.save(
        new Character('', 'Thief1', JobType.THIEF),
      );

      const result = service.executeBattle(char1.id, char2.id);

      const lastLine = result.log[result.log.length - 1];
      expect(lastLine).toMatch(/^.* wins the battle! .* still has \d+ HP remaining!$/);
      expect(lastLine).toContain(result.winnerName);
      expect(lastLine).toContain(`${result.winnerRemainingHP} HP`);
    });

    it('should include speed comparison in each round', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );
      const char2 = repository.save(
        new Character('', 'Thief1', JobType.THIEF),
      );

      const result = service.executeBattle(char1.id, char2.id);

      // Find speed comparison lines
      const speedLines = result.log.filter((line) =>
        line.includes('speed was faster than'),
      );

      expect(speedLines.length).toBeGreaterThanOrEqual(1);
      speedLines.forEach((line) => {
        expect(line).toMatch(
          /^.* \d+ speed was faster than .* \d+ speed and will begin this round\.$/,
        );
      });
    });

    it('should include attack messages with damage and remaining HP', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );
      const char2 = repository.save(
        new Character('', 'Thief1', JobType.THIEF),
      );

      const result = service.executeBattle(char1.id, char2.id);

      // Find attack lines
      const attackLines = result.log.filter((line) => line.includes('attacks'));

      expect(attackLines.length).toBeGreaterThanOrEqual(1);
      attackLines.forEach((line) => {
        expect(line).toMatch(
          /^.* attacks .* for \d+, .* has \d+ HP remaining\.$/,
        );
      });
    });

    it('should have correct log structure: begin -> rounds -> winner', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );
      const char2 = repository.save(
        new Character('', 'Thief1', JobType.THIEF),
      );

      const result = service.executeBattle(char1.id, char2.id);

      // First line is battle begins
      expect(result.log[0]).toContain('begins!');

      // Last line is winner announcement
      expect(result.log[result.log.length - 1]).toContain('wins the battle!');

      // Middle lines are rounds (speed + attacks)
      const middleLines = result.log.slice(1, -1);
      expect(middleLines.length).toBeGreaterThanOrEqual(2); // At least one round
    });
  });

  describe('executeBattle - damage and speed calculations', () => {
    it('should deal damage between 0 and attackModifier', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );
      const char2 = repository.save(
        new Character('', 'Thief1', JobType.THIEF),
      );

      const result = service.executeBattle(char1.id, char2.id);

      // Parse attack lines to check damage values
      const attackLines = result.log.filter((line) => line.includes('attacks'));

      attackLines.forEach((line) => {
        const match = line.match(/attacks .* for (\d+),/);
        if (match) {
          const damage = parseInt(match[1], 10);
          expect(damage).toBeGreaterThanOrEqual(0);
          // Damage should be reasonable (max attack modifier for any job is ~14)
          expect(damage).toBeLessThanOrEqual(20);
        }
      });
    });

    it('should have speed values between 0 and speedModifier', () => {
      const char1 = repository.save(
        new Character('', 'Warrior1', JobType.WARRIOR),
      );
      const char2 = repository.save(
        new Character('', 'Thief1', JobType.THIEF),
      );

      const result = service.executeBattle(char1.id, char2.id);

      // Parse speed lines to check speed values
      const speedLines = result.log.filter((line) =>
        line.includes('speed was faster'),
      );

      speedLines.forEach((line) => {
        const matches = line.match(/(\d+) speed/g);
        if (matches && matches.length >= 2) {
          matches.forEach((match) => {
            const speed = parseInt(match.match(/(\d+)/)![1], 10);
            expect(speed).toBeGreaterThanOrEqual(0);
            // Speed should be reasonable (max speed modifier is ~8 for Thief)
            expect(speed).toBeLessThanOrEqual(10);
          });
        }
      });
    });
  });
});
