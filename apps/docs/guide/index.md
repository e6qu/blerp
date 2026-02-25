# Getting Started

To get started with Blerp development, clone the repository and install dependencies using Bun.

```bash
bun install
bun run build
bun run dev
```

## Creating a Project

You can create a new project via the dashboard or directly using the API.

```bash
curl -X POST http://localhost:3000/v1/auth/signups
  -H "X-Tenant-Id: my-project"
  -H "Content-Type: application/json"
  -d '{"email": "admin@example.com", "strategy": "password"}'
```
