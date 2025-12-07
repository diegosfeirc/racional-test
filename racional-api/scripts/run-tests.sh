#!/bin/sh

set -e

echo "Running Prisma migrations for test database..."
# DATABASE_URL should be set in environment
npx prisma migrate deploy

echo "Running integration tests..."
# Ensure DATABASE_URL is available for tests
npm run test:e2e

echo "Tests completed"

