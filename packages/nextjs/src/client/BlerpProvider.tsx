"use client";

import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "@blerp/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getPublishableKeyOrBuildPlaceholder } from "./env.js";
import {
  getSignInFallbackRedirectUrl,
  getSignInForceRedirectUrl,
  getSignInUrl,
  getSignUpFallbackRedirectUrl,
  getSignUpForceRedirectUrl,
  getSignUpUrl,
  getTenantId,
} from "@blerp/shared";
import { clearSessionCookies, readSessionCookie } from "./session-cookies";

const queryClient = new QueryClient();

let csrfToken: string | undefined;

async function fetchCsrfToken(tenantId?: string): Promise<string | undefined> {
  try {
    const headers: Record<string, string> = {};
    if (tenantId) headers["X-Tenant-Id"] = tenantId;
    const sessionToken = readSessionCookie();
    if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;
    const res = await fetch("/v1/csrf-token", { credentials: "include", headers });
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.csrfToken;
  } catch {
    return undefined;
  }
}

function createCsrfMiddleware(tenantId: string | null): Middleware {
  return {
    async onRequest({ request }) {
      const method = request.method.toUpperCase();
      if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
        if (!csrfToken) {
          csrfToken = await fetchCsrfToken(tenantId || "default");
        }
        if (csrfToken) {
          request.headers.set("x-csrf-token", csrfToken);
        }
      }
      return request;
    },
    async onResponse({ response }) {
      if (response.status === 403) {
        csrfToken = undefined;
      }
      return response;
    },
  };
}

type BlerpClient = ReturnType<typeof createClient<paths>>;

interface BlerpContextType {
  userId: string | null;
  orgId: string | null;
  orgRole: string | null;
  orgPermissions: string[];
  isLoaded: boolean;
  isSignedIn: boolean;
  client: BlerpClient;
  setActive: (options: { organization?: string | null }) => Promise<void>;
  has: (check: { permission?: string; role?: string }) => boolean;
  signOut: () => Promise<void>;
  openSignIn: (options?: { afterSignInUrl?: string }) => void;
  openSignUp: (options?: { afterSignUpUrl?: string }) => void;
  openUserProfile: () => void;
  openOrganizationProfile: () => void;
}

const BlerpContext = createContext<BlerpContextType | undefined>(undefined);

export function BlerpProvider({
  children,
  publishableKey,
  tenantId,
}: {
  children: React.ReactNode;
  publishableKey?: string;
  tenantId?: string;
}) {
  const buildTimeKey = publishableKey ?? getPublishableKeyOrBuildPlaceholder();
  const buildTimeTenant = tenantId ?? getTenantId();

  // BUG-81 (codex r17): use the shared getTenantId() helper so the
  // client tenant tracks the same env the server uses.
  //
  // BUG-96 (round-2 sweep): NEXT_PUBLIC_* envs are frozen at `next
  // build`. Single-image multi-env Docker deploys override them at
  // runtime by reading `/v1/public-config` (served by the API from
  // process.env evaluated per-request). When the build-time key is the
  // documented placeholder (pk_build_placeholder), we *must* refresh
  // before the first API call or the Authorization header is wrong.
  const [runtimeKey, setRuntimeKey] = useState(buildTimeKey);
  const [runtimeTenant, setRuntimeTenant] = useState(buildTimeTenant);
  const key = runtimeKey;
  const resolvedTenantId = runtimeTenant;

  const [activeOrgId, setActiveOrgId] = useState<string | null>(
    () => Cookies.get("__blerp_org") || null,
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [orgRole, setOrgRole] = useState<string | null>(null);
  const [orgPermissions, setOrgPermissions] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const apiClient = useMemo(() => {
    const sessionToken = readSessionCookie();
    const authHeader = sessionToken ? `Bearer ${sessionToken}` : `Bearer ${key}`;
    const c = createClient<paths>({
      baseUrl: "/",
      credentials: "include",
      headers: {
        Authorization: authHeader,
        "X-Tenant-Id": resolvedTenantId,
      },
    });
    c.use(createCsrfMiddleware(resolvedTenantId));
    return c;
  }, [key, activeOrgId, resolvedTenantId]);

  // BUG-96 (round-2 sweep): when the build-time key is the placeholder
  // OR the caller didn't pass an explicit tenant, fetch the runtime
  // config endpoint. Runs once on mount; the userinfo hydration below
  // is keyed off `key` so it re-runs after this completes.
  useEffect(() => {
    if (buildTimeKey !== "pk_build_placeholder" && tenantId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/v1/public-config", { credentials: "include" });
        if (!res.ok || cancelled) return;
        const cfg = (await res.json()) as {
          publishable_key?: string | null;
          tenant_id?: string;
        };
        if (cfg.publishable_key && buildTimeKey === "pk_build_placeholder") {
          setRuntimeKey(cfg.publishable_key);
        }
        if (cfg.tenant_id && !tenantId) {
          setRuntimeTenant(cfg.tenant_id);
        }
      } catch {
        // /v1/public-config unavailable — keep the build-time defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [buildTimeKey, tenantId]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const sessionToken = readSessionCookie();
        const authHeader = sessionToken ? `Bearer ${sessionToken}` : `Bearer ${key}`;

        const response = await fetch("/v1/userinfo", {
          credentials: "include",
          headers: {
            Authorization: authHeader,
            "X-Tenant-Id": resolvedTenantId,
          },
        });

        if (cancelled) return;

        if (response.ok) {
          const data = await response.json();
          const uid = data.sub ?? null;
          setUserId(uid);
          setOrgRole(data.org_role ?? null);
          setOrgPermissions(data.org_permissions ?? []);

          // BUG-76 (codex r12): use the /me sub-route (BUG-67) and
          // consume the API-returned `permissions` field verbatim. The
          // previous LIST-then-filter path had two problems mirrored
          // from the server side: (a) it required `members:read`, which
          // custom read-only roles lack (BUG-67), and (b) it derived
          // permissions locally via a hard-coded role→permission map
          // that disagreed with `apps/api/src/lib/rbac.ts` (admin had
          // `org:write` here but not server-side — BUG-63), causing
          // client-side `useAuth().has()` / `<Protect>` to overgrant.
          if (uid && activeOrgId && !data.org_role) {
            try {
              const memRes = await fetch(`/v1/organizations/${activeOrgId}/memberships/me`, {
                credentials: "include",
                headers: {
                  Authorization: authHeader,
                  "X-Tenant-Id": resolvedTenantId,
                },
              });
              if (memRes.ok) {
                const membership = (await memRes.json()) as {
                  role?: string;
                  permissions?: string[];
                };
                setOrgRole(membership.role ?? null);
                setOrgPermissions(
                  Array.isArray(membership.permissions) ? membership.permissions : [],
                );
              }
            } catch {
              // Membership lookup failed — continue without role
            }
          }
        } else {
          setUserId(null);
          setOrgRole(null);
          setOrgPermissions([]);
        }
      } catch {
        if (!cancelled) {
          setUserId(null);
          setOrgRole(null);
          setOrgPermissions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoaded(true);
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [key]);

  const setActive = useCallback(async (options: { organization?: string | null }) => {
    if (options.organization === undefined) return;
    if (options.organization === null) {
      Cookies.remove("__blerp_org");
      setActiveOrgId(null);
    } else {
      Cookies.set("__blerp_org", options.organization);
      setActiveOrgId(options.organization);
    }
  }, []);

  const has = useCallback(
    (check: { permission?: string; role?: string }) => {
      if (!userId) return false;
      if (check.role && orgRole !== check.role) return false;
      if (check.permission && !orgPermissions.includes(check.permission)) return false;
      return true;
    },
    [userId, orgRole, orgPermissions],
  );

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (error) {
      console.error("Sign out failed:", error);
    }
    clearSessionCookies();
    Cookies.remove("__blerp_org");
    setActiveOrgId(null);
    setUserId(null);
    setOrgRole(null);
    setOrgPermissions([]);
  }, []);

  // BUG-85 / BUG-94 (round-2 sweep): honor CLERK_SIGN_IN_URL,
  // CLERK_SIGN_UP_URL, and their FORCE/FALLBACK redirect-URL variants
  // (and BLERP_/NEXT_PUBLIC_/VITE_ aliases). Precedence inside this
  // callback:
  //   1. Explicit `options.afterSignInUrl` from the caller.
  //   2. `*_SIGN_IN_FORCE_REDIRECT_URL` — overrides everything below.
  //   3. `*_SIGN_IN_FALLBACK_REDIRECT_URL` — used when caller didn't
  //      pass a redirect target.
  // Clerk's `forceRedirectUrl` semantics: even when the caller passes a
  // redirect, the force value wins. Implemented identically.
  const openSignIn = useCallback((options?: { afterSignInUrl?: string }) => {
    const base = getSignInUrl();
    const force = getSignInForceRedirectUrl();
    const target = force ?? options?.afterSignInUrl ?? getSignInFallbackRedirectUrl();
    const url = target === "/" ? base : `${base}?redirect_url=${encodeURIComponent(target)}`;
    window.location.href = url;
  }, []);

  const openSignUp = useCallback((options?: { afterSignUpUrl?: string }) => {
    const base = getSignUpUrl();
    const force = getSignUpForceRedirectUrl();
    const target = force ?? options?.afterSignUpUrl ?? getSignUpFallbackRedirectUrl();
    const url = target === "/" ? base : `${base}?redirect_url=${encodeURIComponent(target)}`;
    window.location.href = url;
  }, []);

  const openUserProfile = useCallback(() => {
    window.location.href = "/user-profile";
  }, []);

  const openOrganizationProfile = useCallback(() => {
    window.location.href = "/organization-profile";
  }, []);

  const state = useMemo(
    () => ({
      userId,
      orgId: activeOrgId,
      orgRole,
      orgPermissions,
      isLoaded,
      isSignedIn: !!userId,
      client: apiClient,
      setActive,
      has,
      signOut,
      openSignIn,
      openSignUp,
      openUserProfile,
      openOrganizationProfile,
    }),
    [
      apiClient,
      activeOrgId,
      userId,
      orgRole,
      orgPermissions,
      isLoaded,
      setActive,
      has,
      signOut,
      openSignIn,
      openSignUp,
      openUserProfile,
      openOrganizationProfile,
    ],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BlerpContext.Provider value={state}>{children}</BlerpContext.Provider>
    </QueryClientProvider>
  );
}

export function useAuth() {
  const context = useContext(BlerpContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a BlerpProvider");
  }
  return context;
}

export function useBlerpClient() {
  const context = useContext(BlerpContext);
  if (context === undefined) {
    throw new Error("useBlerpClient must be used within a BlerpProvider");
  }
  return context.client;
}

export function useClerk() {
  const context = useContext(BlerpContext);
  if (context === undefined) {
    throw new Error("useClerk must be used within a BlerpProvider");
  }
  return {
    client: context.client,
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
    signOut: context.signOut,
    openSignIn: context.openSignIn,
    openSignUp: context.openSignUp,
    openUserProfile: context.openUserProfile,
    openOrganizationProfile: context.openOrganizationProfile,
    setActive: context.setActive,
    has: context.has,
  };
}
