-- AlterTable
ALTER TABLE "stocks" ALTER COLUMN "price" SET DATA TYPE BIGINT USING "price"::BIGINT;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "amount" SET DATA TYPE BIGINT USING "amount"::BIGINT;

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "unitPrice" SET DATA TYPE BIGINT USING "unitPrice"::BIGINT,
ALTER COLUMN "total" SET DATA TYPE BIGINT USING "total"::BIGINT;

-- AlterTable
ALTER TABLE "portfolio_holdings" ALTER COLUMN "averageBuyPrice" SET DATA TYPE BIGINT USING "averageBuyPrice"::BIGINT;

-- AlterTable
ALTER TABLE "wallets" ALTER COLUMN "balance" SET DATA TYPE BIGINT USING "balance"::BIGINT;

