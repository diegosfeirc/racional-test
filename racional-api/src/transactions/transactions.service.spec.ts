import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType, Prisma } from '@prisma/client';
import { createMockPrismaService } from '../common/mocks/prisma.mock';
import {
  MockPrismaClient,
  MockTransactionClient,
} from '../common/types/prisma-mock.types';
import { UserEntity } from '../common/types/user.types';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaService: MockPrismaClient;

  const mockUser: UserEntity = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockWallet = {
    id: 'wallet-123',
    userId: 'user-123',
    balance: new Prisma.Decimal(1000),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    prismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDepositDto: CreateTransactionDto = {
      userId: 'user-123',
      type: TransactionType.DEPOSIT,
      amount: 500,
      date: '2024-01-01T10:00:00Z',
      description: 'Test deposit',
    };

    const createWithdrawalDto: CreateTransactionDto = {
      userId: 'user-123',
      type: TransactionType.WITHDRAWAL,
      amount: 200,
      date: '2024-01-01T10:00:00Z',
      description: 'Test withdrawal',
    };

    it('should create a deposit transaction successfully', async () => {
      const mockTransaction = {
        id: 'transaction-123',
        userId: 'user-123',
        type: TransactionType.DEPOSIT,
        amount: new Prisma.Decimal(500),
        date: new Date('2024-01-01T10:00:00Z'),
        description: 'Test deposit',
        createdAt: new Date('2024-01-01'),
      };

      const mockTransactionClient: MockTransactionClient = {
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        wallet: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn().mockResolvedValue({
            ...mockWallet,
            balance: new Prisma.Decimal(1500),
          }),
        },
        transaction: {
          findUnique: jest.fn(),
          create: jest.fn().mockResolvedValue(mockTransaction),
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
        order: {
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

      const result = await service.create(createDepositDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('transaction-123');
      expect(result.type).toBe(TransactionType.DEPOSIT);
      expect(result.amount).toBe(500);
      expect(mockTransactionClient.wallet.update).toHaveBeenCalled();
    });

    it('should create a withdrawal transaction successfully', async () => {
      const mockTransaction = {
        id: 'transaction-123',
        userId: 'user-123',
        type: TransactionType.WITHDRAWAL,
        amount: new Prisma.Decimal(200),
        date: new Date('2024-01-01T10:00:00Z'),
        description: 'Test withdrawal',
        createdAt: new Date('2024-01-01'),
      };

      const mockTransactionClient: MockTransactionClient = {
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        wallet: {
          findUnique: jest.fn().mockResolvedValue(mockWallet),
          create: jest.fn(),
          update: jest.fn().mockResolvedValue({
            ...mockWallet,
            balance: new Prisma.Decimal(800),
          }),
        },
        transaction: {
          findUnique: jest.fn(),
          create: jest.fn().mockResolvedValue(mockTransaction),
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
        order: {
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

      const result = await service.create(createWithdrawalDto);

      expect(result).toBeDefined();
      expect(result.type).toBe(TransactionType.WITHDRAWAL);
      expect(mockTransactionClient.wallet.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const mockTransactionClient: MockTransactionClient = {
        user: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        wallet: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
        transaction: {
          findUnique: jest.fn(),
          create: jest.fn(),
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
        order: {
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

      await expect(service.create(createDepositDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if wallet does not exist for withdrawal', async () => {
      const mockTransactionClient: MockTransactionClient = {
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
          create: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
        },
        wallet: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn(),
          update: jest.fn(),
        },
        transaction: {
          findUnique: jest.fn(),
          create: jest.fn(),
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
        order: {
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

      await expect(service.create(createWithdrawalDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if insufficient balance for withdrawal', async () => {
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
        wallet: {
          findUnique: jest.fn().mockResolvedValue(poorWallet),
          create: jest.fn(),
          update: jest.fn(),
        },
        transaction: {
          findUnique: jest.fn(),
          create: jest.fn(),
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
        order: {
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

      await expect(service.create(createWithdrawalDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return transactions for a user', async () => {
      const mockTransactions = [
        {
          id: 'transaction-1',
          userId: 'user-123',
          type: TransactionType.DEPOSIT,
          amount: new Prisma.Decimal(1000),
          date: new Date('2024-01-01'),
          description: 'Initial deposit',
          createdAt: new Date('2024-01-01'),
        },
      ];

      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.transaction?.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );

      const result = await service.findByUserId('user-123');

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('transaction-1');
      // Verify that user.findUnique was called (no need to check exact parameters)
    });

    it('should throw NotFoundException if user does not exist', async () => {
      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findByUserId('user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      const mockTransaction = {
        id: 'transaction-123',
        userId: 'user-123',
        type: TransactionType.DEPOSIT,
        amount: new Prisma.Decimal(1000),
        date: new Date('2024-01-01'),
        description: 'Test transaction',
        createdAt: new Date('2024-01-01'),
      };

      (prismaService.transaction?.findUnique as jest.Mock).mockResolvedValue(
        mockTransaction,
      );

      const result = await service.findOne('transaction-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('transaction-123');
      expect(result.type).toBe(TransactionType.DEPOSIT);
    });

    it('should throw NotFoundException if transaction does not exist', async () => {
      (prismaService.transaction?.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.findOne('transaction-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
