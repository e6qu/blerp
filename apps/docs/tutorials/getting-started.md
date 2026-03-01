# Getting Started with Blerp

This tutorial will guide you through setting up and running Blerp locally for development and testing.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Bun** v1.2.19 or higher - [Install Bun](https://bun.sh)
- **Git** - for cloning the repository
- **Docker** (optional) - for running with Docker Compose

## Installation

### 1. Clone the Repository

```bash
git clone git@github.com:e6qu/blerp.git
cd blerp
```

### 2. Install Dependencies

Blerp uses Bun as its package manager. Install all dependencies:

```bash
bun install
```

This will install dependencies for all packages in the monorepo.

### 3. Build the Project

Build all apps and packages:

```bash
bun run build
```

This compiles TypeScript and builds the frontend applications.

## Running Blerp

### Option 1: Development Mode (Recommended)

Run both the API and dashboard in development mode with hot reload:

```bash
bun run dev
```

This starts:

- **API Server** at `http://localhost:3000`
- **Dashboard** at `http://localhost:5173`
- **Redis** (if using Docker Compose)

### Option 2: Docker Compose

For a more production-like setup with Docker:

```bash
docker-compose up
```

This starts:

- API server
- Redis server
- Mailpit (email testing)

### Option 3: Individual Services

Run services separately for more control:

```bash
# Run only the API
bun run dev --filter @blerp/api

# Run only the dashboard
bun run dev --filter @blerp/dashboard
```

## Project Structure

Understanding the monorepo structure:

```
blerp/
├── apps/
│   ├── api/              # Express API server
│   ├── dashboard/        # React admin dashboard
│   └── docs/             # VitePress documentation
├── packages/
│   ├── shared/           # Shared types and utilities
│   ├── nextjs/           # Next.js SDK
│   ├── backend/          # Backend SDK
│   └── config/           # Shared configuration
├── openapi/              # OpenAPI specifications
└── examples/             # Example applications
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
PORT=3000
NODE_ENV=development

# Redis (if using)
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=3600

# Logging
LOG_LEVEL=debug
```

### Tenant Configuration

Blerp uses a multi-tenant architecture with SQLite databases. Each tenant has its own database file in the `apps/api/tenants/` directory.

## Verifying Your Setup

### 1. Check the API

Visit the OpenAPI documentation:

```bash
curl http://localhost:3000/v1/openapi.json
```

Or view the well-known configuration:

```bash
curl http://localhost:3000/.well-known/openid-configuration
```

### 2. Create Your First User

Create a signup attempt:

```bash
curl -X POST http://localhost:3000/v1/auth/signups \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: my-project" \
  -d '{
    "email": "user@example.com",
    "strategy": "password",
    "password": "SecurePassword123!"
  }'
```

### 3. Access the Dashboard

Open your browser to `http://localhost:5173` to access the admin dashboard.

## Common Commands

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `bun run dev`          | Run all apps in development mode        |
| `bun run build`        | Build all apps and packages             |
| `bun run lint`         | Run linters across the workspace        |
| `bun run test`         | Run the test suite                      |
| `bun run sdk:generate` | Generate TypeScript client from OpenAPI |

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 bun run dev
```

### Database Issues

If you encounter database errors:

```bash
# Remove tenant databases (they'll be recreated)
rm -rf apps/api/tenants/*.db

# Restart the server
bun run dev
```

### Redis Connection Issues

If Redis is not running:

```bash
# Start Redis with Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or use Docker Compose
docker-compose up -d redis
```

## Next Steps

Now that Blerp is running, you can:

1. **Use the API** - Learn how to make authenticated API calls in the [API Usage](../api-usage) tutorial
2. **Set Up Data** - Create projects, organizations, and users in the [Data Setup](../data-setup) tutorial
3. **Integrate with Next.js** - Add authentication to your app with the [Next.js Integration](../nextjs-integration) tutorial

## Additional Resources

- [GitHub Repository](https://github.com/e6qu/blerp) - Source code and issues
- [Guide](/guide/) - Getting started guide
