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

// BUG-99 / BUG-107 (codex r18): full runtime-config shape served by
// /v1/public-config. Validates an unknown JSON payload via a type
// guard (no `as` cast — CLAUDE.md bans them) so a malformed response
// from a stale API doesn't pollute state.
interface PublicConfig {
  publishable_key: string | null;
  tenant_id: string;
  sign_in_url: string;
  sign_up_url: string;
  sign_in_force_redirect_url: string | null;
  sign_in_fallback_redirect_url: string;
  sign_up_force_redirect_url: string | null;
  sign_up_fallback_redirect_url: string;
  proxy_url: string | null;
  telemetry_disabled: boolean;
}
function isPublicConfig(value: unknown): value is PublicConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.tenant_id === "string" &&
    typeof v.sign_in_url === "string" &&
    typeof v.sign_up_url === "string" &&
    typeof v.sign_in_fallback_redirect_url === "string" &&
    typeof v.sign_up_fallback_redirect_url === "string" &&
    typeof v.telemetry_disabled === "boolean"
  );
}

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
  // BUG-96 / BUG-98 / BUG-99 (codex r18): NEXT_PUBLIC_* envs are frozen
  // at `next build`. Single-image multi-env Docker deploys override
  // them at runtime by reading `/v1/public-config`. The full config
  // (publishable key, tenant, sign-in/up URLs, force/fallback redirect
  // URLs, proxy URL) is held in one state object so all consumers
  // (apiClient auth header, openSignIn callbacks, embedded forms) see
  // a consistent runtime view. `runtimeConfigReady` gates the userinfo
  // hydration so we don't fire it with the build-time placeholder
  // before the override lands.
  const needsRuntimeFetch = buildTimeKey === "pk_build_placeholder" || !tenantId;
  const [config, setConfig] = useState<PublicConfig>(() => ({
    publishable_key: buildTimeKey === "pk_build_placeholder" ? null : buildTimeKey,
    tenant_id: buildTimeTenant,
    sign_in_url: getSignInUrl(),
    sign_up_url: getSignUpUrl(),
    sign_in_force_redirect_url: getSignInForceRedirectUrl() ?? null,
    sign_in_fallback_redirect_url: getSignInFallbackRedirectUrl(),
    sign_up_force_redirect_url: getSignUpForceRedirectUrl() ?? null,
    sign_up_fallback_redirect_url: getSignUpFallbackRedirectUrl(),
    proxy_url: null,
    telemetry_disabled: false,
  }));
  const [runtimeConfigReady, setRuntimeConfigReady] = useState(!needsRuntimeFetch);
  const key = config.publishable_key ?? buildTimeKey;
  const resolvedTenantId = config.tenant_id;

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

  // BUG-96 / BUG-98 / BUG-99 / BUG-107 (codex r18): runtime-config
  // fetch + typed-guard parse. When needsRuntimeFetch is false, the
  // ready-gate flips immediately so we don't pay a network hop. When
  // true, hydrate from /v1/public-config; on failure, fall back to the
  // build-time values (already loaded) so the SDK still functions.
  useEffect(() => {
    if (!needsRuntimeFetch) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/v1/public-config", { credentials: "include" });
        if (!res.ok || cancelled) {
          if (!cancelled) setRuntimeConfigReady(true);
          return;
        }
        const raw: unknown = await res.json();
        if (cancelled) return;
        if (isPublicConfig(raw)) {
          setConfig((prev) => ({
            ...raw,
            // Respect caller-supplied props as overrides.
            publishable_key: publishableKey ?? raw.publishable_key,
            tenant_id: tenantId ?? raw.tenant_id,
            // Keep prev value if /v1/public-config doesn't change it.
            proxy_url: raw.proxy_url ?? prev.proxy_url,
          }));
        }
      } catch {
        // Network failure — fall through to ready with build-time defaults.
      } finally {
        if (!cancelled) setRuntimeConfigReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [needsRuntimeFetch, publishableKey, tenantId]);

  useEffect(() => {
    // BUG-98 (codex r18): wait for runtime config to land — otherwise
    // the first /v1/userinfo call fires with the placeholder publish-
    // able key and the wrong tenant id.
    if (!runtimeConfigReady) return;
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
    // BUG-98 (codex r18): include resolvedTenantId so a runtime tenant
    // change re-hydrates userinfo (previously only [key] was tracked,
    // so a tenant-only update silently kept the old userinfo state).
  }, [key, resolvedTenantId, runtimeConfigReady]);

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

  // BUG-85 / BUG-94 (round-2 sweep) / BUG-99 (codex r18): redirect
  // precedence is `force > caller-supplied > fallback`, and ALL three
  // values are sourced from `config` (which incorporates runtime
  // overrides from /v1/public-config) — not from build-time env reads
  // — so single-image multi-env deploys see consistent values.
  const openSignIn = useCallback(
    (options?: { afterSignInUrl?: string }) => {
      const base = config.sign_in_url;
      const force = config.sign_in_force_redirect_url;
      const target = force ?? options?.afterSignInUrl ?? config.sign_in_fallback_redirect_url;
      const url = target === "/" ? base : `${base}?redirect_url=${encodeURIComponent(target)}`;
      window.location.href = url;
    },
    [config.sign_in_url, config.sign_in_force_redirect_url, config.sign_in_fallback_redirect_url],
  );

  const openSignUp = useCallback(
    (options?: { afterSignUpUrl?: string }) => {
      const base = config.sign_up_url;
      const force = config.sign_up_force_redirect_url;
      const target = force ?? options?.afterSignUpUrl ?? config.sign_up_fallback_redirect_url;
      const url = target === "/" ? base : `${base}?redirect_url=${encodeURIComponent(target)}`;
      window.location.href = url;
    },
    [config.sign_up_url, config.sign_up_force_redirect_url, config.sign_up_fallback_redirect_url],
  );

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
