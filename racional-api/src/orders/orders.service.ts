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

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const total = createOrderDto.quantity * createOrderDto.unitPrice;

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

        const currentBalance = Number(wallet.balance);
        if (currentBalance < total) {
          this.logger.warn(
            `Insufficient balance for buy order. User: ${createOrderDto.userId}, Balance: ${currentBalance}, Required: ${total}`,
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

        if (!holding || holding.quantity < createOrderDto.quantity) {
          this.logger.warn(
            `Insufficient stock quantity for sell order. User: ${createOrderDto.userId}, Stock: ${createOrderDto.stockId}, Quantity: ${createOrderDto.quantity}`,
          );
          throw new BadRequestException('Insufficient stock quantity');
        }
      }

      const orderRecord = await tx.order.create({
        data: {
          userId: createOrderDto.userId,
          stockId: createOrderDto.stockId,
          type: createOrderDto.type,
          quantity: createOrderDto.quantity,
          unitPrice: createOrderDto.unitPrice,
          total: total,
          status: OrderStatus.EXECUTED,
          executedAt: new Date(),
        },
      });

      if (createOrderDto.type === OrderType.BUY) {
        await tx.wallet.update({
          where: { userId: createOrderDto.userId },
          data: {
            balance: {
              decrement: total,
            },
          },
        });

        await this.updatePortfolioHolding(
          tx,
          portfolio.id,
          createOrderDto.stockId,
          createOrderDto.quantity,
          createOrderDto.unitPrice,
          true,
        );
      } else if (createOrderDto.type === OrderType.SELL) {
        await tx.wallet.update({
          where: { userId: createOrderDto.userId },
          data: {
            balance: {
              increment: total,
            },
          },
        });

        await this.updatePortfolioHolding(
          tx,
          portfolio.id,
          createOrderDto.stockId,
          createOrderDto.quantity,
          createOrderDto.unitPrice,
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
    unitPrice: number,
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
        const currentTotal =
          Number(existingHolding.averageBuyPrice) * existingHolding.quantity;
        const newTotal = unitPrice * quantity;
        const newQuantity = existingHolding.quantity + quantity;
        const newAveragePrice = (currentTotal + newTotal) / newQuantity;

        await tx.portfolioHolding.update({
          where: {
            portfolioId_stockId: {
              portfolioId: portfolioId,
              stockId: stockId,
            },
          },
          data: {
            quantity: newQuantity,
            averageBuyPrice: newAveragePrice,
          },
        });
      } else {
        await tx.portfolioHolding.create({
          data: {
            portfolioId: portfolioId,
            stockId: stockId,
            quantity: quantity,
            averageBuyPrice: unitPrice,
          },
        });
      }
    } else {
      if (!existingHolding || existingHolding.quantity < quantity) {
        throw new BadRequestException('Insufficient stock quantity');
      }

      const newQuantity = existingHolding.quantity - quantity;

      if (newQuantity === 0) {
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
            quantity: newQuantity,
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
      quantity: order.quantity,
      unitPrice: Number(order.unitPrice),
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt,
      executedAt: order.executedAt,
    };
  }
}
