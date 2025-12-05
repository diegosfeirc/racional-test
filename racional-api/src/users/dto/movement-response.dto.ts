import { TransactionType, OrderType } from '@prisma/client';

export type MovementType = 'TRANSACTION' | 'ORDER';

export class MovementResponseDto {
  id: string;
  type: MovementType;
  date: Date;
  description: string | null;
  amount?: number;
  transactionType?: TransactionType;
  orderType?: OrderType;
  stockSymbol?: string;
  stockName?: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
}

