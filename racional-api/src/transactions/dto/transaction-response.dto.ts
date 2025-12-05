import { TransactionType } from '@prisma/client';

export class TransactionResponseDto {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  date: Date;
  description: string | null;
  createdAt: Date;
}
