import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { CharactersModule } from '../src/characters/characters.module';
import { CharacterRepository } from '../src/repositories/character.repository';

describe('Characters (e2e)', () => {
  let app: INestApplication;
  let repository: CharacterRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CharactersModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Enable validation pipe (same as main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    repository = moduleFixture.get<CharacterRepository>(CharacterRepository);
  });

  afterEach(async () => {
    repository.clear();
    await app.close();
  });

  describe('POST /characters', () => {
    it('should create a Warrior character with valid data', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Aragorn', job: 'Warrior' })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('Aragorn');
          expect(res.body.job).toBe('Warrior');
          expect(res.body.maxHP).toBe(20);
          expect(res.body.strength).toBe(10);
          expect(res.body.attackModifier).toBe(9);
        });
    });

    it('should create a Thief character with valid data', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Legolas', job: 'Thief' })
        .expect(201)
        .expect((res) => {
          expect(res.body.job).toBe('Thief');
          expect(res.body.maxHP).toBe(15);
          expect(res.body.dexterity).toBe(10);
          expect(res.body.attackModifier).toBe(12);
        });
    });

    it('should create a Mage character with valid data', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Gandalf', job: 'Mage' })
        .expect(201)
        .expect((res) => {
          expect(res.body.job).toBe('Mage');
          expect(res.body.maxHP).toBe(12);
          expect(res.body.intelligence).toBe(10);
          expect(res.body.attackModifier).toBe(14.2);
        });
    });

    it('should accept name with underscores', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Dark_Knight', job: 'Warrior' })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('Dark_Knight');
        });
    });

    it('should accept 4-character name (minimum)', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Thor', job: 'Warrior' })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('Thor');
        });
    });

    it('should accept 15-character name (maximum)', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'FifteenCharName', job: 'Warrior' })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('FifteenCharName');
        });
    });

    // Validation tests - invalid names
    it('should reject name with less than 4 characters', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Bob', job: 'Warrior' })
        .expect(400)
        .expect((res) => {
          const message = Array.isArray(res.body.message)
            ? res.body.message[0]
            : res.body.message;
          expect(message).toContain('Name must contain');
        });
    });

    it('should reject name with more than 15 characters', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'ThisNameIsTooLongForTheGame', job: 'Warrior' })
        .expect(400);
    });

    it('should reject name with numbers', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Warrior123', job: 'Warrior' })
        .expect(400)
        .expect((res) => {
          const message = Array.isArray(res.body.message)
            ? res.body.message[0]
            : res.body.message;
          expect(message).toContain('Name must contain');
        });
    });

    it('should reject name with spaces', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Dark Knight', job: 'Warrior' })
        .expect(400);
    });

    it('should reject name with special characters', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Dark@Knight', job: 'Warrior' })
        .expect(400);
    });

    it('should reject empty name', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: '', job: 'Warrior' })
        .expect(400);
    });

    // Validation tests - invalid jobs
    it('should reject invalid job type', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Aragorn', job: 'Paladin' })
        .expect(400)
        .expect((res) => {
          const message = Array.isArray(res.body.message)
            ? res.body.message[0]
            : res.body.message;
          expect(message).toContain('Job must be one of');
        });
    });

    it('should reject missing job field', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Aragorn' })
        .expect(400);
    });

    it('should reject missing name field', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ job: 'Warrior' })
        .expect(400);
    });

    it('should reject empty request body', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({})
        .expect(400);
    });
  });

  describe('GET /characters', () => {
    it('should return empty array when no characters exist', () => {
      return request(app.getHttpServer())
        .get('/characters')
        .expect(200)
        .expect([]);
    });

    it('should return all characters with name, job, and status', async () => {
      // Create characters
      await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'WarriorOne', job: 'Warrior' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'ThiefOne', job: 'Thief' })
        .expect(201);

      // Get all characters
      const res = await request(app.getHttpServer())
        .get('/characters')
        .expect(200);

      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('job');
      expect(res.body[0]).toHaveProperty('status');
      expect(res.body[0].status).toBe('Alive');
    });
  });

  describe('GET /characters/:id', () => {
    it('should return character details by ID', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Aragorn', job: 'Warrior' });

      const characterId = createRes.body.id;

      return request(app.getHttpServer())
        .get(`/characters/${characterId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(characterId);
          expect(res.body.name).toBe('Aragorn');
          expect(res.body.job).toBe('Warrior');
          expect(res.body.maxHP).toBe(20);
          expect(res.body.currentHP).toBe(20);
          expect(res.body.strength).toBe(10);
          expect(res.body.attackModifier).toBe(9);
          expect(res.body.speedModifier).toBe(4);
          expect(res.body.isAlive).toBe(true);
        });
    });

    it('should return 404 for non-existent character', () => {
      return request(app.getHttpServer())
        .get('/characters/999')
        .expect(404)
        .expect((res) => {
          const message =
            typeof res.body.message === 'string'
              ? res.body.message
              : res.body.message[0];
          expect(message).toContain('Character with ID 999 not found');
        });
    });
  });
});
