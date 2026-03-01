# Using the Blerp API

This tutorial covers how to use the Blerp REST API to manage users, organizations, sessions, and more.

## API Overview

Blerp provides a comprehensive REST API with:

- **Base URL**: `http://localhost:3000/v1` (development)
- **Authentication**: Bearer tokens (API keys or session tokens)
- **Format**: JSON requests and responses
- **Spec**: OpenAPI 3.1 compliant

## Authentication

Blerp uses three types of authentication:

### 1. Secret Keys (Server-side)

Secret keys have full access to all endpoints:

```bash
curl http://localhost:3000/v1/users \
  -H "Authorization: Bearer sk_test_your-secret-key"
```

### 2. Publishable Keys (Client-side)

Publishable keys have limited access for client-side operations:

```bash
curl http://localhost:3000/v1/client \
  -H "Authorization: Bearer pk_test_your-publishable-key"
```

### 3. Session Tokens (User sessions)

Session tokens represent authenticated users:

```bash
curl http://localhost:3000/v1/client/sessions \
  -H "Authorization: Bearer sess_your-session-token"
```

## Tenant Identification

All requests require a tenant ID via the `X-Tenant-Id` header:

```bash
curl http://localhost:3000/v1/users \
  -H "X-Tenant-Id: my-project" \
  -H "Authorization: Bearer sk_test_..."
```

## User Management

### Create a User (Signup)

Start a signup flow with email/password:

```bash
curl -X POST http://localhost:3000/v1/auth/signups \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: my-project" \
  -d '{
    "email": "user@example.com",
    "strategy": "password",
    "password": "SecurePassword123!"
  }'
```

Response:

```json
{
  "id": "sig_abc123",
  "status": "needs_verification",
  "email_address": "user@example.com",
  "verification_strategy": "email_code"
}
```

### Verify Email

Complete the signup with a verification code:

```bash
curl -X POST http://localhost:3000/v1/auth/signups/sig_abc123/attempt \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: my-project" \
  -d '{
    "code": "123456"
  }'
```

Response:

```json
{
  "status": "complete",
  "user_id": "user_xyz789",
  "session_token": "sess_def456",
  "refresh_token": "ref_ghi012"
}
```

### List Users

Retrieve all users (requires secret key):

```bash
curl http://localhost:3000/v1/users \
  -H "Authorization: Bearer sk_test_..." \
  -H "X-Tenant-Id: my-project"
```

### Get Current User

Get the authenticated user's profile:

```bash
curl http://localhost:3000/v1/client/user \
  -H "Authorization: Bearer sess_def456" \
  -H "X-Tenant-Id: my-project"
```

Response:

```json
{
  "id": "user_xyz789",
  "email_addresses": [
    {
      "id": "email_abc",
      "email": "user@example.com",
      "verification": {
        "status": "verified"
      }
    }
  ],
  "first_name": "John",
  "last_name": "Doe",
  "created_at": "2026-03-02T10:00:00Z"
}
```

### Update User

Update user profile:

```bash
curl -X PATCH http://localhost:3000/v1/users/user_xyz789 \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: my-project" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith"
  }'
```

## Session Management

### List Sessions

Get all active sessions for the current user:

```bash
curl http://localhost:3000/v1/client/sessions \
  -H "Authorization: Bearer sess_def456" \
  -H "X-Tenant-Id: my-project"
```

### Revoke Session

Revoke a specific session:

```bash
curl -X DELETE http://localhost:3000/v1/sessions/sess_abc123 \
  -H "Authorization: Bearer sk_test_..." \
  -H "X-Tenant-Id: my-project"
```

## Organization Management

### Create an Organization

```bash
curl -X POST http://localhost:3000/v1/organizations \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: my-project" \
  -d '{
    "name": "Acme Corp",
    "slug": "acme-corp",
    "created_by": "user_xyz789"
  }'
```

### List Organizations

```bash
curl http://localhost:3000/v1/organizations \
  -H "Authorization: Bearer sk_test_..." \
  -H "X-Tenant-Id: my-project"
```

### Add Member to Organization

```bash
curl -X POST http://localhost:3000/v1/organizations/org_abc123/memberships \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: my-project" \
  -d '{
    "user_id": "user_xyz789",
    "role": "member"
  }'
```

## Email Management

### Add Email Address

```bash
curl -X POST http://localhost:3000/v1/users/user_xyz789/email_addresses \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: my-project" \
  -d '{
    "email": "alternate@example.com"
  }'
```

### Set Primary Email

```bash
curl -X POST http://localhost:3000/v1/users/user_xyz789/email_addresses/email_def456/set_primary \
  -H "Authorization: Bearer sk_test_..." \
  -H "X-Tenant-Id: my-project"
```

## Two-Factor Authentication

### Enroll in 2FA

Start TOTP enrollment:

```bash
curl -X POST http://localhost:3000/v1/users/user_xyz789/mfa/totp \
  -H "Authorization: Bearer sk_test_..." \
  -H "X-Tenant-Id: my-project"
```

Response:

```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "uri": "otpauth://totp/Blerp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Blerp",
  "qr_code_url": "https://chart.googleapis.com/chart?..."
}
```

### Verify 2FA Enrollment

```bash
curl -X POST http://localhost:3000/v1/users/user_xyz789/mfa/totp/verify \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: my-project" \
  -d '{
    "code": "123456"
  }'
```

Response:

```json
{
  "verified": true,
  "backup_codes": [
    "ABCD1234",
    "EFGH5678",
    "IJKL9012",
    ...
  ]
}
```

## Webhooks

### Create a Webhook Endpoint

```bash
curl -X POST http://localhost:3000/v1/webhooks/endpoints \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: my-project" \
  -d '{
    "url": "https://example.com/webhooks",
    "events": ["user.created", "user.updated"],
    "secret": "whsec_your-secret"
  }'
```

### List Webhooks

```bash
curl http://localhost:3000/v1/webhooks/endpoints \
  -H "Authorization: Bearer sk_test_..." \
  -H "X-Tenant-Id: my-project"
```

## Error Handling

Blerp uses RFC 7807 Problem Details for error responses:

```json
{
  "type": "https://blerp.dev/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "Email address is invalid",
  "instance": "/v1/auth/signups"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited per API key:

- **Default**: 100 requests per minute
- **Headers**: Check `X-RateLimit-Limit` and `X-RateLimit-Remaining`

Example response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
```

## TypeScript Client

Blerp generates a TypeScript client from the OpenAPI spec:

```typescript
import { client } from "@blerp/shared";

// Configure client
client.setConfig({
  baseUrl: "http://localhost:3000",
  headers: {
    "X-Tenant-Id": "my-project",
    Authorization: "Bearer sk_test_...",
  },
});

// Make requests with full type safety
const { data, error } = await client.GET("/v1/users");
if (error) {
  console.error("Failed to fetch users:", error);
} else {
  console.log("Users:", data);
}
```

## Next Steps

- **Data Setup Tutorial** - Learn how to structure your data in the [Data Setup](../data-setup) tutorial
- **Next.js Integration** - Add Blerp to your Next.js app with the [Next.js Integration](../nextjs-integration) tutorial

## Additional Resources

- [OpenAPI Specification](https://github.com/e6qu/blerp/blob/main/openapi/blerp.v1.yaml)
- [GitHub Examples](https://github.com/e6qu/blerp/tree/main/examples)
