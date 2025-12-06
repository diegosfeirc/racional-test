import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderType, OrderStatus, Prisma } from '@prisma/client';
import { createMockPrismaService } from '../common/mocks/prisma.mock';
import {
  MockPrismaClient,
  MockTransactionClient,
} from '../common/types/prisma-mock.types';
import { OrderEntity } from '../common/types/order.types';
import { UserEntity } from '../common/types/user.types';
import { PortfolioEntity } from '../common/types/portfolio.types';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: MockPrismaClient;

  const mockUser: UserEntity = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockStock = {
    id: 'stock-123',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: new Prisma.Decimal(150.5),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPortfolio: PortfolioEntity = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'My Portfolio',
    description: 'Test portfolio',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockWallet = {
    id: 'wallet-123',
    userId: 'user-123',
    balance: new Prisma.Decimal(10000),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    prismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createOrderDto: CreateOrderDto = {
      userId: 'user-123',
      portfolioId: 'portfolio-123',
      stockId: 'stock-123',
      type: OrderType.BUY,
      quantity: 10,
      unitPrice: 150.5,
    };

    it('should create a buy order successfully', async () => {
      const mockOrder: OrderEntity = {
        id: 'order-123',
        userId: 'user-123',
        stockId: 'stock-123',
        type: OrderType.BUY,
        quantity: 10,
        unitPrice: new Prisma.Decimal(150.5),
        total: new Prisma.Decimal(1505),
        status: OrderStatus.EXECUTED,
        createdAt: new Date('2024-01-01'),
        executedAt: new Date('2024-01-01'),
      };

      const mockTransactionClient: MockTransactionClient = {
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        stock: {
          findUnique: jest.fn().mockResolvedValue(mockStock),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        portfolio: {
          findUnique: jest.fn().mockResolvedValue(mockPortfolio),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        transaction: {
          findUnique: jest.fn(),
          create: jest.fn(),
          findMany: jest.fn(),
        },
        wallet: {
          findUnique: jest.fn().mockResolvedValue(mockWallet),
          create: jest.fn(),
          update: jest.fn().mockResolvedValue({
            ...mockWallet,
            balance: new Prisma.Decimal(8495),
          }),
        },
        order: {
          findUnique: jest.fn(),
          create: jest.fn().mockResolvedValue(mockOrder),
          findMany: jest.fn(),
        },
        portfolioHolding: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({
            portfolioId: 'portfolio-123',
            stockId: 'stock-123',
            quantity: 10,
            averageBuyPrice: new Prisma.Decimal(150.5),
          }),
          update: jest.fn(),
          delete: jest.fn(),
        },
      };

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async <T>(
          callback: (tx: MockTransactionClient) => Promise<T>,
        ): Promise<T> => {
          return callback(mockTransactionClient);
        },
      );

      const result = await service.create(createOrderDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('order-123');
      expect(result.type).toBe(OrderType.BUY);
      expect(result.total).toBe(1505);
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(mockTransactionClient.wallet.update).toHaveBeenCalled();
      expect(mockTransactionClient.portfolioHolding.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const mockTransactionClient: MockTransactionClient = {
        user: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        stock: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        portfolio: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        wallet: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
        order: {
          findUnique: jest.fn(),
          create: jest.fn(),
          findMany: jest.fn(),
        },
        transaction: {
          findUnique: jest.fn(),
          create: jest.fn(),
          findMany: jest.fn(),
        },
        portfolioHolding: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      };

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async <T>(
          callback: (tx: MockTransactionClient) => Promise<T>,
        ): Promise<T> => {
          return callback(mockTransactionClient);
        },
      );

      await expect(service.create(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if insufficient balance', async () => {
      const poorWallet = {
        ...mockWallet,
        balance: new Prisma.Decimal(100),
      };

      const mockTransactionClient: MockTransactionClient = {
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        stock: {
          findUnique: jest.fn().mockResolvedValue(mockStock),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        portfolio: {
          findUnique: jest.fn().mockResolvedValue(mockPortfolio),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        wallet: {
          findUnique: jest.fn().mockResolvedValue(poorWallet),
          create: jest.fn(),
          update: jest.fn(),
        },
        order: {
          findUnique: jest.fn(),
          create: jest.fn(),
          findMany: jest.fn(),
        },
        transaction: {
          findUnique: jest.fn(),
          create: jest.fn(),
          findMany: jest.fn(),
        },
        portfolioHolding: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      };

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async <T>(
          callback: (tx: MockTransactionClient) => Promise<T>,
        ): Promise<T> => {
          return callback(mockTransactionClient);
        },
      );

      await expect(service.create(createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if portfolio does not belong to user', async () => {
      const wrongPortfolio: PortfolioEntity = {
        ...mockPortfolio,
        userId: 'user-456',
      };

      const mockTransactionClient: MockTransactionClient = {
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        stock: {
          findUnique: jest.fn().mockResolvedValue(mockStock),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        portfolio: {
          findUnique: jest.fn().mockResolvedValue(wrongPortfolio),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        wallet: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
        order: {
          findUnique: jest.fn(),
          create: jest.fn(),
          findMany: jest.fn(),
        },
        transaction: {
          findUnique: jest.fn(),
          create: jest.fn(),
          findMany: jest.fn(),
        },
        portfolioHolding: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      };

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async <T>(
          callback: (tx: MockTransactionClient) => Promise<T>,
        ): Promise<T> => {
          return callback(mockTransactionClient);
        },
      );

      await expect(service.create(createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return orders for a user', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          userId: 'user-123',
          stockId: 'stock-123',
          type: OrderType.BUY,
          quantity: 10,
          unitPrice: new Prisma.Decimal(150.5),
          total: new Prisma.Decimal(1505),
          status: OrderStatus.EXECUTED,
          createdAt: new Date('2024-01-01'),
          executedAt: new Date('2024-01-01'),
          stock: mockStock,
        },
      ];

      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.order?.findMany as jest.Mock).mockResolvedValue(
        mockOrders,
      );

      const result = await service.findByUserId('user-123');

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('order-1');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findByUserId('user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const mockOrder = {
        id: 'order-123',
        userId: 'user-123',
        stockId: 'stock-123',
        type: OrderType.BUY,
        quantity: 10,
        unitPrice: new Prisma.Decimal(150.5),
        total: new Prisma.Decimal(1505),
        status: OrderStatus.EXECUTED,
        createdAt: new Date('2024-01-01'),
        executedAt: new Date('2024-01-01'),
        stock: mockStock,
      };

      (prismaService.order?.findUnique as jest.Mock).mockResolvedValue(
        mockOrder,
      );

      const result = await service.findOne('order-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('order-123');
    });

    it('should throw NotFoundException if order does not exist', async () => {
      (prismaService.order?.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('order-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
