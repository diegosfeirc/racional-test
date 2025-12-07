import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TransactionResponseDto } from '../../src/transactions/dto/transaction-response.dto';
import { BalanceResponseDto } from '../../src/wallets/dto/balance-response.dto';
import { UserResponseDto } from '../../src/users/dto/user-response.dto';

describe('Transactions (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let testUserId: string;

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
        email: 'transaction-test@example.com',
        firstName: 'Transaction',
        lastName: 'Test',
      })
      .expect(201);
    testUserId = (userResponse.body as UserResponseDto).id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.transaction.deleteMany({});
    await prisma.wallet.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /transactions', () => {
    it('should create a deposit transaction', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .send({
          userId: testUserId,
          type: 'DEPOSIT',
          amount: 1000.0,
          date: new Date().toISOString(),
          description: 'Initial deposit',
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as TransactionResponseDto;
          expect(body).toHaveProperty('id');
          expect(body.userId).toBe(testUserId);
          expect(body.type).toBe('DEPOSIT');
          expect(body.amount).toBe(1000.0);
        });
    });

    it('should create a withdrawal transaction', async () => {
      // First deposit
      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          userId: testUserId,
          type: 'DEPOSIT',
          amount: 2000.0,
          date: new Date().toISOString(),
        })
        .expect(201);

      // Then withdraw
      return request(app.getHttpServer())
        .post('/transactions')
        .send({
          userId: testUserId,
          type: 'WITHDRAWAL',
          amount: 500.0,
          date: new Date().toISOString(),
          description: 'Withdrawal test',
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as TransactionResponseDto;
          expect(body.type).toBe('WITHDRAWAL');
          expect(body.amount).toBe(500.0);
        });
    });

    it('should return 400 when withdrawal exceeds balance', async () => {
      // Create user through API to ensure wallet is created
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'insufficient@example.com',
          firstName: 'Insufficient',
          lastName: 'Balance',
        })
        .expect(201);
      const user = userResponse.body as UserResponseDto;

      return request(app.getHttpServer())
        .post('/transactions')
        .send({
          userId: user.id,
          type: 'WITHDRAWAL',
          amount: 1000.0,
          date: new Date().toISOString(),
        })
        .expect(400);
    });

    it('should return 404 when user not found', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .send({
          userId: 'non-existent-user-id',
          type: 'DEPOSIT',
          amount: 100.0,
          date: new Date().toISOString(),
        })
        .expect(404);
    });
  });

  describe('GET /transactions/user/:userId', () => {
    it('should get all transactions for a user', async () => {
      // Create some transactions
      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          userId: testUserId,
          type: 'DEPOSIT',
          amount: 500.0,
          date: new Date().toISOString(),
        })
        .expect(201);

      return request(app.getHttpServer())
        .get(`/transactions/user/${testUserId}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as TransactionResponseDto[];
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /transactions/:id', () => {
    it('should get a transaction by id', async () => {
      // Create a new user for this test to ensure it exists
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `transaction-get-${Date.now()}@example.com`,
          firstName: 'Transaction',
          lastName: 'Get',
        })
        .expect(201);
      const userId = (userResponse.body as UserResponseDto).id;

      // Verify user exists
      await request(app.getHttpServer()).get(`/users/${userId}`).expect(200);

      const createResponse = await request(app.getHttpServer())
        .post('/transactions')
        .send({
          userId: userId,
          type: 'DEPOSIT',
          amount: 750.0,
          date: new Date().toISOString(),
        })
        .expect(201);

      const transactionId = (createResponse.body as TransactionResponseDto).id;

      return request(app.getHttpServer())
        .get(`/transactions/${transactionId}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as TransactionResponseDto;
          expect(body.id).toBe(transactionId);
          expect(body.amount).toBe(750.0);
        });
    });
  });

  describe('Wallet balance updates', () => {
    it('should update wallet balance after deposit', async () => {
      // Create user through API to ensure wallet is created
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `balance-test-${Date.now()}@example.com`,
          firstName: 'Balance',
          lastName: 'Test',
        })
        .expect(201);
      const user = userResponse.body as UserResponseDto;

      // Verify user exists
      await request(app.getHttpServer()).get(`/users/${user.id}`).expect(200);

      const initialBalanceResponse = await request(app.getHttpServer())
        .get(`/wallets/user/${user.id}/balance`)
        .expect(200);
      const initialBalance = initialBalanceResponse.body as BalanceResponseDto;

      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          userId: user.id,
          type: 'DEPOSIT',
          amount: 1500.0,
          date: new Date().toISOString(),
        })
        .expect(201);

      const updatedBalanceResponse = await request(app.getHttpServer())
        .get(`/wallets/user/${user.id}/balance`)
        .expect(200);
      const updatedBalance = updatedBalanceResponse.body as BalanceResponseDto;

      expect(updatedBalance.balance).toBe(initialBalance.balance + 1500.0);
    });
  });
});
