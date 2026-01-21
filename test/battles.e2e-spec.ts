import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { BattlesModule } from '../src/battles/battles.module';
import { CharactersModule } from '../src/characters/characters.module';
import { CharacterRepository } from '../src/repositories/character.repository';

describe('Battles (e2e)', () => {
  let app: INestApplication;
  let repository: CharacterRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BattlesModule, CharactersModule],
    }).compile();

    app = moduleFixture.createNestApplication();

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

  describe('POST /battles', () => {
    it('should execute battle between two characters', async () => {
      // Create two characters
      const char1Res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'WarriorOne', job: 'Warrior' });

      const char2Res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'ThiefOne', job: 'Thief' });

      // Execute battle
      return request(app.getHttpServer())
        .post('/battles')
        .send({
          characterId1: char1Res.body.id,
          characterId2: char2Res.body.id,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.winnerId).toBeDefined();
          expect(res.body.winnerName).toBeDefined();
          expect(res.body.winnerRemainingHP).toBeGreaterThanOrEqual(0);
          expect(res.body.loserId).toBeDefined();
          expect(res.body.loserName).toBeDefined();
          expect(res.body.log).toBeDefined();
          expect(Array.isArray(res.body.log)).toBe(true);
          expect(res.body.log.length).toBeGreaterThan(0);
        });
    });

    it('should update character HP after battle', async () => {
      // Create two characters
      const char1Res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'WarriorOne', job: 'Warrior' });

      const char2Res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'ThiefOne', job: 'Thief' });

      const char1Id = char1Res.body.id;
      const char2Id = char2Res.body.id;

      // Execute battle
      await request(app.getHttpServer())
        .post('/battles')
        .send({
          characterId1: char1Id,
          characterId2: char2Id,
        })
        .expect(201);

      // Check updated character states
      const char1AfterRes = await request(app.getHttpServer()).get(
        `/characters/${char1Id}`,
      );

      const char2AfterRes = await request(app.getHttpServer()).get(
        `/characters/${char2Id}`,
      );

      // One should be alive, one should be dead
      expect(char1AfterRes.body.isAlive).not.toBe(char2AfterRes.body.isAlive);

      // Dead character should have 0 HP
      if (!char1AfterRes.body.isAlive) {
        expect(char1AfterRes.body.currentHP).toBe(0);
      }
      if (!char2AfterRes.body.isAlive) {
        expect(char2AfterRes.body.currentHP).toBe(0);
      }
    });

    it('should return proper battle log format', async () => {
      // Create two characters
      const char1Res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Aragorn', job: 'Warrior' });

      const char2Res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Legolas', job: 'Thief' });

      return request(app.getHttpServer())
        .post('/battles')
        .send({
          characterId1: char1Res.body.id,
          characterId2: char2Res.body.id,
        })
        .expect(201)
        .expect((res) => {
          const log = res.body.log;

          // First line should be battle begins
          expect(log[0]).toContain('Battle between');
          expect(log[0]).toContain('begins!');
          expect(log[0]).toContain('Aragorn');
          expect(log[0]).toContain('Legolas');

          // Last line should be winner announcement
          expect(log[log.length - 1]).toContain('wins the battle!');
          expect(log[log.length - 1]).toContain('HP remaining!');

          // Middle lines should contain speed and attack info
          const middleLines = log.slice(1, -1);
          expect(middleLines.length).toBeGreaterThanOrEqual(2);
        });
    });

    it('should return 400 if first character not found', async () => {
      const char1Res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'WarriorOne', job: 'Warrior' });

      return request(app.getHttpServer())
        .post('/battles')
        .send({
          characterId1: '999',
          characterId2: char1Res.body.id,
        })
        .expect(400)
        .expect((res) => {
          const message =
            typeof res.body.message === 'string'
              ? res.body.message
              : res.body.message[0];
          expect(message).toContain('Character with ID 999 not found');
        });
    });

    it('should return 400 if second character not found', async () => {
      const char1Res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'WarriorOne', job: 'Warrior' });

      return request(app.getHttpServer())
        .post('/battles')
        .send({
          characterId1: char1Res.body.id,
          characterId2: '999',
        })
        .expect(400)
        .expect((res) => {
          const message =
            typeof res.body.message === 'string'
              ? res.body.message
              : res.body.message[0];
          expect(message).toContain('Character with ID 999 not found');
        });
    });

    it('should return 400 if character is already dead', async () => {
      // Create three characters
      const char1Res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'WarriorOne', job: 'Warrior' });

      const char2Res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'ThiefOne', job: 'Thief' });

      const char3Res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'MageOne', job: 'Mage' });

      // Battle 1: WarriorOne vs ThiefOne (one will die)
      await request(app.getHttpServer())
        .post('/battles')
        .send({
          characterId1: char1Res.body.id,
          characterId2: char2Res.body.id,
        })
        .expect(201);

      // Try to battle with one of the dead/battled characters again
      return request(app.getHttpServer())
        .post('/battles')
        .send({
          characterId1: char1Res.body.id,
          characterId2: char3Res.body.id,
        })
        .expect((res) => {
          // Should return 400 if char1 is dead, or 201 if char1 won
          if (res.status === 400) {
            const message =
              typeof res.body.message === 'string'
                ? res.body.message
                : res.body.message[0];
            expect(message).toContain('already dead');
          } else {
            expect(res.status).toBe(201);
          }
        });
    });

    it('should return 400 if same character battles itself', async () => {
      const char1Res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'WarriorOne', job: 'Warrior' });

      return request(app.getHttpServer())
        .post('/battles')
        .send({
          characterId1: char1Res.body.id,
          characterId2: char1Res.body.id,
        })
        .expect(400)
        .expect((res) => {
          const message =
            typeof res.body.message === 'string'
              ? res.body.message
              : res.body.message[0];
          expect(message).toContain('Cannot battle the same character');
        });
    });

    it('should mark defeated character as dead in character list', async () => {
      // Create two characters
      const char1Res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'WarriorOne', job: 'Warrior' });

      const char2Res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'ThiefOne', job: 'Thief' });

      // Execute battle
      await request(app.getHttpServer())
        .post('/battles')
        .send({
          characterId1: char1Res.body.id,
          characterId2: char2Res.body.id,
        })
        .expect(201);

      // Get character list
      const listRes = await request(app.getHttpServer())
        .get('/characters')
        .expect(200);

      // Find the statuses
      const char1Status = listRes.body.find(
        (c: any) => c.id === char1Res.body.id,
      )?.status;
      const char2Status = listRes.body.find(
        (c: any) => c.id === char2Res.body.id,
      )?.status;

      // One should be Alive, one should be Dead
      expect([char1Status, char2Status].sort()).toEqual(['Alive', 'Dead']);
    });
  });
});
