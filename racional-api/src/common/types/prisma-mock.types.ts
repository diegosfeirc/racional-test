import { PrismaClient } from '@prisma/client';

export type MockPrismaClient = Partial<
  Pick<
    PrismaClient,
    | 'user'
    | 'stock'
    | 'portfolio'
    | 'transaction'
    | 'order'
    | 'wallet'
    | 'portfolioHolding'
    | '$transaction'
  >
>;

export interface MockTransactionClient {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    findMany: jest.Mock;
  };
  stock: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    findMany: jest.Mock;
  };
  portfolio: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    findMany: jest.Mock;
  };
  transaction: {
    findUnique: jest.Mock;
    create: jest.Mock;
    findMany: jest.Mock;
  };
  order: {
    findUnique: jest.Mock;
    create: jest.Mock;
    findMany: jest.Mock;
  };
  wallet: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  portfolioHolding: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
}

export type PrismaTransactionCallback<T> = (
  tx: MockTransactionClient,
) => Promise<T>;
