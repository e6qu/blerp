# Repointing Clerk SDKs to Blerp

Blerp is designed to be a drop-in replacement for the Clerk API. This guide explains how to configure the official Clerk SDKs to point at your Blerp instance.

## React SDK (@clerk/clerk-react)

To use the Blerp API with the React SDK, you need to set the `clerkJSVariant` or use the `publishableKey` with a custom domain.

```tsx
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = "pk_test_...";

function App() {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      clerkJSUrl="http://localhost:3000/v1/clerk.js" // Mocked ClerkJS
    >
      <YourApp />
    </ClerkProvider>
  );
}
```

## Backend SDK (@clerk/clerk-sdk-node)

Set the following environment variables to repoint the backend SDK:

```bash
CLERK_API_URL=http://localhost:3000/v1
CLERK_SECRET_KEY=sk_test_...
```

## JavaScript SDK (ClerkJS)

If you are using the script tag integration:

```html
<script
  async
  crossorigin="anonymous"
  data-clerk-publishable-key="pk_test_..."
  src="http://localhost:3000/v1/clerk.js"
  type="text/javascript"
></script>
```

## Caveats

- **Domain Validation**: Ensure your Blerp instance allows the origin from which the SDK is making requests.
- **Header Expectations**: Blerp expects `X-Tenant-Id` for multi-tenant isolation. When using unmodified SDKs, you may need a proxy or middleware to inject this header based on the API Key prefix or domain.
