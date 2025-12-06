import { Prisma, TransactionType } from '@prisma/client';

export interface TransactionEntity {
  id: string;
  userId: string;
  type: TransactionType;
  amount: Prisma.Decimal;
  date: Date;
  description: string | null;
  createdAt: Date;
}
