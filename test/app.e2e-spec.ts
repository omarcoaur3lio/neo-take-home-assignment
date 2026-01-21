import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health check status with Terminus format', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.info).toBeDefined();
          expect(res.body.details).toBeDefined();
          expect(res.body.details.memory_heap).toBeDefined();
          expect(res.body.details.memory_heap.status).toBe('up');
          expect(res.body.details.memory_rss).toBeDefined();
          expect(res.body.details.memory_rss.status).toBe('up');
          expect(res.body.details.storage).toBeDefined();
          expect(res.body.details.storage.status).toBe('up');
        });
    });
  });
});
