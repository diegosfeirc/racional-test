import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { PortfolioResponseDto } from '../../src/portfolios/dto/portfolio-response.dto';
import { UserResponseDto } from '../../src/users/dto/user-response.dto';

describe('Portfolios (e2e)', () => {
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
        email: 'portfolio-test@example.com',
        firstName: 'Portfolio',
        lastName: 'Test',
      })
      .expect(201);
    testUserId = (userResponse.body as UserResponseDto).id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.portfolioHolding.deleteMany({});
    await prisma.portfolio.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /portfolios', () => {
    it('should create a new portfolio', () => {
      return request(app.getHttpServer())
        .post('/portfolios')
        .send({
          userId: testUserId,
          name: 'My Portfolio',
          description: 'Test portfolio',
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as PortfolioResponseDto;
          expect(body).toHaveProperty('id');
          expect(body.userId).toBe(testUserId);
          expect(body.name).toBe('My Portfolio');
        });
    });

    it('should return 409 when portfolio name already exists for user', async () => {
      await request(app.getHttpServer())
        .post('/portfolios')
        .send({
          userId: testUserId,
          name: 'Duplicate Portfolio',
          description: 'First',
        })
        .expect(201);

      return request(app.getHttpServer())
        .post('/portfolios')
        .send({
          userId: testUserId,
          name: 'Duplicate Portfolio',
          description: 'Second',
        })
        .expect(409);
    });

    it('should return 404 when user not found', () => {
      return request(app.getHttpServer())
        .post('/portfolios')
        .send({
          userId: 'non-existent-user-id',
          name: 'Test Portfolio',
        })
        .expect(404);
    });
  });

  describe('GET /portfolios/user/:userId', () => {
    it('should get all portfolios for a user', async () => {
      // Create a new user for this test to ensure it exists
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `portfolio-list-${Date.now()}@example.com`,
          firstName: 'Portfolio',
          lastName: 'List',
        })
        .expect(201);
      const userId = (userResponse.body as UserResponseDto).id;

      // Verify user exists before creating portfolio
      await request(app.getHttpServer()).get(`/users/${userId}`).expect(200);

      // Create a portfolio
      await request(app.getHttpServer())
        .post('/portfolios')
        .send({
          userId: userId,
          name: `Portfolio List Test ${Date.now()}`,
        })
        .expect(201);

      return request(app.getHttpServer())
        .get(`/portfolios/user/${userId}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as PortfolioResponseDto[];
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /portfolios/:id', () => {
    it('should get a portfolio by id', async () => {
      // Create a new user for this test to ensure it exists
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `portfolio-get-${Date.now()}@example.com`,
          firstName: 'Portfolio',
          lastName: 'Get',
        })
        .expect(201);
      const userId = (userResponse.body as UserResponseDto).id;

      // Verify user exists before creating portfolio
      await request(app.getHttpServer()).get(`/users/${userId}`).expect(200);

      const createResponse = await request(app.getHttpServer())
        .post('/portfolios')
        .send({
          userId: userId,
          name: `Get Portfolio Test ${Date.now()}`,
        })
        .expect(201);

      const portfolioId = (createResponse.body as PortfolioResponseDto).id;

      return request(app.getHttpServer())
        .get(`/portfolios/${portfolioId}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as PortfolioResponseDto;
          expect(body.id).toBe(portfolioId);
          expect(body.userId).toBe(userId);
        });
    });
  });

  describe('PATCH /portfolios/:id', () => {
    it('should update a portfolio', async () => {
      // Create a new user for this test to ensure it exists
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `portfolio-update-${Date.now()}@example.com`,
          firstName: 'Portfolio',
          lastName: 'Update',
        })
        .expect(201);
      const userId = (userResponse.body as UserResponseDto).id;

      // Verify user exists before creating portfolio
      await request(app.getHttpServer()).get(`/users/${userId}`).expect(200);

      const createResponse = await request(app.getHttpServer())
        .post('/portfolios')
        .send({
          userId: userId,
          name: `Update Portfolio Test ${Date.now()}`,
        })
        .expect(201);

      const portfolioId = (createResponse.body as PortfolioResponseDto).id;

      return request(app.getHttpServer())
        .patch(`/portfolios/${portfolioId}`)
        .send({
          description: 'Updated description',
        })
        .expect(200)
        .expect((res) => {
          const body = res.body as PortfolioResponseDto;
          expect(body.description).toBe('Updated description');
        });
    });
  });
});
