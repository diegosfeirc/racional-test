import { OrderType, OrderStatus, Prisma } from '@prisma/client';
import { Stock } from '@prisma/client';

export interface OrderEntity {
  id: string;
  userId: string;
  stockId: string;
  type: OrderType;
  quantity: number | Prisma.Decimal;
  unitPrice: bigint | Prisma.Decimal;
  total: bigint | Prisma.Decimal;
  status: OrderStatus;
  createdAt: Date;
  executedAt: Date | null;
}

export interface OrderWithStock extends OrderEntity {
  stock: Stock;
}

export type OrderWithRelations = OrderWithStock;
