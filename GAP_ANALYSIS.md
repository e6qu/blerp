# Gap Analysis: Blerp Dashboard vs Clerk & Monite

> Assessed 2026-03-18 against [Clerk docs](https://clerk.com/docs/components/user/user-profile) and [Monite SDK docs](https://docs.monite.com/react-sdk/index).

## Executive Summary

The Blerp dashboard implements core CRUD functionality for all major features (users, orgs, members, invitations, domains, webhooks, API keys, 2FA, sessions). However, it falls significantly short of Clerk's production quality in three areas:

1. **Visual design** — plain Tailwind utility styling vs Clerk's polished, branded component system
2. **Missing features** — no SignIn page, no connected accounts, no org deletion, no billing, no custom roles
3. **UX gaps** — no search/filter, no pagination, no loading skeletons, no error boundaries, no responsive design

---

## Feature Matrix

### Authentication

| Feature                         | Clerk | Blerp                            | Gap                          |
| ------------------------------- | ----- | -------------------------------- | ---------------------------- |
| Sign Up (email/password)        | ✅    | ✅                               | —                            |
| Sign Up (OAuth: GitHub, Google) | ✅    | ✅ Buttons exist, redirect works | —                            |
| Sign In (email/password)        | ✅    | ❌ No dedicated page             | **Missing SignIn page**      |
| Sign In (OAuth)                 | ✅    | ❌                               | Part of missing SignIn       |
| Magic link / email code sign-in | ✅    | ❌                               | Not implemented              |
| Phone number sign-in (SMS)      | ✅    | ❌                               | Not implemented              |
| Multi-session support           | ✅    | ❌                               | Single user session only     |
| CAPTCHA / bot protection        | ✅    | ❌                               | Not implemented              |
| Redirect after auth             | ✅    | ❌                               | No redirect flow             |
| Account Portal (hosted UI)      | ✅    | ❌                               | Not applicable (self-hosted) |

### User Profile (`<UserProfile />`)

| Feature                               | Clerk                            | Blerp                             | Gap                                           |
| ------------------------------------- | -------------------------------- | --------------------------------- | --------------------------------------------- |
| Profile photo upload                  | ✅                               | ❌ Gray circle placeholder        | **No avatar upload**                          |
| First/last name editing               | ✅                               | ✅                                | —                                             |
| Username editing                      | ✅                               | ✅                                | —                                             |
| Email management (add/remove/primary) | ✅                               | ✅                                | —                                             |
| Email verification flow               | ✅                               | ⚠️ Status shown, no in-app verify | No verification code entry                    |
| Phone number management               | ✅                               | ❌                                | Schema exists, no UI                          |
| Connected accounts (OAuth)            | ✅ Shows linked GitHub/Google    | ❌                                | **No connected accounts UI**                  |
| Password change                       | ✅                               | ✅                                | —                                             |
| Two-factor auth (TOTP)                | ✅                               | ✅ QR + backup codes              | —                                             |
| Two-factor auth (SMS)                 | ✅                               | ❌                                | Not implemented                               |
| Backup codes (view/regenerate)        | ✅ Accessible in settings        | ⚠️ Shown once at enrollment       | **Cannot view after enrollment**              |
| Passkey management                    | ✅ Add/remove/rename             | ⚠️ Add only                       | **Cannot delete or rename passkeys**          |
| Active sessions list                  | ✅ Device, browser, location, IP | ⚠️ Shows "Unknown Device"         | **No device/browser parsing, no IP/location** |
| Sign out other sessions               | ✅                               | ❌                                | Single revoke only, no "sign out all"         |
| Custom profile pages                  | ✅ Extensible sidenav            | ❌                                | Not implemented                               |
| Danger zone (delete account)          | ✅                               | ❌                                | **No account deletion**                       |

### User Button (`<UserButton />`)

| Feature                        | Clerk                  | Blerp                           | Gap                                    |
| ------------------------------ | ---------------------- | ------------------------------- | -------------------------------------- |
| Avatar dropdown with user info | ✅ Name, email, avatar | ⚠️ Shows "Admin User" text only | **No real avatar, no email shown**     |
| Quick sign out                 | ✅                     | ✅ Sign out button in sidebar   | Location differs (sidebar vs dropdown) |
| Link to profile settings       | ✅                     | ❌ Nav link exists, no dropdown | —                                      |
| Manage account link            | ✅                     | ❌                              | —                                      |
| Theme toggle (dark/light)      | ✅                     | ❌                              | **No dark mode**                       |

### Organization Profile (`<OrganizationProfile />`)

| Feature                        | Clerk                       | Blerp                              | Gap                             |
| ------------------------------ | --------------------------- | ---------------------------------- | ------------------------------- |
| General tab (name, logo, slug) | ✅                          | ⚠️ Name shown, no edit in org view | **No org profile editing page** |
| Organization logo upload       | ✅                          | ❌                                 | **No org avatar/logo**          |
| Leave organization             | ✅                          | ❌                                 | Not implemented                 |
| Delete organization            | ✅ (admin)                  | ❌                                 | **No org deletion**             |
| Members tab                    | ✅                          | ✅                                 | —                               |
| Invite members                 | ✅                          | ✅                                 | —                               |
| Change member roles            | ✅                          | ✅                                 | —                               |
| Remove members                 | ✅                          | ✅                                 | —                               |
| Custom roles                   | ✅                          | ❌ Only owner/admin/member         | **No custom role creation**     |
| Verified domains               | ✅                          | ✅                                 | —                               |
| Domain enrollment mode         | ✅ Auto/manual enrollment   | ❌                                 | Not in UI                       |
| Billing tab                    | ✅ Plans, invoices, payment | ❌                                 | **No billing integration**      |
| API Keys tab                   | ✅ (when enabled)           | ❌ Keys are project-level only     | —                               |

### Organization Switcher (`<OrganizationSwitcher />`)

| Feature                   | Clerk | Blerp | Gap                       |
| ------------------------- | ----- | ----- | ------------------------- |
| Dropdown with org list    | ✅    | ✅    | —                         |
| Create organization       | ✅    | ✅    | —                         |
| Personal workspace option | ✅    | ❌    | Not implemented           |
| Org avatar/logo in list   | ✅    | ❌    | No org images             |
| Search organizations      | ✅    | ❌    | **No search in switcher** |
| Invitation count badge    | ✅    | ❌    | Not implemented           |

### Settings / Admin Dashboard

| Feature                       | Clerk                              | Blerp                    | Gap                                     |
| ----------------------------- | ---------------------------------- | ------------------------ | --------------------------------------- |
| Project settings              | ✅                                 | ✅ Name, ID              | —                                       |
| Allowed origins / CORS        | ✅                                 | ✅ Form exists           | —                                       |
| API keys (publishable/secret) | ✅                                 | ✅                       | —                                       |
| Webhook management            | ✅                                 | ✅                       | —                                       |
| Webhook delivery logs         | ✅ Shows attempts, retries, status | ❌                       | **No delivery history**                 |
| Webhook test/ping             | ✅                                 | ❌                       | Not implemented                         |
| Audit logs                    | ✅ Filterable, paginated           | ⚠️ Raw table, no filters | **No filtering, pagination, or export** |
| Usage/analytics               | ✅ Detailed charts                 | ⚠️ Basic progress bars   | **No charts, no time-series data**      |
| Session management (admin)    | ✅                                 | ❌                       | No admin session overview               |
| User management (admin)       | ✅ Search, filter, impersonate     | ❌                       | **No admin user management page**       |
| Email/SMS templates           | ✅                                 | ❌                       | Not implemented                         |
| Branding/theming              | ✅ Colors, logo, custom CSS        | ❌                       | **No theming system**                   |
| Social connections config     | ✅ Enable/disable providers        | ❌                       | Not in dashboard                        |

---

## Visual & UX Gaps

### Design Quality

| Aspect                 | Clerk                                              | Blerp                                 | Gap                         |
| ---------------------- | -------------------------------------------------- | ------------------------------------- | --------------------------- |
| Component library      | Polished, consistent design system                 | Raw Tailwind utilities                | **No design system**        |
| Loading states         | Skeleton loaders, shimmer effects                  | Plain "Loading..." text               | **No skeleton loaders**     |
| Empty states           | Illustrated, actionable                            | Dashed border with text               | Functional but plain        |
| Error handling         | Toast notifications, inline errors, recovery       | `confirm()` dialogs, inline red boxes | **No toast system**         |
| Animations/transitions | Smooth transitions, micro-interactions             | None                                  | **No animations**           |
| Responsive design      | Mobile-first, responsive breakpoints               | Fixed-width sidebar (w-64)            | **Not mobile-friendly**     |
| Dark mode              | ✅ Full dark mode support                          | ❌                                    | **No dark mode**            |
| Accessibility          | ARIA labels, keyboard navigation, focus management | Minimal ARIA                          | **Limited a11y**            |
| Avatars                | Real photos with fallback initials                 | Gray circles                          | **No avatar system**        |
| Tables                 | Sortable, searchable, paginated                    | Static tables                         | **No sort/search/paginate** |
| Modals                 | Animated, keyboard-dismissible, focus trap         | Basic overlay, no focus trap          | **No focus management**     |
| Form validation        | Real-time inline validation                        | HTML5 required only                   | **No rich validation**      |

### Information Architecture

| Aspect              | Clerk                               | Blerp                     | Gap                    |
| ------------------- | ----------------------------------- | ------------------------- | ---------------------- |
| Navigation depth    | Sidebar + tabs + breadcrumbs        | Sidebar + tabs (2 levels) | Missing breadcrumbs    |
| Search              | Global search across users, orgs    | ❌ None                   | **No search anywhere** |
| Pagination          | All lists paginated                 | ❌ None                   | **No pagination**      |
| Bulk actions        | Select multiple, bulk delete/invite | ❌ None                   | **No bulk operations** |
| Keyboard shortcuts  | ✅                                  | ❌                        | Not implemented        |
| Notification center | ✅ In-app notifications             | ❌                        | Not implemented        |

---

## Monite SDK Parity Gaps

| Feature                        | Monite SDK                      | Blerp               | Gap                      |
| ------------------------------ | ------------------------------- | ------------------- | ------------------------ |
| Material UI theming            | ✅ Full MUI theme customization | ❌ Raw Tailwind     | **No theming engine**    |
| Localization (i18n)            | ✅ Locale prop, translations    | ❌ English only     | **No i18n**              |
| Currency formatting            | ✅ Per-locale formatting        | N/A                 | —                        |
| Component layout customization | ✅ Colors, fonts, borders       | ❌                  | **No customization API** |
| MoniteProvider config          | ✅ Rich configuration object    | ⚠️ Hardcoded config | Limited                  |

---

## Priority Ranking (Impact × Effort)

### P0 — Critical (blocks production use) — ALL DONE ✅

1. ~~**Sign In page**~~ ✅ Two-step email→password flow + OAuth
2. ~~**Organization deletion**~~ ✅ Type-to-confirm modal
3. ~~**Account deletion**~~ ✅ Type "DELETE MY ACCOUNT" modal
4. ~~**Connected accounts (OAuth) UI**~~ ✅ Connect/disconnect GitHub, Google
5. ~~**Pagination**~~ ✅ Reusable component in SessionsViewer, AuditLogViewer, UsersListPage

### P1 — High (significantly below Clerk quality) — MOSTLY DONE ✅

6. ~~**Avatar/photo upload**~~ ✅ User avatars with upload + initials fallback
7. ~~**Loading skeletons**~~ ✅ TableSkeleton, CardSkeleton, ProfileSkeleton across 10 components
8. ~~**Toast notifications**~~ ✅ Context-based toast system with auto-dismiss
9. ~~**Session device/browser info**~~ ✅ UA parser showing browser/OS/device
10. ~~**Backup codes re-access**~~ ✅ BackupCodesModal with regenerate + copy
11. ~~**Passkey delete/rename**~~ ✅ Delete supported (rename still missing)
12. **Audit log filters + pagination** — ⚠️ Pagination added, **filters and export still missing**
13. ~~**Admin user management page**~~ ✅ /admin/users with search, filter, pagination

### P2 — Medium (expected in production) — OPEN

14. **Dark mode** — Industry standard
15. **Search (global + in-lists)** — Essential for any list > 10 items
16. **Responsive/mobile layout** — Fixed w-64 sidebar fails on mobile
17. **Org profile editing** — Name/slug/logo from org detail view
18. **Leave organization** — Members need to leave without admin action
19. **Webhook delivery logs** — No visibility into webhook health
20. **Error boundaries** — Unhandled errors crash the app
21. **Form validation** — Only HTML5 `required`, no inline feedback
22. **Phone number management** — Schema exists, no UI

### P3 — Nice to have — OPEN

23. **Theming/branding system** — For white-label use cases
24. **i18n / localization** — English only for now
25. **Keyboard shortcuts** — Power user feature
26. **Bulk actions** — Select + batch operations
27. **Email/SMS templates** — Admin customization
28. **Custom roles** — Beyond owner/admin/member
29. **Magic link / passwordless sign-in** — Alternative auth strategy
30. **Notification center** — In-app notifications

---

## Implementation Status (2026-03-19)

| Priority  | Total  | Done   | Remaining             |
| --------- | ------ | ------ | --------------------- |
| P0        | 5      | 5      | 0                     |
| P1        | 8      | 7      | 1 (audit log filters) |
| P2        | 9      | 0      | 9                     |
| P3        | 8      | 0      | 8                     |
| **Total** | **30** | **12** | **18**                |
