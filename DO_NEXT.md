# Do Next

### Current Milestone

| Milestone | Description                  | Status         |
| --------- | ---------------------------- | -------------- |
| M12       | Dashboard Feature Completion | 🔄 In Progress |

### In Progress — M12 Phases A & B Tasks

**Phase A — User Profile Features** (requires backend + frontend)

1. Profile Editing - Edit first name, last name, username
2. Email Management - List, add, remove emails with verification
3. Password Change - Current password verification, new password form
4. 2FA Enrollment - TOTP QR code, verification, backup codes

**Phase B — Settings Features** (requires backend + frontend) 5. Project Settings - Project name editing, domain configuration 6. API Key Management - List, create, revoke keys 7. Project Deletion - Confirmation dialog, cascade delete

### Completed

| Milestone   | Description               | Status      |
| ----------- | ------------------------- | ----------- |
| M1-M6       | Core Platform, Enterprise | ✅ Complete |
| M7          | Clerk SDK Parity          | ✅ Complete |
| M8          | E2E Testing (Phases A-G)  | ✅ Complete |
| M12 Phase C | Organization Features UI  | ✅ Complete |

### Blocked

| Milestone | Description               | Status     | Reason                   |
| --------- | ------------------------- | ---------- | ------------------------ |
| M9        | Production Infrastructure | ⏸️ Blocked | Requires AWS credentials |

### Future Work (M8 Phase H - E2E Tests)

Now unblocked by M12 Phase C:

- Invitations Tests (UI now exists)
- Webhooks Tests (UI now exists)
- Domains Tests (UI now exists)

Still pending:

- Sessions Tests (enhanced with revoke)
- Settings Tests (enhanced with actual settings)
- Visual Regression Tests (snapshots)

### Future Enhancements (Planned)

- M10: Multi-Language SDK Support (Python, Go)
- M11: Advanced Security & Compliance (SOC 2, GDPR)
