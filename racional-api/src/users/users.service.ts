import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { WalletsService } from '../wallets/wallets.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { MovementResponseDto, MovementType } from './dto/movement-response.dto';
import { Prisma } from '@prisma/client';
import { UserEntity } from '../common/types/user.types';
import { centsToDollars } from '../common/utils/currency.utils';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly portfoliosService: PortfoliosService,
    private readonly walletsService: WalletsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
        },
      });

      try {
        await this.walletsService.createForUser(user.id);
        this.logger.log(`Wallet created automatically for user: ${user.id}`);
      } catch (walletError) {
        this.logger.error(
          `Failed to create wallet for user ${user.id}`,
          walletError instanceof Error ? walletError.message : 'Unknown error',
        );
      }

      try {
        await this.portfoliosService.createForUser(user.id, 'Mi Portafolio');
        this.logger.log(`Portfolio created automatically for user: ${user.id}`);
      } catch (portfolioError) {
        this.logger.error(
          `Failed to create portfolio for user ${user.id}`,
          portfolioError instanceof Error
            ? portfolioError.message
            : 'Unknown error',
        );
      }

      this.logger.log(`User created: ${user.id}`);
      return this.mapToResponseDto(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.warn(`Email already exists: ${createUserDto.email}`);
          throw new ConflictException('Email already exists');
        }
      }
      if (error instanceof Error) {
        this.logger.error('Error creating user', error.message);
        throw error;
      }
      this.logger.error('Error creating user', 'Unknown error');
      throw new Error('Failed to create user');
    }
  }

  async findAll(limit: number = 10): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return users.map((user) => this.mapToResponseDto(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapToResponseDto(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(updateUserDto.email && { email: updateUserDto.email }),
          ...(updateUserDto.firstName && {
            firstName: updateUserDto.firstName,
          }),
          ...(updateUserDto.lastName && { lastName: updateUserDto.lastName }),
        },
      });

      this.logger.log(`User updated: ${id}`);
      return this.mapToResponseDto(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
        if (error.code === 'P2002') {
          this.logger.warn(
            `Email already exists: ${updateUserDto.email ?? 'unknown'}`,
          );
          throw new ConflictException('Email already exists');
        }
      }
      if (error instanceof Error) {
        this.logger.error('Error updating user', error.message);
        throw error;
      }
      this.logger.error('Error updating user', 'Unknown error');
      throw new Error('Failed to update user');
    }
  }

  async getLatestMovements(
    userId: string,
    limit: number = 10,
  ): Promise<MovementResponseDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });

    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        stock: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const transactionMovements: MovementResponseDto[] = transactions.map(
      (transaction) => ({
        id: transaction.id,
        type: MovementType.TRANSACTION,
        date: transaction.date,
        description: transaction.description,
        amount: centsToDollars(Number(transaction.amount)),
        transactionType: transaction.type,
      }),
    );

    const orderMovements: MovementResponseDto[] = orders.map((order) => ({
      id: order.id,
      type: MovementType.ORDER,
      date: order.executedAt ?? order.createdAt,
      description: null,
      orderType: order.type,
      stockSymbol: order.stock.symbol,
      stockName: order.stock.name,
      quantity: order.quantity,
      unitPrice: centsToDollars(Number(order.unitPrice)),
      total: centsToDollars(Number(order.total)),
    }));

    const allMovements = [...transactionMovements, ...orderMovements].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );

    return allMovements.slice(0, limit);
  }

  private mapToResponseDto(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
