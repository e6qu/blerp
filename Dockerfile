FROM oven/bun:1.2.19-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/dashboard/package.json ./apps/dashboard/
COPY apps/docs/package.json ./apps/docs/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/
COPY packages/nextjs/package.json ./packages/nextjs/
COPY examples/nextjs-quickstart/package.json ./examples/nextjs-quickstart/
COPY examples/vite-react-simple/package.json ./examples/vite-react-simple/
RUN bun install --frozen-lockfile

# Build dashboard
FROM install AS build-dashboard
COPY packages/shared ./packages/shared
COPY packages/config ./packages/config
COPY apps/dashboard ./apps/dashboard
RUN bun run build --filter @blerp/dashboard

# Build API
FROM install AS build-api
COPY packages/shared ./packages/shared
COPY packages/config ./packages/config
COPY apps/api ./apps/api
RUN bun run build --filter @blerp/api

# Final image
FROM base AS release
COPY --from=build-api /app/apps/api/dist ./apps/api/dist
COPY --from=build-api /app/apps/api/package.json ./apps/api/package.json
COPY --from=build-dashboard /app/apps/dashboard/dist ./apps/dashboard/dist
COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/apps/api/node_modules ./apps/api/node_modules

# We need the shared package as well if it s not bundled
COPY --from=install /app/packages/shared ./packages/shared

EXPOSE 3000
WORKDIR /app/apps/api
CMD ["bun", "run", "start"]
