import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionType } from '@prisma/client';
import { TransactionEntity } from '../common/types/transaction.types';
import { dollarsToCents, centsToDollars } from '../common/utils/currency.utils';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: createTransactionDto.userId },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${createTransactionDto.userId} not found`,
        );
      }

      const amountInCents = dollarsToCents(createTransactionDto.amount);

      if (createTransactionDto.type === TransactionType.WITHDRAWAL) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: createTransactionDto.userId },
        });

        if (!wallet) {
          throw new NotFoundException(
            `Wallet for user with ID ${createTransactionDto.userId} not found`,
          );
        }

        const currentBalance = centsToDollars(Number(wallet.balance));
        if (currentBalance < createTransactionDto.amount) {
          this.logger.warn(
            `Insufficient balance for user ${createTransactionDto.userId}. Balance: ${currentBalance}, Requested: ${createTransactionDto.amount}`,
          );
          throw new BadRequestException('Insufficient balance');
        }
      }

      const transactionRecord = await tx.transaction.create({
        data: {
          userId: createTransactionDto.userId,
          type: createTransactionDto.type,
          amount: Number(amountInCents),
          date: new Date(createTransactionDto.date),
          ...(createTransactionDto.description && {
            description: createTransactionDto.description,
          }),
        },
      });

      if (createTransactionDto.type === TransactionType.DEPOSIT) {
        await tx.wallet.update({
          where: { userId: createTransactionDto.userId },
          data: {
            balance: {
              increment: Number(amountInCents),
            },
          },
        });
      } else if (createTransactionDto.type === TransactionType.WITHDRAWAL) {
        await tx.wallet.update({
          where: { userId: createTransactionDto.userId },
          data: {
            balance: {
              decrement: Number(amountInCents),
            },
          },
        });
      }

      return transactionRecord;
    });

    this.logger.log(
      `Transaction created: ${transaction.id} (${transaction.type}) for user ${createTransactionDto.userId}`,
    );
    return this.mapToResponseDto(transaction);
  }

  async findByUserId(userId: string): Promise<TransactionResponseDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return transactions.map((transaction) =>
      this.mapToResponseDto(transaction),
    );
  }

  async findOne(id: string): Promise<TransactionResponseDto> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return this.mapToResponseDto(transaction);
  }

  private mapToResponseDto(
    transaction: TransactionEntity,
  ): TransactionResponseDto {
    return {
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      amount: centsToDollars(Number(transaction.amount)),
      date: transaction.date,
      description: transaction.description,
      createdAt: transaction.createdAt,
    };
  }
}
