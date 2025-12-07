import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { WalletResponseDto } from '../../src/wallets/dto/wallet-response.dto';
import { BalanceResponseDto } from '../../src/wallets/dto/balance-response.dto';
import { UserResponseDto } from '../../src/users/dto/user-response.dto';

describe('Wallets (e2e)', () => {
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
        email: 'wallet-test@example.com',
        firstName: 'Wallet',
        lastName: 'Test',
      })
      .expect(201);
    testUserId = (userResponse.body as UserResponseDto).id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.wallet.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /wallets/user/:userId', () => {
    it('should get wallet for user (created automatically)', async () => {
      // Wallet should be created automatically when user is created
      return request(app.getHttpServer())
        .get(`/wallets/user/${testUserId}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as WalletResponseDto;
          expect(body).toHaveProperty('id');
          expect(body.userId).toBe(testUserId);
          expect(body.balance).toBe(0);
        });
    });

    it('should return 404 when user has no wallet', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'nowallet@example.com',
          firstName: 'No',
          lastName: 'Wallet',
        },
      });

      // Delete wallet if it was auto-created
      await prisma.wallet.deleteMany({ where: { userId: user.id } });

      return request(app.getHttpServer())
        .get(`/wallets/user/${user.id}`)
        .expect(404);
    });
  });

  describe('GET /wallets/user/:userId/balance', () => {
    it('should get wallet balance', () => {
      return request(app.getHttpServer())
        .get(`/wallets/user/${testUserId}/balance`)
        .expect(200)
        .expect((res) => {
          const body = res.body as BalanceResponseDto;
          expect(body).toHaveProperty('balance');
          expect(typeof body.balance).toBe('number');
        });
    });
  });

  describe('Wallet balance updates with transactions', () => {
    it('should update balance after deposit transaction', async () => {
      // Create user through API to ensure wallet is created
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'deposit-test@example.com',
          firstName: 'Deposit',
          lastName: 'Test',
        })
        .expect(201);
      const user = userResponse.body as UserResponseDto;

      // Create a deposit transaction
      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          userId: user.id,
          type: 'DEPOSIT',
          amount: 1000.0,
          date: new Date().toISOString(),
          description: 'Initial deposit',
        })
        .expect(201);

      // Check wallet balance
      const balanceResponse = await request(app.getHttpServer())
        .get(`/wallets/user/${user.id}/balance`)
        .expect(200);

      const balanceBody = balanceResponse.body as BalanceResponseDto;
      expect(balanceBody.balance).toBe(1000.0);
    });

    it('should update balance after withdrawal transaction', async () => {
      // Create user through API to ensure wallet is created
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'withdrawal-test@example.com',
          firstName: 'Withdrawal',
          lastName: 'Test',
        })
        .expect(201);
      const user = userResponse.body as UserResponseDto;

      // First deposit
      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          userId: user.id,
          type: 'DEPOSIT',
          amount: 2000.0,
          date: new Date().toISOString(),
        })
        .expect(201);

      // Then withdraw
      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          userId: user.id,
          type: 'WITHDRAWAL',
          amount: 500.0,
          date: new Date().toISOString(),
        })
        .expect(201);

      // Check wallet balance
      const balanceResponse = await request(app.getHttpServer())
        .get(`/wallets/user/${user.id}/balance`)
        .expect(200);

      const balanceBody = balanceResponse.body as BalanceResponseDto;
      expect(balanceBody.balance).toBe(1500.0);
    });
  });
});
