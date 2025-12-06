import { Prisma } from '@prisma/client';

export interface PortfolioEntity {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioHoldingEntity {
  id: string;
  portfolioId: string;
  stockId: string;
  quantity: number;
  averageBuyPrice: Prisma.Decimal;
  updatedAt: Date;
}
