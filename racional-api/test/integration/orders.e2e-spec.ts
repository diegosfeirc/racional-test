import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { StockResponseDto } from '../../src/stocks/dto/stock-response.dto';
import { PortfolioResponseDto } from '../../src/portfolios/dto/portfolio-response.dto';
import { OrderResponseDto } from '../../src/orders/dto/order-response.dto';
import { UserResponseDto } from '../../src/users/dto/user-response.dto';

describe('Orders (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let testUserId: string;
  let testStockId: string;
  let testPortfolioId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create a test user through the API to ensure wallet is created automatically
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'order-test@example.com',
        firstName: 'Order',
        lastName: 'Test',
      })
      .expect(201);
    testUserId = (userResponse.body as UserResponseDto).id;

    // Create a test stock
    const stockResponse = await request(app.getHttpServer())
      .post('/stocks')
      .send({
        symbol: 'TEST',
        name: 'Test Stock',
        price: 100.0,
      })
      .expect(201);
    testStockId = (stockResponse.body as StockResponseDto).id;

    // Create a test portfolio
    const portfolioResponse = await request(app.getHttpServer())
      .post('/portfolios')
      .send({
        userId: testUserId,
        name: 'Test Portfolio',
      })
      .expect(201);
    testPortfolioId = (portfolioResponse.body as PortfolioResponseDto).id;

    // Add funds to wallet
    await request(app.getHttpServer())
      .post('/transactions')
      .send({
        userId: testUserId,
        type: 'DEPOSIT',
        amount: 10000.0,
        date: new Date().toISOString(),
      })
      .expect(201);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.order.deleteMany({});
    await prisma.portfolioHolding.deleteMany({});
    await prisma.portfolio.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.wallet.deleteMany({});
    await prisma.stock.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /orders', () => {
    it('should create a buy order', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .send({
          userId: testUserId,
          portfolioId: testPortfolioId,
          stockId: testStockId,
          type: 'BUY',
          amount: 1000.0,
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as OrderResponseDto;
          expect(body).toHaveProperty('id');
          expect(body.userId).toBe(testUserId);
          expect(body.stockId).toBe(testStockId);
          expect(body.type).toBe('BUY');
          expect(body.quantity).toBe(10);
          expect(body.unitPrice).toBe(100.0);
          expect(body.total).toBe(1000.0);
          expect(body.status).toBe('EXECUTED');
        });
    });

    it('should create a sell order', async () => {
      // First buy some stock
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          userId: testUserId,
          portfolioId: testPortfolioId,
          stockId: testStockId,
          type: 'BUY',
          amount: 2000.0, // 20 shares × $100
        })
        .expect(201);

      // Then create a sell order
      return request(app.getHttpServer())
        .post('/orders')
        .send({
          userId: testUserId,
          portfolioId: testPortfolioId,
          stockId: testStockId,
          type: 'SELL',
          amount: 500.0, // 5 shares × $100
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as OrderResponseDto;
          expect(body.type).toBe('SELL');
          expect(body.quantity).toBe(5);
          expect(body.unitPrice).toBe(100.0);
          expect(body.total).toBe(500.0);
        });
    });

    it('should return 400 when insufficient balance for buy order', async () => {
      // Create user through API to ensure wallet is created
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `poor-${Date.now()}@example.com`,
          firstName: 'Poor',
          lastName: 'User',
        })
        .expect(201);
      const user = userResponse.body as UserResponseDto;

      // Verify user exists
      await request(app.getHttpServer()).get(`/users/${user.id}`).expect(200);

      // Create a stock for this test
      const stockResponse = await request(app.getHttpServer())
        .post('/stocks')
        .send({
          symbol: `POOR${Date.now()}`,
          name: 'Poor Stock',
          price: 100.0,
        })
        .expect(201);
      const stockId = (stockResponse.body as StockResponseDto).id;

      // Verify user still exists before creating portfolio
      await request(app.getHttpServer()).get(`/users/${user.id}`).expect(200);

      const portfolioResponse = await request(app.getHttpServer())
        .post('/portfolios')
        .send({
          userId: user.id,
          name: `Poor Portfolio ${Date.now()}`,
        })
        .expect(201);
      const portfolio = portfolioResponse.body as PortfolioResponseDto;

      // Verify portfolio exists
      await request(app.getHttpServer())
        .get(`/portfolios/${portfolio.id}`)
        .expect(200);

      return request(app.getHttpServer())
        .post('/orders')
        .send({
          userId: user.id,
          portfolioId: portfolio.id,
          stockId: stockId,
          type: 'BUY',
          amount: 100000.0, // 1000 shares × $100, but user has no balance
        })
        .expect(400);
    });

    it('should return 404 when user, portfolio or stock not found', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .send({
          userId: 'non-existent-user',
          portfolioId: testPortfolioId,
          stockId: testStockId,
          type: 'BUY',
          amount: 1000.0,
        })
        .expect(404);
    });
  });

  describe('GET /orders/user/:userId', () => {
    it('should get all orders for a user', async () => {
      // Create a new user for this test to ensure it exists
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `orders-list-${Date.now()}@example.com`,
          firstName: 'Orders',
          lastName: 'List',
        })
        .expect(201);
      const userId = (userResponse.body as UserResponseDto).id;

      // Verify user exists
      await request(app.getHttpServer()).get(`/users/${userId}`).expect(200);

      // Create a portfolio for this user
      const portfolioResponse = await request(app.getHttpServer())
        .post('/portfolios')
        .send({
          userId: userId,
          name: `Orders List Portfolio ${Date.now()}`,
        })
        .expect(201);
      const portfolioId = (portfolioResponse.body as PortfolioResponseDto).id;

      // Verify portfolio exists
      await request(app.getHttpServer())
        .get(`/portfolios/${portfolioId}`)
        .expect(200);

      // Verify user still exists before creating transaction
      await request(app.getHttpServer()).get(`/users/${userId}`).expect(200);

      // Add funds to ensure we have enough balance
      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          userId: userId,
          type: 'DEPOSIT',
          amount: 5000.0,
          date: new Date().toISOString(),
        })
        .expect(201);

      // Create an order
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          userId: userId,
          portfolioId: portfolioId,
          stockId: testStockId,
          type: 'BUY',
          amount: 500.0, // 5 shares × $100
        })
        .expect(201);

      return request(app.getHttpServer())
        .get(`/orders/user/${userId}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as OrderResponseDto[];
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /orders/:id', () => {
    it('should get an order by id', async () => {
      // Create a new user for this test to ensure it exists
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `orders-get-${Date.now()}@example.com`,
          firstName: 'Orders',
          lastName: 'Get',
        })
        .expect(201);
      const userId = (userResponse.body as UserResponseDto).id;

      // Verify user exists
      await request(app.getHttpServer()).get(`/users/${userId}`).expect(200);

      // Create a portfolio for this user
      const portfolioResponse = await request(app.getHttpServer())
        .post('/portfolios')
        .send({
          userId: userId,
          name: `Orders Get Portfolio ${Date.now()}`,
        })
        .expect(201);
      const portfolioId = (portfolioResponse.body as PortfolioResponseDto).id;

      // Verify portfolio exists
      await request(app.getHttpServer())
        .get(`/portfolios/${portfolioId}`)
        .expect(200);

      // Verify user still exists before creating transaction
      await request(app.getHttpServer()).get(`/users/${userId}`).expect(200);

      // Add funds to ensure we have enough balance
      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          userId: userId,
          type: 'DEPOSIT',
          amount: 5000.0,
          date: new Date().toISOString(),
        })
        .expect(201);

      const createResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          userId: userId,
          portfolioId: portfolioId,
          stockId: testStockId,
          type: 'BUY',
          amount: 300.0, // 3 shares × $100
        })
        .expect(201);

      const orderId = (createResponse.body as OrderResponseDto).id;

      return request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as OrderResponseDto;
          expect(body.id).toBe(orderId);
          expect(body.quantity).toBe(3);
          expect(body.unitPrice).toBe(100.0);
          expect(body.total).toBe(300.0);
        });
    });

    it('should return 400 when amount is zero or negative', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .send({
          userId: testUserId,
          portfolioId: testPortfolioId,
          stockId: testStockId,
          type: 'BUY',
          amount: 0.0,
        })
        .expect(400);
    });

    it('should allow fractional shares correctly', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          userId: testUserId,
          portfolioId: testPortfolioId,
          stockId: testStockId,
          type: 'BUY',
          amount: 150.0, // Would be 1.5 shares
        })
        .expect(201);

      const body = response.body as OrderResponseDto;
      expect(body.quantity).toBe(1.5);
      expect(body.unitPrice).toBe(100.0);
      expect(body.total).toBe(150.0); // Exact amount: 1.5 * 100
    });

    it('should allow very small fractional shares', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          userId: testUserId,
          portfolioId: testPortfolioId,
          stockId: testStockId,
          type: 'BUY',
          amount: 5.0, // Would be 0.05 shares
        })
        .expect(201);

      const body = response.body as OrderResponseDto;
      expect(body.quantity).toBe(0.05);
      expect(body.unitPrice).toBe(100.0);
      expect(body.total).toBe(5.0); // Exact amount: 0.05 * 100
    });
  });
});
