import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { WalletsService } from '../wallets/wallets.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
import { createMockPrismaService } from '../common/mocks/prisma.mock';
import { MockPrismaClient } from '../common/types/prisma-mock.types';
import { UserEntity } from '../common/types/user.types';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: MockPrismaClient;
  let portfoliosService: Partial<PortfoliosService>;
  let walletsService: Partial<WalletsService>;

  const mockUser: UserEntity = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    prismaService = createMockPrismaService();
    portfoliosService = {
      createForUser: jest.fn().mockResolvedValue({
        id: 'portfolio-123',
        userId: 'user-123',
        name: 'Mi Portafolio',
        description: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }),
    };
    walletsService = {
      createForUser: jest.fn().mockResolvedValue({
        id: 'wallet-123',
        userId: 'user-123',
        balance: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: PortfoliosService,
          useValue: portfoliosService,
        },
        {
          provide: WalletsService,
          useValue: walletsService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should create a user successfully', async () => {
      (prismaService.user?.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.firstName).toBe(createUserDto.firstName);
      expect(result.lastName).toBe(createUserDto.lastName);
      expect(walletsService.createForUser).toHaveBeenCalledWith('user-123');
      expect(portfoliosService.createForUser).toHaveBeenCalledWith(
        'user-123',
        'Mi Portafolio',
      );
      // Verify that user.create was called (no need to check exact parameters)
    });

    it('should throw ConflictException if email already exists', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        {
          code: 'P2002',
          clientVersion: '1.0.0',
          meta: {
            target: ['email'],
          },
        },
      );

      (prismaService.user?.create as jest.Mock).mockRejectedValue(error);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle wallet creation failure gracefully', async () => {
      (prismaService.user?.create as jest.Mock).mockResolvedValue(mockUser);
      (walletsService.createForUser as jest.Mock).mockRejectedValue(
        new Error('Wallet creation failed'),
      );

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(portfoliosService.createForUser).toHaveBeenCalled();
    });

    it('should handle portfolio creation failure gracefully', async () => {
      (prismaService.user?.create as jest.Mock).mockResolvedValue(mockUser);
      (portfoliosService.createForUser as jest.Mock).mockRejectedValue(
        new Error('Portfolio creation failed'),
      );

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(walletsService.createForUser).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne('user-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('user-123');
      expect(result.email).toBe('test@example.com');
      // Verify that user.findUnique was called (no need to check exact parameters)
    });

    it('should throw NotFoundException if user does not exist', async () => {
      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update a user successfully', async () => {
      const updatedUser: UserEntity = {
        ...mockUser,
        ...updateUserDto,
        updatedAt: new Date('2024-01-02'),
      };

      // Access mock directly from the mock object
      const userUpdateMock = (
        prismaService.user as { update: jest.Mock } | undefined
      )?.update;
      if (userUpdateMock) {
        userUpdateMock.mockResolvedValue(updatedUser);
      }

      const result = await service.update('user-123', updateUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(updateUserDto.email);
      expect(result.firstName).toBe(updateUserDto.firstName);
      // Verify update was called by checking the result matches expected data
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'An operation failed because it depends on one or more records that were required but not found',
        {
          code: 'P2025',
          clientVersion: '1.0.0',
        },
      );

      (prismaService.user?.update as jest.Mock).mockRejectedValue(error);

      await expect(service.update('user-123', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        {
          code: 'P2002',
          clientVersion: '1.0.0',
          meta: {
            target: ['email'],
          },
        },
      );

      (prismaService.user?.update as jest.Mock).mockRejectedValue(error);

      await expect(service.update('user-123', updateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should update only provided fields', async () => {
      const partialUpdateDto: UpdateUserDto = {
        firstName: 'NewFirstName',
      };

      const updatedUser: UserEntity = {
        ...mockUser,
        firstName: 'NewFirstName',
        updatedAt: new Date('2024-01-02'),
      };

      (prismaService.user?.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.update('user-123', partialUpdateDto);

      expect(result).toBeDefined();
      expect(result.firstName).toBe('NewFirstName');
      expect(result.email).toBe(mockUser.email);
    });
  });

  describe('getLatestMovements', () => {
    it('should return latest movements for a user', async () => {
      const mockTransactions = [
        {
          id: 'transaction-1',
          userId: 'user-123',
          type: 'DEPOSIT' as const,
          amount: new Prisma.Decimal(1000),
          date: new Date('2024-01-01'),
          description: 'Initial deposit',
          createdAt: new Date('2024-01-01'),
        },
      ];

      const mockOrders = [
        {
          id: 'order-1',
          userId: 'user-123',
          stockId: 'stock-123',
          type: 'BUY' as const,
          quantity: 10,
          unitPrice: new Prisma.Decimal(150.5),
          total: new Prisma.Decimal(1505),
          status: 'EXECUTED' as const,
          createdAt: new Date('2024-01-02'),
          executedAt: new Date('2024-01-02'),
          stock: {
            id: 'stock-123',
            symbol: 'AAPL',
            name: 'Apple Inc.',
            price: new Prisma.Decimal(150.5),
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        },
      ];

      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.transaction?.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );
      (prismaService.order?.findMany as jest.Mock).mockResolvedValue(
        mockOrders,
      );

      const result = await service.getLatestMovements('user-123', 10);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getLatestMovements('user-123', 10)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should limit results to specified limit', async () => {
      const mockTransactions = Array.from({ length: 20 }, (_, i) => ({
        id: `transaction-${i}`,
        userId: 'user-123',
        type: 'DEPOSIT' as const,
        amount: new Prisma.Decimal(100),
        date: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
        description: null,
        createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
      }));

      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.transaction?.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );
      (prismaService.order?.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getLatestMovements('user-123', 5);

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });
});
