import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createForUser(userId: string): Promise<WalletResponseDto> {
    try {
      const wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: 0,
        },
      });

      this.logger.log(`Wallet created for user: ${userId}`);
      return this.mapToResponseDto(wallet);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.warn(`Wallet already exists for user: ${userId}`);
          throw new BadRequestException('Wallet already exists for this user');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }
      }
      if (error instanceof Error) {
        this.logger.error('Error creating wallet', error.message);
        throw error;
      }
      this.logger.error('Error creating wallet', 'Unknown error');
      throw new Error('Failed to create wallet');
    }
  }

  async findByUserId(userId: string): Promise<WalletResponseDto> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException(
        `Wallet for user with ID ${userId} not found`,
      );
    }

    return this.mapToResponseDto(wallet);
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.findByUserId(userId);
    return wallet.balance;
  }

  async hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance >= amount;
  }

  async deposit(userId: string, amount: number): Promise<WalletResponseDto> {
    if (amount <= 0) {
      throw new BadRequestException('Deposit amount must be greater than 0');
    }

    try {
      const wallet = await this.prisma.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      this.logger.log(
        `Deposit of ${amount} made to wallet ${wallet.id} for user ${userId}`,
      );
      return this.mapToResponseDto(wallet);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Wallet for user with ID ${userId} not found`,
          );
        }
      }
      if (error instanceof Error) {
        this.logger.error('Error depositing to wallet', error.message);
        throw error;
      }
      this.logger.error('Error depositing to wallet', 'Unknown error');
      throw new Error('Failed to deposit to wallet');
    }
  }

  async withdraw(userId: string, amount: number): Promise<WalletResponseDto> {
    if (amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be greater than 0');
    }

    try {
      const wallet = await this.prisma.$transaction(async (tx) => {
        const walletRecord = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!walletRecord) {
          throw new NotFoundException(
            `Wallet for user with ID ${userId} not found`,
          );
        }

        const currentBalance = Number(walletRecord.balance);
        if (currentBalance < amount) {
          this.logger.warn(
            `Insufficient balance for user ${userId}. Balance: ${currentBalance}, Requested: ${amount}`,
          );
          throw new BadRequestException('Insufficient balance');
        }

        const updatedWallet = await tx.wallet.update({
          where: { userId },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });

        return updatedWallet;
      });

      this.logger.log(
        `Withdrawal of ${amount} made from wallet ${wallet.id} for user ${userId}`,
      );
      return this.mapToResponseDto(wallet);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Wallet for user with ID ${userId} not found`,
          );
        }
      }
      if (error instanceof Error) {
        this.logger.error('Error withdrawing from wallet', error.message);
        throw error;
      }
      this.logger.error('Error withdrawing from wallet', 'Unknown error');
      throw new Error('Failed to withdraw from wallet');
    }
  }

  private mapToResponseDto(wallet: {
    id: string;
    userId: string;
    balance: Prisma.Decimal;
    createdAt: Date;
    updatedAt: Date;
  }): WalletResponseDto {
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: Number(wallet.balance),
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }
}
