FROM node:22-bookworm-slim AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN pnpm install --frozen-lockfile --filter @hajjmed/api...
COPY apps/api apps/api
COPY packages/contracts packages/contracts
RUN pnpm --filter @hajjmed/contracts build \
 && pnpm --filter @hajjmed/api build

FROM node:22-bookworm-slim AS runtime
RUN corepack enable && apt-get update && apt-get install -y --no-install-recommends curl openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/packages/contracts ./packages/contracts
EXPOSE 4000
CMD ["node","apps/api/dist/src/server.js"]
