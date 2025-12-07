import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserResponseDto } from '../../src/users/dto/user-response.dto';
import { MovementResponseDto } from '../../src/users/dto/movement-response.dto';

describe('Users (e2e)', () => {
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
    await prisma.wallet.deleteMany({});
    await prisma.portfolio.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as UserResponseDto;
          expect(body).toHaveProperty('id');
          expect(body.email).toBe('test@example.com');
          expect(body.firstName).toBe('John');
          expect(body.lastName).toBe('Doe');
        });
    });

    it('should return 409 when email already exists', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'duplicate@example.com',
          firstName: 'First',
          lastName: 'User',
        })
        .expect(201);

      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'duplicate@example.com',
          firstName: 'Second',
          lastName: 'User',
        })
        .expect(409);
    });

    it('should return 400 when data is invalid', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'invalid-email',
          firstName: '',
          lastName: 'Doe',
        })
        .expect(400);
    });
  });

  describe('GET /users/:id', () => {
    it('should get a user by id', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'getuser@example.com',
          firstName: 'Get',
          lastName: 'User',
        })
        .expect(201);

      const userId = (createResponse.body as UserResponseDto).id;

      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as UserResponseDto;
          expect(body.id).toBe(userId);
          expect(body.email).toBe('getuser@example.com');
        });
    });

    it('should return 404 when user not found', () => {
      return request(app.getHttpServer())
        .get('/users/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const uniqueEmail = `update-${Date.now()}@example.com`;
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: uniqueEmail,
          firstName: 'Original',
          lastName: 'Name',
        })
        .expect(201);

      const userId = (createResponse.body as UserResponseDto).id;

      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        })
        .expect(200)
        .expect((res) => {
          const body = res.body as UserResponseDto;
          expect(body.firstName).toBe('Updated');
          expect(body.email).toBe(uniqueEmail);
        });
    });
  });

  describe('GET /users/:id/movements', () => {
    it('should get user movements', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `movements-${Date.now()}@example.com`,
          firstName: 'Movements',
          lastName: 'User',
        })
        .expect(201);

      const userId = (createResponse.body as UserResponseDto).id;

      return request(app.getHttpServer())
        .get(`/users/${userId}/movements`)
        .expect(200)
        .expect((res) => {
          const body = res.body as MovementResponseDto[];
          expect(Array.isArray(body)).toBe(true);
        });
    });
  });
});
