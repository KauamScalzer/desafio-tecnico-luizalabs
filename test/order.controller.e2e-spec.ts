import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('OrderController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/order/upload', () => {
    it('should process the upload and return 201', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/order/upload')
        .attach('file', `${__dirname}/mock_orders.txt`)
        .expect(201);
    });

    it('should return 400 if no file is uploaded', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/order/upload')
        .expect(400);
    });

    it('should return 413 if the file size is larger than 5MB', async () => {
      const bigBuffer = Buffer.alloc(5 * 1024 * 1024 + 1, 'a');
      await request(app.getHttpServer())
        .post('/api/v1/order/upload')
        .attach('file', bigBuffer, { filename: 'big.txt' })
        .expect(413);
    });
  });

  describe('GET /api/v1/order', () => {
    it('should return a list of users with orders', async () => {
      await request(app.getHttpServer()).get('/api/v1/order').expect(200);
    });

    it('should accept the orderId filter', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/order')
        .query({ orderId: 1 })
        .expect(200);
    });

    it('should accept startDate and endDate filters', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/order')
        .query({ startDate: '2021-05-01', endDate: '2021-05-05' })
        .expect(200);
    });

    it('should return 400 for invalid orderId parameter', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/order')
        .query({ orderId: 'invalid' })
        .expect(400);
    });

    it('should return 400 for invalid startDate parameter', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/order')
        .query({ startDate: 'invalid' })
        .expect(400);
    });

    it('should return 400 for invalid endDate parameter', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/order')
        .query({ endDate: 'invalid' })
        .expect(400);
    });
  });
});
