-- First, handle potential duplicate names by adding numeric suffixes
-- This ensures we can add the unique constraint safely
DO $$
DECLARE
  portfolio_record RECORD;
  counter INTEGER;
  new_name TEXT;
BEGIN
  FOR portfolio_record IN 
    SELECT id, "userId", name, ROW_NUMBER() OVER (PARTITION BY "userId", name ORDER BY "createdAt") as rn
    FROM portfolios
  LOOP
    IF portfolio_record.rn > 1 THEN
      counter := portfolio_record.rn - 1;
      new_name := portfolio_record.name || ' ' || counter::TEXT;
      
      -- Check if the new name already exists and increment counter if needed
      WHILE EXISTS (
        SELECT 1 FROM portfolios 
        WHERE "userId" = portfolio_record."userId" 
        AND name = new_name 
        AND id != portfolio_record.id
      ) LOOP
        counter := counter + 1;
        new_name := portfolio_record.name || ' ' || counter::TEXT;
      END LOOP;
      
      UPDATE portfolios SET name = new_name WHERE id = portfolio_record.id;
    END IF;
  END LOOP;
END $$;

-- Remove default value from name column
ALTER TABLE "portfolios" ALTER COLUMN "name" DROP DEFAULT;

-- Add unique constraint on (userId, name)
CREATE UNIQUE INDEX IF NOT EXISTS "portfolios_userId_name_key" ON "portfolios"("userId", "name");

