# Setting Up Data in Blerp

This tutorial covers how to set up and manage data in Blerp, including projects, organizations, users, and configuration.

## Understanding Blerp's Data Model

Blerp uses a hierarchical data structure:

```
Project (Tenant)
├── API Keys (publishable & secret)
├── Organizations
│   ├── Memberships
│   ├── Domains
│   └── Invitations
├── Users
│   ├── Email Addresses
│   ├── Sessions
│   └── Passkeys
└── Webhooks
```

Each project gets its own SQLite database for complete data isolation.

## Creating Projects

### Using the Dashboard

1. Open the dashboard at `http://localhost:5173`
2. Projects are automatically created when you first access the dashboard
3. The default project ID is `demo-project`

### Using the API

Projects are typically created implicitly via the `X-Tenant-Id` header. When you make a request with a new tenant ID, Blerp creates a new database automatically.

```bash
# This creates a new project database if it doesn't exist
curl http://localhost:3000/v1/users \
  -H "X-Tenant-Id: my-new-project" \
  -H "Authorization: Bearer sk_test_..."
```

## Managing API Keys

### Default Keys

When you start Blerp, it uses demo keys for development:

- **Publishable Key**: `pk_test_demo`
- **Secret Key**: `sk_test_demo`

These keys are for development only. In production, you'll create specific keys.

### Creating API Keys via Dashboard

1. Navigate to **Settings** → **API Keys**
2. Click **Create key**
3. Select:
   - **Environment**: Development, Staging, or Production
   - **Type**: Publishable or Secret
   - **Label**: Optional description
4. Click **Create**

### Creating API Keys via API

```bash
curl -X POST http://localhost:3000/v1/projects/demo-project/keys \
  -H "Authorization: Bearer sk_test_demo" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: demo-project" \
  -d '{
    "environment": "development",
    "type": "secret",
    "label": "Backend Server Key"
  }'
```

Response:

```json
{
  "id": "key_abc123",
  "prefix": "sk_test_abc",
  "type": "secret",
  "environment": "development",
  "label": "Backend Server Key",
  "secret": "sk_test_abc_xyz789_COMPLETE_KEY_SHOWN_ONCE",
  "status": "active",
  "created_at": "2026-03-02T10:00:00Z"
}
```

**Important**: Store the secret immediately - it's only shown once!

## Setting Up Organizations

Organizations represent companies or teams within your application.

### Create an Organization

```bash
curl -X POST http://localhost:3000/v1/organizations \
  -H "Authorization: Bearer sk_test_demo" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: demo-project" \
  -d '{
    "name": "Acme Corporation",
    "slug": "acme-corp"
  }'
```

### Configure Organization Domains

Add verified domains to enable auto-enrollment:

```bash
curl -X POST http://localhost:3000/v1/organizations/org_abc123/domains \
  -H "Authorization: Bearer sk_test_demo" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: demo-project" \
  -d '{
    "domain": "acme.com"
  }'
```

### Verify Domain Ownership

1. Retrieve DNS verification records:

```bash
curl http://localhost:3000/v1/organizations/org_abc123/domains/dom_xyz789 \
  -H "Authorization: Bearer sk_test_demo" \
  -H "X-Tenant-Id: demo-project"
```

2. Add the TXT record to your DNS:

```
_blerp-verification.acme.com TXT "blerp-verify=abc123xyz"
```

3. Check verification status:

```bash
curl -X POST \
  http://localhost:3000/v1/organizations/org_abc123/domains/dom_xyz789/verify \
  -H "Authorization: Bearer sk_test_demo" \
  -H "X-Tenant-Id: demo-project"
```

## Managing Users

### Create Users

Users can be created through:

1. **Signup Flow** (self-registration)
2. **Direct Creation** (admin/backoffice)
3. **Invitations** (organization membership)

#### Self-Registration (Signup Flow)

```bash
# Step 1: Start signup
curl -X POST http://localhost:3000/v1/auth/signups \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: demo-project" \
  -d '{
    "email": "user@acme.com",
    "strategy": "password",
    "password": "SecurePassword123!"
  }'

# Step 2: Verify email (code sent to user's email)
curl -X POST http://localhost:3000/v1/auth/signups/sig_abc123/attempt \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: demo-project" \
  -d '{
    "code": "123456"
  }'
```

#### Direct Creation (Admin)

```bash
curl -X POST http://localhost:3000/v1/users \
  -H "Authorization: Bearer sk_test_demo" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: demo-project" \
  -d '{
    "email_address": "admin@acme.com",
    "first_name": "Admin",
    "last_name": "User",
    "password": "SecurePassword123!",
    "email_verified": true,
    "public_metadata": {
      "role": "admin"
    }
  }'
```

### User Metadata

Blerp supports three types of metadata:

1. **Public Metadata**: Visible to client-side applications
2. **Private Metadata**: Only accessible with secret keys
3. **Unsafe Metadata**: User-modifiable data (use sparingly)

```bash
curl -X PATCH http://localhost:3000/v1/users/user_abc123 \
  -H "Authorization: Bearer sk_test_demo" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: demo-project" \
  -d '{
    "public_metadata": {
      "display_name": "John Doe",
      "avatar_color": "#3B82F6"
    },
    "private_metadata": {
      "stripe_customer_id": "cus_abc123",
      "subscription_tier": "premium"
    }
  }'
```

## Organization Memberships

### Add Users to Organizations

```bash
curl -X POST http://localhost:3000/v1/organizations/org_abc123/memberships \
  -H "Authorization: Bearer sk_test_demo" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: demo-project" \
  -d '{
    "user_id": "user_xyz789",
    "role": "member"
  }'
```

Roles:

- `owner`: Full control including deletion
- `admin`: Can manage members and settings
- `member`: Basic organization access

### Invite Users

```bash
curl -X POST http://localhost:3000/v1/invitations \
  -H "Authorization: Bearer sk_test_demo" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: demo-project" \
  -d '{
    "email_address": "newuser@acme.com",
    "organization_id": "org_abc123",
    "role": "member"
  }'
```

## Configuring Authentication

### Enable Authentication Strategies

Update project configuration to enable auth methods:

```bash
curl -X PUT http://localhost:3000/v1/projects/demo-project \
  -H "Authorization: Bearer sk_test_demo" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: demo-project" \
  -d '{
    "name": "My App",
    "allowed_origins": [
      "http://localhost:3000",
      "https://myapp.com"
    ],
    "default_auth_strategies": [
      "password",
      "email_code",
      "oauth_google"
    ]
  }'
```

### Configure OAuth Providers

Set up OAuth providers in your project configuration:

```typescript
// OAuth configuration is stored in the project's configuration
// Currently supports: Google, GitHub, Microsoft, Apple

// Example: Google OAuth
// 1. Create OAuth app in Google Cloud Console
// 2. Set redirect URI: http://localhost:3000/v1/auth/oauth/google/callback
// 3. Configure in Blerp (via environment variables or database)
```

## Setting Up Webhooks

### Create Webhook Endpoint

```bash
curl -X POST http://localhost:3000/v1/webhooks/endpoints \
  -H "Authorization: Bearer sk_test_demo" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: demo-project" \
  -d '{
    "url": "https://myapp.com/webhooks/blerp",
    "events": [
      "user.created",
      "user.updated",
      "user.deleted",
      "session.created",
      "organization.membership.created"
    ]
  }'
```

Response includes a signing secret:

```json
{
  "id": "wh_ep_abc123",
  "url": "https://myapp.com/webhooks/blerp",
  "secret": "whsec_xyz789...",
  "events": [...]
}
```

### Handle Webhooks

Example webhook payload:

```json
{
  "id": "evt_abc123",
  "type": "user.created",
  "created_at": "2026-03-02T10:00:00Z",
  "data": {
    "id": "user_xyz789",
    "email_addresses": [...],
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

Verify webhook signatures:

```typescript
import { createHmac } from "crypto";

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac("sha256", secret).update(payload).digest("hex");
  return signature === expectedSignature;
}
```

## Data Import/Export

### Export Users

```bash
curl http://localhost:3000/v1/users?limit=1000 \
  -H "Authorization: Bearer sk_test_demo" \
  -H "X-Tenant-Id: demo-project" \
  -o users.json
```

### Import Users

Create users in bulk via script:

```typescript
const users = [
  { email: "user1@example.com", first_name: "User", last_name: "One" },
  { email: "user2@example.com", first_name: "User", last_name: "Two" },
];

for (const user of users) {
  await client.POST("/v1/users", {
    body: user,
    headers: { "X-Tenant-Id": "demo-project" },
  });
}
```

## Best Practices

1. **Use Different Keys for Different Environments**
   - Development: `pk_test_*`, `sk_test_*`
   - Production: `pk_live_*`, `sk_live_*`

2. **Secure Your Secret Keys**
   - Never expose secret keys in client-side code
   - Rotate keys regularly
   - Use environment variables

3. **Configure Allowed Origins**
   - Specify which domains can make requests
   - Include both development and production URLs

4. **Set Up Webhooks Early**
   - Capture all user lifecycle events
   - Sync data to your own database
   - Enable audit trails

5. **Use Metadata Effectively**
   - Store application-specific data in metadata
   - Keep private data in private_metadata
   - Use metadata for user queries

## Next Steps

- **Next.js Integration** - Add Blerp to your Next.js app
- **API Usage Tutorial** - Learn more API operations
- \*\*
