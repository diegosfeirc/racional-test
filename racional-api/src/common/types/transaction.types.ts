import { TransactionType, Prisma } from '@prisma/client';

export interface TransactionEntity {
  id: string;
  userId: string;
  type: TransactionType;
  amount: bigint | Prisma.Decimal;
  date: Date;
  description: string | null;
  createdAt: Date;
}
