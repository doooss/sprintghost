FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/api/package.json ./services/api/
COPY packages/types/package.json ./packages/types/
COPY packages/config/typescript/package.json ./packages/config/typescript/
COPY packages/config/eslint/package.json ./packages/config/eslint/
COPY packages/config/prettier/package.json ./packages/config/prettier/

RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/api/node_modules ./services/api/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY . .

# Build types package first (dependency)
RUN pnpm build --filter=@repo/types

# Build API
RUN pnpm build --filter=api

# Deploy API with production dependencies (creates standalone node_modules)
RUN pnpm deploy --filter=api --prod /app/deploy

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy deployed app with production dependencies
COPY --from=builder /app/deploy ./

# Copy built dist
COPY --from=builder /app/services/api/dist ./dist

# Copy drizzle migrations
COPY --from=builder /app/services/api/drizzle ./drizzle

# Copy built @repo/types
COPY --from=builder /app/packages/types/dist ./node_modules/@repo/types/dist
COPY --from=builder /app/packages/types/package.json ./node_modules/@repo/types/

# Copy entrypoint script
COPY docker/entrypoint.sh /app/entrypoint.sh

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R nestjs:nodejs /app/data

USER nestjs

EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "dist/main.js"]
