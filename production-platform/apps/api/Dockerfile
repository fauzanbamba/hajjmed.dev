# Builder: install dependencies and compile TypeScript
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app

# Copy workspace and package definitions only (maximize layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/contracts/package.json packages/contracts/

# Install dependencies with frozen lockfile
RUN pnpm install --filter @hajjmed/api...

# Copy source code
COPY apps/api/src apps/api/src
COPY apps/api/tsconfig.json apps/api/
COPY packages/contracts/src packages/contracts/src
COPY packages/contracts/tsconfig.json packages/contracts/

# Build contracts and API
RUN pnpm --filter @hajjmed/contracts build && \
    pnpm --filter @hajjmed/api build

# Runtime: minimal production image
FROM node:22-alpine
RUN corepack enable && apk add --no-cache curl tini
ENV NODE_ENV=production
WORKDIR /app

# Copy runtime dependencies only (not dev dependencies)
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile --filter @hajjmed/api...

# Copy built artifacts from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /app/packages/contracts/package.json ./packages/contracts/

EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -fsS http://localhost:4000/health/ready || exit 1

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/api/dist/src/server.js"]
