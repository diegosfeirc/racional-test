# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# Generate Prisma Client (DATABASE_URL dummy needed for config, not used for generation)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
RUN npx prisma generate

# Copy configuration files needed for build
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Verify build output exists (NestJS outputs to dist/src/)
RUN ls -la dist/src/ && test -f dist/src/main.js || (echo "Build failed: dist/src/main.js not found" && exit 1)

# Stage 2: Runtime
FROM node:20-alpine AS runtime

WORKDIR /app

# Install dependencies needed for Prisma at runtime and PostgreSQL client for wait scripts
RUN apk add --no-cache openssl libc6-compat postgresql-client

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install only production dependencies
RUN npm ci --only=production

# Copy Prisma Client and generated files from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/generated ./generated

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Default command (can be overridden in docker-compose)
CMD ["node", "dist/src/main.js"]

# Stage 3: Test (includes dev dependencies for running tests)
FROM builder AS test

WORKDIR /app

# Install PostgreSQL client for wait scripts
RUN apk add --no-cache postgresql-client

# All dependencies (including dev) are already installed in builder stage
# Source code is already copied in builder stage
# Tests will be mounted as volume in docker-compose

