import { Test, TestingModule } from '@nestjs/testing';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { CharacterRepository } from '../repositories/character.repository';
import { JobType } from '../models/job.model';

describe('CharactersController', () => {
  let controller: CharactersController;
  let service: CharactersService;
  let repository: CharacterRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CharactersController],
      providers: [CharactersService, CharacterRepository],
    }).compile();

    controller = module.get<CharactersController>(CharactersController);
    service = module.get<CharactersService>(CharactersService);
    repository = module.get<CharacterRepository>(CharacterRepository);
  });

  afterEach(() => {
    repository.clear();
  });

  describe('create', () => {
    it('should create a character and return CharacterResponseDto', () => {
      const dto = { name: 'Aragorn', job: JobType.WARRIOR };
      const response = controller.create(dto);

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.name).toBe('Aragorn');
      expect(response.job).toBe(JobType.WARRIOR);
      expect(response.maxHP).toBe(20);
      expect(response.currentHP).toBe(20);
      expect(response.strength).toBe(10);
      expect(response.dexterity).toBe(5);
      expect(response.intelligence).toBe(5);
      expect(response.attackModifier).toBe(9);
      expect(response.speedModifier).toBe(4);
      expect(response.isAlive).toBe(true);
    });

    it('should create multiple characters with different jobs', () => {
      const warrior = controller.create({
        name: 'Warrior1',
        job: JobType.WARRIOR,
      });
      const thief = controller.create({ name: 'Thief1', job: JobType.THIEF });
      const mage = controller.create({ name: 'Mage1', job: JobType.MAGE });

      expect(warrior.job).toBe(JobType.WARRIOR);
      expect(thief.job).toBe(JobType.THIEF);
      expect(mage.job).toBe(JobType.MAGE);

      expect(warrior.id).not.toBe(thief.id);
      expect(thief.id).not.toBe(mage.id);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no characters exist', () => {
      const result = controller.findAll();

      expect(result).toEqual([]);
    });

    it('should return all characters as CharacterListItemDto', () => {
      controller.create({ name: 'Warrior1', job: JobType.WARRIOR });
      controller.create({ name: 'Thief1', job: JobType.THIEF });
      controller.create({ name: 'Mage1', job: JobType.MAGE });

      const result = controller.findAll();

      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('job');
      expect(result[0]).toHaveProperty('status');
      expect(result[0].status).toBe('Alive');
    });

    it('should show dead status for defeated characters', () => {
      const dto = { name: 'Warrior1', job: JobType.WARRIOR };
      const created = service.create(dto);

      // Kill the character
      created.takeDamage(created.maxHP);
      repository.update(created);

      const result = controller.findAll();

      expect(result[0].status).toBe('Dead');
    });
  });

  describe('findOne', () => {
    it('should return character details by ID', () => {
      const created = controller.create({
        name: 'Aragorn',
        job: JobType.WARRIOR,
      });

      const result = controller.findOne(created.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.name).toBe('Aragorn');
      expect(result.job).toBe(JobType.WARRIOR);
    });

    it('should throw NotFoundException for non-existent ID', () => {
      expect(() => controller.findOne('999')).toThrow();
    });
  });
});
