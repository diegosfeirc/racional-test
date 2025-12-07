-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(18,8) USING "quantity"::DECIMAL(18,8);

-- AlterTable
ALTER TABLE "portfolio_holdings" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(18,8) USING "quantity"::DECIMAL(18,8);
