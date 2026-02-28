FROM oven/bun:1.2.19-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS install
RUN apk add --no-cache python3 make g++

COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/dashboard/package.json ./apps/dashboard/
COPY apps/docs/package.json ./apps/docs/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/
COPY packages/nextjs/package.json ./packages/nextjs/
COPY packages/backend/package.json ./packages/backend/
COPY packages/testing/package.json ./packages/testing/
COPY examples/nextjs-quickstart/package.json ./examples/nextjs-quickstart/
COPY examples/monite-sdk-parity/package.json ./examples/monite-sdk-parity/
COPY examples/vite-react-simple/package.json ./examples/vite-react-simple/
RUN bun install --frozen-lockfile --ignore-scripts

# Build shared packages first
FROM install AS build-shared
COPY packages/shared ./packages/shared
COPY packages/config ./packages/config
RUN bun run build --filter @blerp/shared

# Build dashboard
FROM build-shared AS build-dashboard
COPY apps/dashboard ./apps/dashboard
RUN bun run build --filter @blerp/dashboard

# Build API
FROM build-shared AS build-api
COPY apps/api ./apps/api
RUN bun run build --filter @blerp/api

# Final image
FROM base AS release
COPY --from=build-api /app/apps/api/dist ./apps/api/dist
COPY --from=build-api /app/apps/api/package.json ./apps/api/package.json
COPY --from=build-dashboard /app/apps/dashboard/dist ./apps/dashboard/dist
COPY --from=install /app/node_modules ./node_modules

# We need the shared package source if it is not bundled by tsc
COPY --from=build-shared /app/packages/shared ./packages/shared

EXPOSE 3000
WORKDIR /app/apps/api
CMD ["bun", "run", "start"]
