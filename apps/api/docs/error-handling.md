# Error Handling

This document describes the standardized error handling pattern for the Blerp API.

## Overview

All API errors use a consistent JSON structure:

```json
{
  "error": {
    "code": "not_found",
    "message": "Organization not found"
  }
}
```

## Error Codes

| Code               | HTTP Status | Description                         |
| ------------------ | ----------- | ----------------------------------- |
| `bad_request`      | 400         | Invalid request parameters          |
| `unauthorized`     | 401         | Authentication required             |
| `forbidden`        | 403         | Insufficient permissions            |
| `not_found`        | 404         | Resource not found                  |
| `conflict`         | 409         | Resource conflict (e.g., duplicate) |
| `validation_error` | 422         | Validation failed                   |
| `quota_exceeded`   | 429         | Rate limit or quota exceeded        |
| `internal_error`   | 500         | Unexpected server error             |

## Usage

### Throwing Errors in Controllers

Use the error classes from `src/lib/errors.ts`:

```typescript
import { NotFoundError, BadRequestError, UnauthorizedError } from "../../lib/errors";

export async function getOrganization(req: Request, res: Response) {
  const org = await service.get(id);

  if (!org) {
    throw new NotFoundError("Organization");
  }

  res.json(org);
}
```

### Error Classes

```typescript
// 400 Bad Request
throw new BadRequestError("Invalid email format");

// 401 Unauthorized
throw new UnauthorizedError(); // Default message: "Unauthorized"

// 403 Forbidden
throw new ForbiddenError();

// 404 Not Found
throw new NotFoundError("User");

// 409 Conflict
throw new ConflictError("Email already exists");

// 422 Validation Error
throw new ValidationError("Invalid input", { field: "email", reason: "Invalid format" });

// 429 Quota Exceeded
throw new QuotaExceededError("api_requests", 1000);
```

### Error Handler Middleware

The error handler is registered in `src/app.ts` and automatically catches all errors:

```typescript
import { errorHandler } from "./middleware/error-handler";

// ... routes ...

app.use(errorHandler);
```

### Migrating Old Code

**Before:**

```typescript
try {
  const org = await service.get(id);
  if (!org) {
    res.status(404).json({ error: { message: "Organization not found" } });
    return;
  }
  res.json(org);
} catch (error) {
  res.status(400).json({ error: { message: (error as Error).message } });
}
```

**After:**

```typescript
const org = await service.get(id);
if (!org) {
  throw new NotFoundError("Organization");
}
res.json(org);
```

The error handler middleware catches the error and formats the response automatically.
