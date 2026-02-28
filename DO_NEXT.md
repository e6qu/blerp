# Do Next

### Current Milestone

| Milestone | Description         | Status         |
| --------- | ------------------- | -------------- |
| M8        | UI Flow E2E Testing | 🔄 In Progress |

### Completed in M8

- Phase A: Auth flow tests (signup, signin, signout, password-reset)
- Phase B: User profile tests (profile, sessions, security)
- Phase C: Organization tests (crud, switching, members, domains)
- Phase D: Access control tests (protected-routes, permissions)
- Phase E Task 14: Shared fixtures

### Remaining in M8

1. **Test Data Seeding** — Implement seed script for consistent test data (`tests/seed.ts`)
2. **Visual Regression** — Configure Playwright snapshots (`tests/visual/*.spec.ts`)
3. **E2E in CI** — Run E2E tests in GitHub Actions with artifact upload

### Completed Milestones

| Milestone  | Description                                                     | Status      |
| ---------- | --------------------------------------------------------------- | ----------- |
| M1-M6      | Core Platform, Enterprise, Scale, Next.js Parity, Monite Parity | ✅ Complete |
| M7         | Clerk SDK Parity                                                | ✅ Complete |
| M5 Phase D | E2E Testing                                                     | ✅ Complete |
| Phase F    | Engineering Standards                                           | ✅ Complete |

### Future Enhancements (Not Planned)

These items are documented but not currently prioritized:

- M9: Production Infrastructure (multi-region, blue/green deploy)
- M10: Multi-Language SDK Support (Python, Go, Ruby)
- M11: Advanced Security & Compliance (SOC 2, GDPR tooling)
- Billing Components
- M2M Tokens
- Web3 Authentication
