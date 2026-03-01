# Do Next

### Current Milestone

| Milestone  | Description             | Status         |
| ---------- | ----------------------- | -------------- |
| M8 Phase G | Critical Path E2E Tests | 🔄 In Progress |

### In Progress — M8 Phase G Tasks

1. **Authentication Tests** (Enhanced)
   - Sign up form validation and submission
   - Sign out flow (button, API call, redirect)
   - Files: `tests/auth/signup.spec.ts`, `tests/auth/signout.spec.ts`

2. **Organization CRUD Tests**
   - Create org modal (from page and switcher)
   - Form validation and submission
   - File: `tests/organizations/crud.spec.ts`

3. **Organization Switching Tests**
   - Dropdown open/close behavior
   - Org selection updates UI
   - File: `tests/organizations/switching.spec.ts`

4. **Member Management Tests**
   - Edit role, delete member
   - Loading/disabled states
   - File: `tests/organizations/members.spec.ts`

5. **Navigation & Access Tests**
   - Sidebar navigation
   - Tab navigation within pages
   - File: `tests/access/navigation.spec.ts`

### Completed Milestones

| Milestone     | Description                      | Status      |
| ------------- | -------------------------------- | ----------- |
| M1-M6         | Core Platform, Enterprise, Scale | ✅ Complete |
| M7            | Clerk SDK Parity                 | ✅ Complete |
| M8 Phases A-F | E2E Testing Infrastructure       | ✅ Complete |

### Blocked

| Milestone | Description               | Status     | Reason                   |
| --------- | ------------------------- | ---------- | ------------------------ |
| M9        | Production Infrastructure | ⏸️ Blocked | Requires AWS credentials |

### Future Work (M12 - Dashboard Feature Completion)

Placeholder features to implement later:

- Profile editing, email management, password change, 2FA
- Project settings, API key management, project deletion
- Invitation creation, webhook creation, domain management

### Future Enhancements (Planned)

- M10: Multi-Language SDK Support (Python, Go)
- M11: Advanced Security & Compliance (SOC 2, GDPR)
