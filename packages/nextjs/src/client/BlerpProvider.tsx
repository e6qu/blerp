"use client";

import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "@blerp/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getPublishableKeyOrBuildPlaceholder } from "./env.js";

const queryClient = new QueryClient();

let csrfToken: string | undefined;

async function fetchCsrfToken(tenantId?: string): Promise<string | undefined> {
  try {
    const headers: Record<string, string> = {};
    if (tenantId) headers["X-Tenant-Id"] = tenantId;
    const sessionToken = Cookies.get("__blerp_session");
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
}: {
  children: React.ReactNode;
  publishableKey?: string;
}) {
  const key = publishableKey ?? getPublishableKeyOrBuildPlaceholder();

  const [activeOrgId, setActiveOrgId] = useState<string | null>(
    () => Cookies.get("__blerp_org") || null,
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [orgRole, setOrgRole] = useState<string | null>(null);
  const [orgPermissions, setOrgPermissions] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const apiClient = useMemo(() => {
    const sessionToken = Cookies.get("__blerp_session");
    const authHeader = sessionToken ? `Bearer ${sessionToken}` : `Bearer ${key}`;
    const c = createClient<paths>({
      baseUrl: "/",
      credentials: "include",
      headers: {
        Authorization: authHeader,
        "X-Tenant-Id": activeOrgId || "default",
      },
    });
    c.use(createCsrfMiddleware(activeOrgId));
    return c;
  }, [key, activeOrgId]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const sessionToken = Cookies.get("__blerp_session");
        const authHeader = sessionToken ? `Bearer ${sessionToken}` : `Bearer ${key}`;

        const response = await fetch("/v1/userinfo", {
          credentials: "include",
          headers: {
            Authorization: authHeader,
          },
        });

        if (cancelled) return;

        if (response.ok) {
          const data = await response.json();
          setUserId(data.sub ?? null);
          setOrgRole(data.org_role ?? null);
          setOrgPermissions(data.org_permissions ?? []);
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
    Cookies.remove("__blerp_session");
    Cookies.remove("__blerp_org");
    setActiveOrgId(null);
    setUserId(null);
    setOrgRole(null);
    setOrgPermissions([]);
  }, []);

  const openSignIn = useCallback((options?: { afterSignInUrl?: string }) => {
    const url = options?.afterSignInUrl
      ? `/sign-in?redirect_url=${encodeURIComponent(options.afterSignInUrl)}`
      : "/sign-in";
    window.location.href = url;
  }, []);

  const openSignUp = useCallback((options?: { afterSignUpUrl?: string }) => {
    const url = options?.afterSignUpUrl
      ? `/sign-up?redirect_url=${encodeURIComponent(options.afterSignUpUrl)}`
      : "/sign-up";
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
