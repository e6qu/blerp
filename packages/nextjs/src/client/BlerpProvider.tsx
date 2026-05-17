"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "@blerp/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getPublishableKeyOrBuildPlaceholder } from "./env.js";
import {
  appendRedirectUrl,
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
  // BUG-112 (codex r19): validate every field — including the four
  // nullable string fields. A malformed `publishable_key` (e.g. a
  // number) would otherwise propagate to the Authorization header
  // when stringified.
  const stringOrNull = (x: unknown): boolean => x === null || typeof x === "string";
  return (
    typeof v.tenant_id === "string" &&
    typeof v.sign_in_url === "string" &&
    typeof v.sign_up_url === "string" &&
    typeof v.sign_in_fallback_redirect_url === "string" &&
    typeof v.sign_up_fallback_redirect_url === "string" &&
    typeof v.telemetry_disabled === "boolean" &&
    stringOrNull(v.publishable_key) &&
    stringOrNull(v.sign_in_force_redirect_url) &&
    stringOrNull(v.sign_up_force_redirect_url) &&
    stringOrNull(v.proxy_url)
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
  // BUG-108 (codex r19): now async — waits on runtime config before
  // redirecting. Callers can ignore the returned promise; matches
  // Clerk's own typed signature for these methods.
  openSignIn: (options?: { afterSignInUrl?: string }) => Promise<void>;
  openSignUp: (options?: { afterSignUpUrl?: string }) => Promise<void>;
  openUserProfile: () => void;
  openOrganizationProfile: () => void;
  // BUG-185 (codex r50): embedded <SignIn>/<SignUp>/<Control> must
  // resolve redirects against the runtime-hydrated config (BUG-96),
  // not the build-time `resolveSignInRedirect` from `@blerp/shared`.
  // Pre-r50 the imperative `openSignIn()` honored runtime overrides
  // (`CLERK_SIGN_IN_FORCE_REDIRECT_URL` set via /v1/public-config)
  // while the rendered form silently ignored them on submit.
  resolveSignInRedirect: (callerSupplied?: string) => string;
  resolveSignUpRedirect: (callerSupplied?: string) => string;
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

  // BUG-108 (codex r19): every consumer of config (apiClient requests,
  // openSignIn / openSignUp redirects) must wait for runtimeConfigReady
  // before acting — otherwise an immediate API call or redirect fires
  // with the placeholder key / wrong URL. A ref-held promise lets us
  // expose `await` from both the openapi-fetch middleware and the
  // imperative callbacks. The resolver is captured once on mount and
  // resolved by the runtime-config effect (or immediately when no
  // fetch is needed).
  const readyResolverRef = useRef<(() => void) | null>(null);
  const readyPromiseRef = useRef<Promise<void> | null>(null);
  if (readyPromiseRef.current === null) {
    readyPromiseRef.current = needsRuntimeFetch
      ? new Promise<void>((resolve) => {
          readyResolverRef.current = resolve;
        })
      : Promise.resolve();
  }
  const markReady = useCallback(() => {
    setRuntimeConfigReady(true);
    if (readyResolverRef.current) {
      readyResolverRef.current();
      readyResolverRef.current = null;
    }
  }, []);

  const key = config.publishable_key ?? buildTimeKey;
  const resolvedTenantId = config.tenant_id;

  const [activeOrgId, setActiveOrgId] = useState<string | null>(
    () => Cookies.get("__blerp_org") || null,
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [orgRole, setOrgRole] = useState<string | null>(null);
  const [orgPermissions, setOrgPermissions] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // BUG-180 (codex r48): the openapi-fetch Request is built at
  // `client.GET(...)` call time with the headers from `createClient`'s
  // `headers` option. A child that fires a request before runtime
  // config lands captures the placeholder publishable key into the
  // Authorization header; awaiting the readyPromise in the middleware
  // only delays the send, it doesn't refresh the headers. Use a ref
  // that mirrors the latest resolved values so the middleware can
  // re-stamp Authorization + X-Tenant-Id after the gate resolves.
  const latestAuthRef = useRef<{ authHeader: string; tenantId: string }>({
    authHeader: `Bearer ${key}`,
    tenantId: resolvedTenantId,
  });
  useEffect(() => {
    const sessionToken = readSessionCookie();
    latestAuthRef.current = {
      authHeader: sessionToken ? `Bearer ${sessionToken}` : `Bearer ${key}`,
      tenantId: resolvedTenantId,
    };
  }, [key, resolvedTenantId]);

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
    // BUG-108 (codex r19): block every request until runtime config is
    // ready. Without this, a child component that fires `client.GET(...)`
    // on mount would issue the request with the placeholder publishable
    // key in the Authorization header.
    //
    // BUG-180 (codex r48): after the gate resolves, re-stamp the auth +
    // tenant headers from the latest ref. Without the re-stamp, the
    // in-flight Request still carries the headers it was constructed
    // with (often the placeholder `pk_build_placeholder` Authorization
    // and the build-time tenant id), and the first call after gate
    // resolution ships stale credentials.
    c.use({
      async onRequest({ request }) {
        if (readyPromiseRef.current) await readyPromiseRef.current;
        request.headers.set("Authorization", latestAuthRef.current.authHeader);
        request.headers.set("X-Tenant-Id", latestAuthRef.current.tenantId);
        return request;
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
          if (!cancelled) markReady();
          return;
        }
        const raw: unknown = await res.json();
        if (cancelled) return;
        if (isPublicConfig(raw)) {
          // BUG-190 (codex r53): update `latestAuthRef` SYNCHRONOUSLY
          // with the resolved values *before* `markReady()` releases
          // the gate. Pre-r53 the ref was only updated by a follow-up
          // useEffect on `[key, resolvedTenantId]`, which doesn't fire
          // until React commits the `setConfig` below. The middleware
          // released by `markReady` would then restamp from the STALE
          // ref (still `pk_build_placeholder` / build-time tenant),
          // defeating the BUG-180 re-stamp fix. Compute the next ref
          // value from the resolved `raw` config directly + the
          // caller-supplied prop overrides.
          const resolvedKey = publishableKey ?? raw.publishable_key;
          const resolvedTenant = tenantId ?? raw.tenant_id;
          const sessionToken = readSessionCookie();
          latestAuthRef.current = {
            authHeader: sessionToken
              ? `Bearer ${sessionToken}`
              : `Bearer ${resolvedKey ?? "pk_build_placeholder"}`,
            tenantId: resolvedTenant,
          };
          setConfig((prev) => ({
            ...raw,
            // Respect caller-supplied props as overrides.
            publishable_key: resolvedKey,
            tenant_id: resolvedTenant,
            // Keep prev value if /v1/public-config doesn't change it.
            proxy_url: raw.proxy_url ?? prev.proxy_url,
          }));
        }
      } catch {
        // Network failure — fall through to ready with build-time defaults.
      } finally {
        if (!cancelled) markReady();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [needsRuntimeFetch, publishableKey, tenantId, markReady]);

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
  // BUG-108 (codex r19): also wait on readyPromiseRef before navigating,
  // so a click during the narrow [mount → /v1/public-config resolves]
  // window doesn't redirect to the build-time placeholder URL.
  const openSignIn = useCallback(
    async (options?: { afterSignInUrl?: string }) => {
      if (readyPromiseRef.current) await readyPromiseRef.current;
      const base = config.sign_in_url;
      const force = config.sign_in_force_redirect_url;
      const target = force ?? options?.afterSignInUrl ?? config.sign_in_fallback_redirect_url;
      // BUG-117 (codex r20): use appendRedirectUrl — handles a base
      // that already has a query string (e.g. /sign-in?theme=dark)
      // without producing the double-`?` malformation.
      window.location.href = appendRedirectUrl(base, target);
    },
    [config.sign_in_url, config.sign_in_force_redirect_url, config.sign_in_fallback_redirect_url],
  );

  const openSignUp = useCallback(
    async (options?: { afterSignUpUrl?: string }) => {
      if (readyPromiseRef.current) await readyPromiseRef.current;
      const base = config.sign_up_url;
      const force = config.sign_up_force_redirect_url;
      const target = force ?? options?.afterSignUpUrl ?? config.sign_up_fallback_redirect_url;
      window.location.href = appendRedirectUrl(base, target);
    },
    [config.sign_up_url, config.sign_up_force_redirect_url, config.sign_up_fallback_redirect_url],
  );

  // BUG-185 (codex r50): resolve embedded-form redirects against the
  // runtime-hydrated `config` rather than the build-time
  // `resolveSignInRedirect` / `resolveSignUpRedirect` from
  // `@blerp/shared`. Same `force > callerSupplied > fallback`
  // precedence as the imperative `openSignIn` / `openSignUp` above —
  // single-image multi-env deploys that override
  // CLERK_SIGN_*_FORCE_REDIRECT_URL via /v1/public-config now see
  // their override honored from the rendered <SignIn>/<SignUp> submit
  // handler as well.
  const resolveSignInRedirect = useCallback(
    (callerSupplied?: string): string =>
      config.sign_in_force_redirect_url ?? callerSupplied ?? config.sign_in_fallback_redirect_url,
    [config.sign_in_force_redirect_url, config.sign_in_fallback_redirect_url],
  );

  const resolveSignUpRedirect = useCallback(
    (callerSupplied?: string): string =>
      config.sign_up_force_redirect_url ?? callerSupplied ?? config.sign_up_fallback_redirect_url,
    [config.sign_up_force_redirect_url, config.sign_up_fallback_redirect_url],
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
      resolveSignInRedirect,
      resolveSignUpRedirect,
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
      resolveSignInRedirect,
      resolveSignUpRedirect,
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
