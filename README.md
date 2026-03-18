# Blerp Identity Service

Blerp is a clean-room reimplementation of the Clerk Identity Service, built for high performance, multi-tenancy, and self-hosting.

## Documentation

Documentation lives in `apps/docs/` and can be browsed locally via `bun run dev` (starts a VitePress site). Tutorials and guides are also readable as markdown files:

- **[Getting Started](apps/docs/tutorials/getting-started.md)** — Set up and run Blerp locally
- **[API Usage Guide](apps/docs/tutorials/api-usage.md)** — Learn how to use the REST API
- **[Data Setup Guide](apps/docs/tutorials/data-setup.md)** — Set up projects, organizations, and users
- **[Next.js Integration](apps/docs/tutorials/nextjs-integration.md)** — Add Blerp to your Next.js app
- **[Monite Integration](apps/docs/guide/monite-integration.md)** — Integrate with the Monite SDK
- **[SDK Repointing](apps/docs/guide/sdk-repointing.md)** — Point Clerk SDKs at Blerp

### Core Documentation

- `DESIGN_DOCUMENT.md` — Architecture, API surface, data models, security posture
- `PLAN.md` — Milestone/phase breakdown with current execution status
- `FEATURES.md` — Canonical feature list (backend, frontend, security, DevEx)
- `USER_STORIES.md` — Persona-based requirements
- `ACCEPTANCE_CRITERIA.md` — Definition of "acceptable" outcomes
- `DEFINITION_OF_DONE.md` — Checklist for completed deliverables
- `STATUS.md` — Rolling status log
- `WHAT_WE_DID.md` — Chronological notes about completed work
- `DO_NEXT.md` — Prioritized roadmap
- `AGENTS.md` — Instructions for automation/agents
- `openapi/blerp.v1.yaml` — Authoritative REST contract

## Project Status

- **Current Status**: All planned milestones complete through M12, plus Dashboard UI Gap Analysis (Clerk/Monite parity).
- **Core Platform**: Milestones 1-3 complete. Multi-tenancy, auth, and dashboard foundations are solid.
- **Frameworks**: Milestones 4-5 complete. `@blerp/nextjs` and `@blerp/backend` packages are operational.
- **SDK Parity**: Milestones 6-7 complete. Full Monite SDK and Clerk SDK compatibility achieved.
- **Testing**: Milestone 8 complete. **155/155 E2E tests + 46/46 API unit tests** all passing.
- **Dashboard**: Milestone 12 + Dashboard UI Gap Analysis complete. Sign In, org/account deletion, connected accounts, pagination, toasts, loading skeletons, session management, admin user management, and avatar uploads all implemented.

**Blocked**: M9 (Production Infrastructure) pending AWS credentials.

**Next**: P2/P3 UI gaps (dark mode, search, responsive layout, error boundaries), M10 (Multi-Language SDK), or M11 (Security & Compliance).

## Workspace Structure

```
blerp/
├── apps/
│   ├── api/              # Express API server
│   ├── dashboard/        # React admin dashboard
│   └── docs/             # VitePress documentation site
├── packages/
│   ├── shared/           # Shared types, utilities, and generated OpenAPI client
│   ├── nextjs/           # Next.js SDK for client apps
│   ├── backend/          # Backend SDK for server apps
│   └── config/           # Shared configuration (TSConfig, ESLint, etc.)
├── openapi/              # OpenAPI 3.1 specifications
├── examples/             # Example applications and integrations
└── docs/                 # Additional markdown documentation
```

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Run in Development Mode

```bash
bun run dev
```

This builds dependencies (like `@blerp/shared`) automatically, then starts:

| Service    | Default URL                 | Port override env var  |
| ---------- | --------------------------- | ---------------------- |
| API Server | `http://localhost:3000`     | `BLERP_API_PORT`       |
| Dashboard  | `http://localhost:3001`     | `BLERP_DASHBOARD_PORT` |
| Docs       | VitePress on next free port | —                      |

Redis is **optional** — the API runs without it. Caching, rate limiting, and event streaming are simply disabled. To enable them: `docker run -d -p 6379:6379 redis:7-alpine`.

### 3. Create Your First User

```bash
# Uses default port 3000. Set BLERP_API_PORT to change it.
curl -X POST http://localhost:3000/v1/auth/signups \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: demo-project" \
  -d '{
    "email": "user@example.com",
    "strategy": "password",
    "password": "SecurePassword123!"
  }'
```

For a detailed walkthrough, see the **[Getting Started Tutorial](apps/docs/tutorials/getting-started.md)**.

## Common Commands

| Command                | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `bun run build`        | Build all apps and packages in the monorepo using Turbo. |
| `bun run dev`          | Run all applications in development mode.                |
| `bun run lint`         | Run linters across the entire workspace.                 |
| `bun run test`         | Run the test suite across all packages.                  |
| `bun run openapi:lint` | Validate the OpenAPI specification.                      |
| `bun run sdk:generate` | Regenerate the shared SDK client from the OpenAPI spec.  |

## SDK Generation

The OpenAPI schema is used as the single source of truth to generate TypeScript SDK clients:

```bash
bun run sdk:generate
```

The generated client is output to `packages/shared/src/schema.ts` and exported via `packages/shared/src/index.ts`.

## Adding Dependencies

To add a package to a specific workspace:

```bash
bun add <package> --filter @blerp/api
```

> **Note:** Do not use `npm`, `pnpm`, or `yarn`. This project is standardized on Bun. Use `bunx turbo <cmd>` if you need to run turbo commands directly outside of scripts.

## Repository & Contact

- **Repository**: [github.com/e6qu/blerp](https://github.com/e6qu/blerp)
- **Issues**: [github.com/e6qu/blerp/issues](https://github.com/e6qu/blerp/issues)
- **Primary Contact**: `adi11235@gmail.com`

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `bun run test && bun run lint`
5. Submit a pull request

## License

[MIT License](LICENSE)
