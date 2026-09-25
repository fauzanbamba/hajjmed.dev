# Simplified Dockerfile - Full installation in runtime
FROM node:22-alpine

RUN corepack enable && apk add --no-cache curl tini
ENV NODE_ENV=development
WORKDIR /app

# Copy all source files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api ./apps/api
COPY packages/contracts ./packages/contracts

# Install all dependencies and build
RUN pnpm install && \
    pnpm --filter @hajjmed/contracts build && \
    pnpm --filter @hajjmed/api build

# Remove dev dependencies
RUN pnpm prune --prod

EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -fsS http://localhost:4000/health/ready || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/api/dist/src/server.js"]
