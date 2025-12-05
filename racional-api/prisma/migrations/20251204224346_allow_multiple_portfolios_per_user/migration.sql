-- DropIndex
DROP INDEX "portfolios_userId_key";

-- CreateIndex
CREATE INDEX "portfolios_userId_idx" ON "portfolios"("userId");
