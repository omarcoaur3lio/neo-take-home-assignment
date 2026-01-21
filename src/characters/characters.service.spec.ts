import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CharacterRepository } from '../repositories/character.repository';
import { JobType } from '../models/job.model';

describe('CharactersService', () => {
  let service: CharactersService;
  let repository: CharacterRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CharactersService, CharacterRepository],
    }).compile();

    service = module.get<CharactersService>(CharactersService);
    repository = module.get<CharacterRepository>(CharacterRepository);
  });

  afterEach(() => {
    repository.clear();
  });

  describe('create - Warrior', () => {
    it('should create a Warrior with correct base stats', () => {
      const dto = { name: 'TestWarrior', job: JobType.WARRIOR };
      const character = service.create(dto);

      expect(character.name).toBe('TestWarrior');
      expect(character.job).toBe(JobType.WARRIOR);
      expect(character.maxHP).toBe(20);
      expect(character.currentHP).toBe(20);
      expect(character.strength).toBe(10);
      expect(character.dexterity).toBe(5);
      expect(character.intelligence).toBe(5);
      expect(character.isAlive).toBe(true);
    });

    it('should calculate Warrior attack modifier correctly (80% str + 20% dex)', () => {
      const dto = { name: 'TestWarrior', job: JobType.WARRIOR };
      const character = service.create(dto);

      // Warrior: str=10, dex=5
      // Attack = 0.8 * 10 + 0.2 * 5 = 8 + 1 = 9
      expect(character.attackModifier).toBe(9);
    });

    it('should calculate Warrior speed modifier correctly (60% dex + 20% int)', () => {
      const dto = { name: 'TestWarrior', job: JobType.WARRIOR };
      const character = service.create(dto);

      // Warrior: dex=5, int=5
      // Speed = 0.6 * 5 + 0.2 * 5 = 3 + 1 = 4
      expect(character.speedModifier).toBe(4);
    });
  });

  describe('create - Thief', () => {
    it('should create a Thief with correct base stats', () => {
      const dto = { name: 'TestThief', job: JobType.THIEF };
      const character = service.create(dto);

      expect(character.name).toBe('TestThief');
      expect(character.job).toBe(JobType.THIEF);
      expect(character.maxHP).toBe(15);
      expect(character.currentHP).toBe(15);
      expect(character.strength).toBe(4);
      expect(character.dexterity).toBe(10);
      expect(character.intelligence).toBe(4);
      expect(character.isAlive).toBe(true);
    });

    it('should calculate Thief attack modifier correctly (25% str + 100% dex + 25% int)', () => {
      const dto = { name: 'TestThief', job: JobType.THIEF };
      const character = service.create(dto);

      // Thief: str=4, dex=10, int=4
      // Attack = 0.25 * 4 + 1.0 * 10 + 0.25 * 4 = 1 + 10 + 1 = 12
      expect(character.attackModifier).toBe(12);
    });

    it('should calculate Thief speed modifier correctly (80% dex)', () => {
      const dto = { name: 'TestThief', job: JobType.THIEF };
      const character = service.create(dto);

      // Thief: dex=10
      // Speed = 0.8 * 10 = 8
      expect(character.speedModifier).toBe(8);
    });
  });

  describe('create - Mage', () => {
    it('should create a Mage with correct base stats', () => {
      const dto = { name: 'TestMage', job: JobType.MAGE };
      const character = service.create(dto);

      expect(character.name).toBe('TestMage');
      expect(character.job).toBe(JobType.MAGE);
      expect(character.maxHP).toBe(12);
      expect(character.currentHP).toBe(12);
      expect(character.strength).toBe(5);
      expect(character.dexterity).toBe(6);
      expect(character.intelligence).toBe(10);
      expect(character.isAlive).toBe(true);
    });

    it('should calculate Mage attack modifier correctly (20% str + 20% dex + 120% int)', () => {
      const dto = { name: 'TestMage', job: JobType.MAGE };
      const character = service.create(dto);

      // Mage: str=5, dex=6, int=10
      // Attack = 0.2 * 5 + 0.2 * 6 + 1.2 * 10 = 1 + 1.2 + 12 = 14.2
      expect(character.attackModifier).toBe(14.2);
    });

    it('should calculate Mage speed modifier correctly (40% dex + 10% str)', () => {
      const dto = { name: 'TestMage', job: JobType.MAGE };
      const character = service.create(dto);

      // Mage: dex=6, str=5
      // Speed = 0.4 * 6 + 0.1 * 5 = 2.4 + 0.5 = 2.9
      expect(character.speedModifier).toBeCloseTo(2.9);
    });
  });

  describe('create - general behavior', () => {
    it('should generate unique IDs for multiple characters', () => {
      const char1 = service.create({ name: 'Warrior1', job: JobType.WARRIOR });
      const char2 = service.create({ name: 'Thief1', job: JobType.THIEF });
      const char3 = service.create({ name: 'Mage1', job: JobType.MAGE });

      expect(char1.id).toBeDefined();
      expect(char2.id).toBeDefined();
      expect(char3.id).toBeDefined();

      const ids = new Set([char1.id, char2.id, char3.id]);
      expect(ids.size).toBe(3);
    });

    it('should store created character in repository', () => {
      const dto = { name: 'TestWarrior', job: JobType.WARRIOR };
      const created = service.create(dto);

      const found = repository.findById(created.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe('TestWarrior');
    });
  });

  describe('findAll', () => {
    it('should return empty array when no characters exist', () => {
      const characters = service.findAll();

      expect(characters).toEqual([]);
      expect(characters.length).toBe(0);
    });

    it('should return all created characters', () => {
      service.create({ name: 'Warrior1', job: JobType.WARRIOR });
      service.create({ name: 'Thief1', job: JobType.THIEF });
      service.create({ name: 'Mage1', job: JobType.MAGE });

      const characters = service.findAll();

      expect(characters.length).toBe(3);
      expect(characters.map((c) => c.name)).toContain('Warrior1');
      expect(characters.map((c) => c.name)).toContain('Thief1');
      expect(characters.map((c) => c.name)).toContain('Mage1');
    });
  });

  describe('findOne', () => {
    it('should return character by ID', () => {
      const created = service.create({
        name: 'TestWarrior',
        job: JobType.WARRIOR,
      });

      const found = service.findOne(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('TestWarrior');
    });

    it('should throw NotFoundException for non-existent ID', () => {
      expect(() => service.findOne('non-existent')).toThrow(NotFoundException);
      expect(() => service.findOne('non-existent')).toThrow(
        'Character with ID non-existent not found',
      );
    });
  });
});
