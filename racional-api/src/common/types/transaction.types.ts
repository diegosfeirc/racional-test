import { TransactionType } from '@prisma/client';

export interface TransactionEntity {
  id: string;
  userId: string;
  type: TransactionType;
  amount: bigint;
  date: Date;
  description: string | null;
  createdAt: Date;
}
