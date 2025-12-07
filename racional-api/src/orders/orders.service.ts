import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { Prisma, OrderType, OrderStatus } from '@prisma/client';
import { OrderEntity, OrderWithRelations } from '../common/types/order.types';
import { centsToDollars } from '../common/utils/currency.utils';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: createOrderDto.userId },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${createOrderDto.userId} not found`,
        );
      }

      const stock = await tx.stock.findUnique({
        where: { id: createOrderDto.stockId },
      });

      if (!stock) {
        throw new NotFoundException(
          `Stock with ID ${createOrderDto.stockId} not found`,
        );
      }

      // Get market price and calculate quantity from amount
      // Convert stock.price to BigInt (it's stored as BigInt in DB)
      const stockPriceInCents: bigint =
        typeof stock.price === 'bigint'
          ? stock.price
          : BigInt(Number(stock.price));
      const stockPriceInDollars = centsToDollars(stockPriceInCents);

      // Calculate quantity (allow fractional shares)
      const quantity = createOrderDto.amount / stockPriceInDollars;

      // Validate minimum purchase (must be greater than 0)
      if (quantity <= 0) {
        throw new BadRequestException(
          `Amount ${createOrderDto.amount} must be greater than 0 to purchase shares at price ${stockPriceInDollars}`,
        );
      }

      // Calculate actual total (exact amount, no flooring)
      const unitPriceInCents = stockPriceInCents;
      // Convert quantity to number for multiplication, then back to BigInt for cents
      const totalInCents = BigInt(
        Math.round(quantity * Number(unitPriceInCents)),
      );
      const totalInDollars = centsToDollars(totalInCents);

      const portfolio = await tx.portfolio.findUnique({
        where: { id: createOrderDto.portfolioId },
      });

      if (!portfolio) {
        throw new NotFoundException(
          `Portfolio with ID ${createOrderDto.portfolioId} not found`,
        );
      }

      if (String(portfolio.userId) !== String(createOrderDto.userId)) {
        throw new BadRequestException(
          `Portfolio ${createOrderDto.portfolioId} does not belong to user ${createOrderDto.userId}`,
        );
      }

      if (createOrderDto.type === OrderType.BUY) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: createOrderDto.userId },
        });

        if (!wallet) {
          throw new NotFoundException(
            `Wallet for user with ID ${createOrderDto.userId} not found`,
          );
        }

        const currentBalance = centsToDollars(Number(wallet.balance));
        if (currentBalance < totalInDollars) {
          this.logger.warn(
            `Insufficient balance for buy order. User: ${createOrderDto.userId}, Balance: ${currentBalance}, Required: ${totalInDollars}`,
          );
          throw new BadRequestException('Insufficient balance');
        }
      } else if (createOrderDto.type === OrderType.SELL) {
        const holding = await tx.portfolioHolding.findUnique({
          where: {
            portfolioId_stockId: {
              portfolioId: portfolio.id,
              stockId: createOrderDto.stockId,
            },
          },
        });

        const availableQuantity = Number(holding?.quantity ?? 0);
        if (!holding || availableQuantity < quantity) {
          this.logger.warn(
            `Insufficient stock quantity for sell order. User: ${createOrderDto.userId}, Stock: ${createOrderDto.stockId}, Required: ${quantity}, Available: ${availableQuantity}`,
          );
          throw new BadRequestException('Insufficient stock quantity');
        }
      }

      const orderRecord = await tx.order.create({
        data: {
          userId: createOrderDto.userId,
          stockId: createOrderDto.stockId,
          type: createOrderDto.type,
          quantity: new Prisma.Decimal(quantity),
          unitPrice: Number(unitPriceInCents),
          total: Number(totalInCents),
          status: OrderStatus.EXECUTED,
          executedAt: new Date(),
        },
      });

      if (createOrderDto.type === OrderType.BUY) {
        await tx.wallet.update({
          where: { userId: createOrderDto.userId },
          data: {
            balance: {
              decrement: Number(totalInCents),
            },
          },
        });

        await this.updatePortfolioHolding(
          tx,
          portfolio.id,
          createOrderDto.stockId,
          quantity,
          unitPriceInCents,
          true,
        );
      } else if (createOrderDto.type === OrderType.SELL) {
        await tx.wallet.update({
          where: { userId: createOrderDto.userId },
          data: {
            balance: {
              increment: Number(totalInCents),
            },
          },
        });

        await this.updatePortfolioHolding(
          tx,
          portfolio.id,
          createOrderDto.stockId,
          quantity,
          unitPriceInCents,
          false,
        );
      }

      return orderRecord;
    });

    this.logger.log(
      `Order created and executed: ${order.id} (${order.type}) for user ${createOrderDto.userId}`,
    );
    return this.mapToResponseDto(order);
  }

  async findByUserId(userId: string): Promise<OrderResponseDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        stock: true,
      },
    });

    return orders.map((order) => this.mapToResponseDto(order));
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        stock: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.mapToResponseDto(order);
  }

  private async updatePortfolioHolding(
    tx: Prisma.TransactionClient,
    portfolioId: string,
    stockId: string,
    quantity: number,
    unitPriceInCents: bigint,
    isBuy: boolean,
  ): Promise<void> {
    const existingHolding = await tx.portfolioHolding.findUnique({
      where: {
        portfolioId_stockId: {
          portfolioId: portfolioId,
          stockId: stockId,
        },
      },
    });

    if (isBuy) {
      if (existingHolding) {
        // Convert existing holding quantity to number
        const existingQuantity = Number(existingHolding.quantity);
        const averagePriceInCents = Number(existingHolding.averageBuyPrice);

        // Calculate weighted average price
        const currentTotalInCents = averagePriceInCents * existingQuantity;
        const newTotalInCents = Number(unitPriceInCents) * quantity;
        const newQuantity = existingQuantity + quantity;
        const newAveragePriceInCents = Math.round(
          (currentTotalInCents + newTotalInCents) / newQuantity,
        );

        await tx.portfolioHolding.update({
          where: {
            portfolioId_stockId: {
              portfolioId: portfolioId,
              stockId: stockId,
            },
          },
          data: {
            quantity: new Prisma.Decimal(newQuantity),
            averageBuyPrice: newAveragePriceInCents,
          },
        });
      } else {
        await tx.portfolioHolding.create({
          data: {
            portfolioId: portfolioId,
            stockId: stockId,
            quantity: new Prisma.Decimal(quantity),
            averageBuyPrice: Number(unitPriceInCents),
          },
        });
      }
    } else {
      const existingQuantity = Number(existingHolding?.quantity ?? 0);

      if (!existingHolding || existingQuantity < quantity) {
        throw new BadRequestException('Insufficient stock quantity');
      }

      const newQuantity = existingQuantity - quantity;

      if (newQuantity <= 0) {
        await tx.portfolioHolding.delete({
          where: {
            portfolioId_stockId: {
              portfolioId: portfolioId,
              stockId: stockId,
            },
          },
        });
      } else {
        await tx.portfolioHolding.update({
          where: {
            portfolioId_stockId: {
              portfolioId: portfolioId,
              stockId: stockId,
            },
          },
          data: {
            quantity: new Prisma.Decimal(newQuantity),
          },
        });
      }
    }
  }

  private mapToResponseDto(
    order: OrderEntity | OrderWithRelations,
  ): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      stockId: order.stockId,
      type: order.type,
      quantity: Number(order.quantity),
      unitPrice: centsToDollars(Number(order.unitPrice)),
      total: centsToDollars(Number(order.total)),
      status: order.status,
      createdAt: order.createdAt,
      executedAt: order.executedAt,
    };
  }
}
