# Next.js Integration

This tutorial shows how to integrate Blerp authentication into a Next.js application using the `@blerp/nextjs` SDK.

## Prerequisites

- Next.js 13+ (App Router recommended)
- Node.js 18+
- A running Blerp instance
- API keys from your Blerp dashboard

## Installation

Install the Blerp Next.js SDK:

```bash
npm install @blerp/nextjs
# or
bun add @blerp/nextjs
```

## Configuration

### 1. Environment Variables

Create a `.env.local` file in your Next.js project:

```bash
# Blerp Configuration
NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY=pk_test_demo
BLERP_SECRET_KEY=sk_test_demo
NEXT_PUBLIC_BLERP_API_URL=http://localhost:3000
BLERP_TENANT_ID=demo-project

# Optional: JWT verification
BLERP_JWT_SECRET=your-jwt-secret
```

### 2. Create Blerp Client

Create a Blerp client instance:

```typescript
// lib/blerp.ts
import { createBlerpClient } from "@blerp/nextjs";

export const blerp = createBlerpClient({
  publishableKey: process.env.NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY!,
  apiUrl: process.env.NEXT_PUBLIC_BLERP_API_URL!,
  tenantId: process.env.BLERP_TENANT_ID!,
});

export const blerpServer = createBlerpClient({
  secretKey: process.env.BLERP_SECRET_KEY!,
  apiUrl: process.env.NEXT_PUBLIC_BLERP_API_URL!,
  tenantId: process.env.BLERP_TENANT_ID!,
});
```

## Authentication Setup

### 1. Sign-In Page

Create a sign-in page with email/password authentication:

```typescript
// app/sign-in/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { blerp } from '@/lib/blerp';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Start sign-in flow
      const signup = await blerp.auth.signups.create({
        email,
        strategy: 'password',
        password,
      });

      if (signup.status === 'needs_verification') {
        // Redirect to verification page
        router.push(`/verify?signup_id=${signup.id}`);
      } else if (signup.status === 'complete') {
        // User is signed in
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSignIn} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Sign In</h1>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
```

### 2. Email Verification Page

```typescript
// app/verify/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { blerp } from '@/lib/blerp';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupId = searchParams.get('signup_id');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await blerp.auth.signups.attempt(signupId!, {
        code,
      });

      if (result.status === 'complete') {
        // Store session token
        localStorage.setItem('blerp_session', result.session_token!);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleVerify} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Verify Email</h1>
        <p>Enter the 6-digit code sent to your email</p>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full text-center text-2xl tracking-widest rounded-md border px-3 py-2"
          placeholder="000000"
          maxLength={6}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          disabled={code.length !== 6}
        >
          Verify
        </button>
      </form>
    </div>
  );
}
```

## Session Management

### 1. Session Context

Create a session context for your app:

```typescript
// context/auth.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { blerp } from '@/lib/blerp';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const sessionToken = localStorage.getItem('blerp_session');
    if (!sessionToken) {
      setLoading(false);
      return;
    }

    try {
      const userData = await blerp.client.user.get(sessionToken);
      setUser({
        id: userData.id,
        email: userData.email_addresses[0]?.email || '',
        firstName: userData.first_name,
        lastName: userData.last_name,
      });
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('blerp_session');
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('blerp_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 2. Wrap App with Provider

```typescript
// app/layout.tsx
import { AuthProvider } from '@/context/auth';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

## Protected Routes

### 1. Middleware Protection

Create middleware to protect routes:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("blerp_session");

  // Protected paths
  const protectedPaths = ["/dashboard", "/profile", "/settings"];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath && !sessionToken) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*"],
};
```

### 2. Server-Side Protection

For server components:

```typescript
// app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { blerpServer } from '@/lib/blerp';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('blerp_session');

  if (!sessionToken) {
    redirect('/sign-in');
  }

  let user;
  try {
    user = await blerpServer.users.get(sessionToken.value);
  } catch (error) {
    redirect('/sign-in');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user.first_name || user.email_addresses[0]?.email}!</p>
    </div>
  );
}
```

## Working with Organizations

### Display User Organizations

```typescript
// app/dashboard/organizations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { blerp } from '@/lib/blerp';
import { useAuth } from '@/context/auth';

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export default function OrganizationsPage() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    const sessionToken = localStorage.getItem('blerp_session');
    const orgs = await blerp.client.organizations.list(sessionToken!);
    setOrganizations(orgs);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Your Organizations</h1>

      <div className="grid gap-4">
        {organizations.map((org) => (
          <div key={org.id} className="border rounded-lg p-4">
            <h2 className="font-semibold">{org.name}</h2>
            <p className="text-sm text-gray-600">{org.slug}</p>
            <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {org.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Create Organization

```typescript
const handleCreateOrganization = async (name: string, slug: string) => {
  const sessionToken = localStorage.getItem("blerp_session");

  try {
    const org = await blerp.organizations.create(
      {
        name,
        slug,
      },
      sessionToken!,
    );

    console.log("Created organization:", org);
    router.push(`/dashboard/organizations/${org.id}`);
  } catch (error) {
    console.error("Failed to create organization:", error);
  }
};
```

## API Route Handlers

### Example: Webhook Handler

```typescript
// app/api/webhooks/blerp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const WEBHOOK_SECRET = process.env.BLERP_WEBHOOK_SECRET!;

function verifySignature(payload: string, signature: string): boolean {
  const expectedSignature = createHmac("sha256", WEBHOOK_SECRET).update(payload).digest("hex");
  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("x-blerp-signature") || "";

  if (!verifySignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload);

  // Handle different event types
  switch (event.type) {
    case "user.created":
      console.log("User created:", event.data.id);
      // Sync to your database
      break;
    case "user.deleted":
      console.log("User deleted:", event.data.id);
      // Remove from your database
      break;
    // ... handle other events
  }

  return NextResponse.json({ received: true });
}
```

## Best Practices

### 1. Session Storage

Store session tokens securely:

```typescript
// Store in httpOnly cookie for production
// In development, localStorage is acceptable
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  // Use secure, httpOnly cookies via API route
  await fetch("/api/auth/session", {
    method: "POST",
    body: JSON.stringify({ sessionToken }),
  });
} else {
  localStorage.setItem("blerp_session", sessionToken);
}
```

### 2. Error Handling

```typescript
try {
  const user = await blerp.client.user.get(sessionToken);
} catch (error) {
  if (error.status === 401) {
    // Session expired, redirect to sign in
    router.push("/sign-in");
  } else {
    // Handle other errors
    console.error("Failed to fetch user:", error);
  }
}
```

### 3. Loading States

```typescript
function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <SignInPrompt />;
  }

  return <Profile user={user} />;
}
```

## TypeScript Support

The `@blerp/nextjs` package includes TypeScript definitions:

```typescript
import type { User, Organization, Session } from '@blerp/nextjs';

function UserProfile({ user }: { user: User }) {
  return <div>{user.email_addresses[0]?.email}</div>;
}
```

## Next Steps

- **API Usage Tutorial** - Learn more about available endpoints
- **Data Setup Tutorial** - Set up organizations and users
- **API Reference** - Complete endpoint documentation

## Troubleshooting

### CORS Errors

If you see CORS errors, ensure your Blerp instance has your Next.js app's domain in `allowed_origins`:

```bash
curl -X PUT http://localhost:3000/v1/projects/demo-project \
  -H "Authorization: Bearer sk_test_demo" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: demo-project" \
  -d '{
    "allowed_origins": [
      "http://localhost:3000",
      "http://localhost:3001"
    ]
  }'
```

### Session Not Persisting

Ensure you're storing and sending the session token correctly:

```typescript
// Always include the session token in requests
const sessionToken = localStorage.getItem("blerp_session");
if (!sessionToken) {
  router.push("/sign-in");
  return;
}

// Use the token in API calls
const user = await blerp.client.user.get(sessionToken);
```

### Server-Side Rendering Issues

For SSR pages, avoid using localStorage. Use cookies instead:

```typescript
// In a server component
import { cookies } from "next/headers";

export default async function ServerPage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("blerp_session");

  if (!sessionToken) {
    // Handle unauthenticated state
  }

  // ...
}
```
