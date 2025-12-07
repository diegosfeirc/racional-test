#!/bin/sh

set -e

echo "Running Prisma migrations..."

# Use migrate deploy for production (applies pending migrations)
npx prisma migrate deploy

echo "Migrations completed successfully"

