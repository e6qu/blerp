# Getting Started

To get started with Blerp development, clone the repository and install dependencies using Bun.

```bash
bun install
bun run dev
```

This starts the API server at `http://localhost:3000` (override with `BLERP_API_PORT`) and the dashboard at `http://localhost:3001` (override with `BLERP_DASHBOARD_PORT`). Redis is optional — the API works without it (caching and event streaming are disabled).

## Creating a Project

You can create a new project via the dashboard or directly using the API.

```bash
curl -X POST http://localhost:3000/v1/auth/signups \
  -H "X-Tenant-Id: my-project" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "strategy": "password",
    "password": "SecurePassword123!"
  }'
```
