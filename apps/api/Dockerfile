# Stage 1: Install dependencies and build
FROM oven/bun:1.3.10 AS builder
WORKDIR /app

# Copy root workspace definition and lockfile
COPY package.json bun.lock turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies and generate database client
RUN bun install --frozen-lockfile --production && bun run db:generate

# Build the api application
RUN bun --filter=@workspace/api run build

# Stage 2: Production image
FROM oven/bun:1.3.10-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy production node_modules and build output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./

EXPOSE 3030

# Use exec form for CMD
CMD ["bun", "dist/index.js"]
