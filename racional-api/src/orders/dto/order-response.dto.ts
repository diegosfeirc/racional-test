import { OrderType, OrderStatus } from '@prisma/client';

export class OrderResponseDto {
  id: string;
  userId: string;
  stockId: string;
  type: OrderType;
  quantity: number;
  unitPrice: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  executedAt: Date | null;
}
