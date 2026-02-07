FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/typescript/package.json ./packages/config/typescript/
COPY packages/config/eslint/package.json ./packages/config/eslint/
COPY packages/config/prettier/package.json ./packages/config/prettier/
COPY packages/config/tailwind/package.json ./packages/config/tailwind/

RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

# Build-time environment variables for Next.js client-side
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy source code first
COPY . .

# Copy pnpm store and reinstall to preserve symlink structure
COPY --from=deps /root/.local/share/pnpm/store /root/.local/share/pnpm/store
RUN pnpm install --frozen-lockfile

RUN pnpm build --filter=web

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Create public directory and copy contents if they exist
RUN mkdir -p ./apps/web/public
COPY --from=builder /app/apps/web/public/. ./apps/web/public/

USER nextjs

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
