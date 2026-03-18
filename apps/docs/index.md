# Blerp Identity Service

Blerp is a clean-room reimplementation of the Clerk Identity Service, built for high performance and multi-tenancy.

## Features

- **Multi-tenancy**: Isolated SQLite databases per customer.
- **REST API**: Comprehensive JSON API with OpenAPI 3.1 specifications.
- **Security**: Argon2id hashing, JOSE-based JWTs, and CSRF protection.
- **Observability**: Built-in OpenTelemetry and structured logging.
- **Dashboard**: Admin UI for managing users, organizations, and settings.
- **SDK Parity**: Drop-in replacement for Clerk and Monite SDK integrations.

## Quick Start

```bash
git clone git@github.com:e6qu/blerp.git && cd blerp
bun install
bun run dev
```

This starts the **API** on `http://localhost:3000`, the **Dashboard** on `http://localhost:3001`, and this **docs site**. No Redis required.

[Get Started](/guide/) | [Tutorials](/tutorials/) | [GitHub](https://github.com/e6qu/blerp)
