# Do Next

Maintain a prioritized list of upcoming actions. Update this file whenever new follow-ups are identified or existing ones are completed.

### Phase A: Advanced Metadata Hardening

1. **M6-PA-T1: Deep Metadata Merging** — Implement deep merging for metadata updates to support the complex `entities` object structure used by Monite.
2. **M6-PA-T2: Query Users by Metadata** — Implement filtering/querying users by specific metadata keys and values.
3. **M6-PA-T3: Metadata Schema Validation** — Add server-side validation for metadata keys to ensure consistency.

### Phase B: Organization Domains & Discovery

4. **M6-PB-T1: Organization Domains API** — Implement the REST endpoints for managing and verifying organization domains.
5. **M6-PB-T2: Domain Verification Logic** — Implement the logic for verifying organization domains via DNS or Email flows.
6. **M6-PB-T3: Verified Domain Auto-enrollment** — Enable automatic organization enrollment based on email domain.

### Phase C: Enhanced UI Components

7. **M6-PC-T1: Enhanced Organization Profile** — Extend the UI components to support the full set of management tabs (Members, Invitations, Domains).
8. **M6-PC-T2: Create Organization with Auto-suggestion** — Enhance the creation component with domain-based discovery.
9. **M6-PC-T3: Organization Switcher Polish** — Finalize the switcher with Personal Account and multi-entity support.

### Phase D: Real-world SDK Validation

10. **M6-PD-T1: Official Monite SDK Integration** — Swap mocks with the official Monite SDK and verify parity.
11. **M6-PD-T2: Token Exchange Verification** — Verify full Server-to-Server token exchange and webhook sync.
12. **M6-PD-T3: Clerk-to-Blerp Mapping Docs** — Document the mapping overrides needed for the Monite SDK.
