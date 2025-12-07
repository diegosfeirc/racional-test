import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { StockResponseDto } from '../../src/stocks/dto/stock-response.dto';

describe('Stocks (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.order.deleteMany({});
    await prisma.portfolioHolding.deleteMany({});
    await prisma.stock.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /stocks', () => {
    it('should create a new stock', () => {
      return request(app.getHttpServer())
        .post('/stocks')
        .send({
          symbol: 'AAPL',
          name: 'Apple Inc.',
          price: 150.5,
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as StockResponseDto;
          expect(body).toHaveProperty('id');
          expect(body.symbol).toBe('AAPL');
          expect(body.name).toBe('Apple Inc.');
          expect(body.price).toBe(150.5);
        });
    });

    it('should return 409 when symbol already exists', async () => {
      await request(app.getHttpServer())
        .post('/stocks')
        .send({
          symbol: 'GOOGL',
          name: 'Google Inc.',
          price: 2500.0,
        })
        .expect(201);

      return request(app.getHttpServer())
        .post('/stocks')
        .send({
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          price: 2600.0,
        })
        .expect(409);
    });

    it('should return 400 when data is invalid', () => {
      return request(app.getHttpServer())
        .post('/stocks')
        .send({
          symbol: '',
          name: 'Invalid Stock',
          price: -10,
        })
        .expect(400);
    });
  });

  describe('GET /stocks', () => {
    it('should get all stocks', async () => {
      // Create some stocks
      await request(app.getHttpServer())
        .post('/stocks')
        .send({
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          price: 350.0,
        })
        .expect(201);

      return request(app.getHttpServer())
        .get('/stocks')
        .expect(200)
        .expect((res) => {
          const body = res.body as StockResponseDto[];
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /stocks/:id', () => {
    it('should get a stock by id', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/stocks')
        .send({
          symbol: 'TSLA',
          name: 'Tesla Inc.',
          price: 800.0,
        })
        .expect(201);

      const stockId = (createResponse.body as StockResponseDto).id;

      return request(app.getHttpServer())
        .get(`/stocks/${stockId}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as StockResponseDto;
          expect(body.id).toBe(stockId);
          expect(body.symbol).toBe('TSLA');
        });
    });

    it('should return 404 when stock not found', () => {
      return request(app.getHttpServer())
        .get('/stocks/non-existent-id')
        .expect(404);
    });
  });
});
