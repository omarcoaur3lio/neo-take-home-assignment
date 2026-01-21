import { CharacterRepository } from './character.repository';
import { Character } from '../models/character.model';
import { JobType } from '../models/job.model';

describe('CharacterRepository', () => {
  let repository: CharacterRepository;

  beforeEach(() => {
    repository = new CharacterRepository();
  });

  afterEach(() => {
    repository.clear();
  });

  describe('save', () => {
    it('should save a character and generate an ID', () => {
      const character = new Character('', 'TestWarrior', JobType.WARRIOR);
      const saved = repository.save(character);

      expect(saved.id).toBeDefined();
      expect(saved.id).toBe('1');
      expect(saved.name).toBe('TestWarrior');
      expect(saved.job).toBe(JobType.WARRIOR);
    });

    it('should generate unique IDs for multiple characters', () => {
      const char1 = new Character('', 'Warrior1', JobType.WARRIOR);
      const char2 = new Character('', 'Thief1', JobType.THIEF);
      const char3 = new Character('', 'Mage1', JobType.MAGE);

      const saved1 = repository.save(char1);
      const saved2 = repository.save(char2);
      const saved3 = repository.save(char3);

      expect(saved1.id).toBe('1');
      expect(saved2.id).toBe('2');
      expect(saved3.id).toBe('3');

      // Verify all IDs are unique
      const ids = new Set([saved1.id, saved2.id, saved3.id]);
      expect(ids.size).toBe(3);
    });

    it('should not overwrite existing ID if character already has one', () => {
      const character = new Character(
        'existing-id',
        'TestWarrior',
        JobType.WARRIOR,
      );
      const saved = repository.save(character);

      expect(saved.id).toBe('existing-id');
    });
  });

  describe('findById', () => {
    it('should find a character by ID', () => {
      const character = new Character('', 'TestWarrior', JobType.WARRIOR);
      const saved = repository.save(character);

      const found = repository.findById(saved.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(saved.id);
      expect(found?.name).toBe('TestWarrior');
    });

    it('should return undefined for non-existent ID', () => {
      const found = repository.findById('non-existent');

      expect(found).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no characters exist', () => {
      const all = repository.findAll();

      expect(all).toEqual([]);
      expect(all.length).toBe(0);
    });

    it('should return all characters', () => {
      const char1 = new Character('', 'Warrior1', JobType.WARRIOR);
      const char2 = new Character('', 'Thief1', JobType.THIEF);
      const char3 = new Character('', 'Mage1', JobType.MAGE);

      repository.save(char1);
      repository.save(char2);
      repository.save(char3);

      const all = repository.findAll();

      expect(all.length).toBe(3);
      expect(all.map((c) => c.name)).toContain('Warrior1');
      expect(all.map((c) => c.name)).toContain('Thief1');
      expect(all.map((c) => c.name)).toContain('Mage1');
    });
  });

  describe('update', () => {
    it('should update an existing character', () => {
      const character = new Character('', 'TestWarrior', JobType.WARRIOR);
      const saved = repository.save(character);

      // Modify character
      saved.currentHP = 10;
      repository.update(saved);

      const found = repository.findById(saved.id);
      expect(found?.currentHP).toBe(10);
    });

    it('should update character state after taking damage', () => {
      const character = new Character('', 'TestWarrior', JobType.WARRIOR);
      const saved = repository.save(character);

      expect(saved.currentHP).toBe(20); // Warrior starts with 20 HP

      saved.takeDamage(5);
      repository.update(saved);

      const found = repository.findById(saved.id);
      expect(found?.currentHP).toBe(15);
      expect(found?.isAlive).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a character by ID', () => {
      const character = new Character('', 'TestWarrior', JobType.WARRIOR);
      const saved = repository.save(character);

      const deleted = repository.delete(saved.id);

      expect(deleted).toBe(true);
      expect(repository.findById(saved.id)).toBeUndefined();
    });

    it('should return false when deleting non-existent character', () => {
      const deleted = repository.delete('non-existent');

      expect(deleted).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true for existing character', () => {
      const character = new Character('', 'TestWarrior', JobType.WARRIOR);
      const saved = repository.save(character);

      expect(repository.exists(saved.id)).toBe(true);
    });

    it('should return false for non-existent character', () => {
      expect(repository.exists('non-existent')).toBe(false);
    });
  });

  describe('count', () => {
    it('should return 0 when no characters exist', () => {
      expect(repository.count()).toBe(0);
    });

    it('should return correct count of characters', () => {
      repository.save(new Character('', 'Warrior1', JobType.WARRIOR));
      repository.save(new Character('', 'Thief1', JobType.THIEF));
      repository.save(new Character('', 'Mage1', JobType.MAGE));

      expect(repository.count()).toBe(3);
    });
  });

  describe('clear', () => {
    it('should clear all characters and reset ID counter', () => {
      repository.save(new Character('', 'Warrior1', JobType.WARRIOR));
      repository.save(new Character('', 'Thief1', JobType.THIEF));

      expect(repository.count()).toBe(2);

      repository.clear();

      expect(repository.count()).toBe(0);
      expect(repository.findAll()).toEqual([]);

      // Verify ID counter is reset
      const newChar = repository.save(
        new Character('', 'NewWarrior', JobType.WARRIOR),
      );
      expect(newChar.id).toBe('1');
    });
  });
});
