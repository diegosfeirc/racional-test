#!/bin/sh

set -e

echo "Running Prisma seeds..."

# Execute seeds
npx prisma db seed

echo "Seeds completed successfully"

