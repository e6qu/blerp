"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import createClient from "openapi-fetch";
import type { paths } from "@blerp/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getPublishableKeyOrBuildPlaceholder } from "./env.js";

const queryClient = new QueryClient();

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

  const apiClient = useMemo(() => {
    return createClient<paths>({
      baseUrl: "/",
      headers: {
        Authorization: `Bearer ${key}`,
        "X-Tenant-Id": activeOrgId || "default",
      },
    });
  }, [key, activeOrgId]);

  const setActive = async (options: { organization?: string | null }) => {
    if (options.organization === undefined) return;
    if (options.organization === null) {
      Cookies.remove("__blerp_org");
      setActiveOrgId(null);
    } else {
      Cookies.set("__blerp_org", options.organization);
      setActiveOrgId(options.organization);
    }
  };

  const has = (_check: { permission?: string; role?: string }) => {
    return true;
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (error) {
      console.error("Sign out failed:", error);
    }
    Cookies.remove("__blerp_org");
    setActiveOrgId(null);
  };

  const openSignIn = (options?: { afterSignInUrl?: string }) => {
    const url = options?.afterSignInUrl
      ? `/sign-in?redirect_url=${encodeURIComponent(options.afterSignInUrl)}`
      : "/sign-in";
    window.location.href = url;
  };

  const openSignUp = (options?: { afterSignUpUrl?: string }) => {
    const url = options?.afterSignUpUrl
      ? `/sign-up?redirect_url=${encodeURIComponent(options.afterSignUpUrl)}`
      : "/sign-up";
    window.location.href = url;
  };

  const openUserProfile = () => {
    window.location.href = "/user-profile";
  };

  const openOrganizationProfile = () => {
    window.location.href = "/organization-profile";
  };

  const state = useMemo(
    () => ({
      userId: null,
      orgId: activeOrgId,
      orgRole: null,
      orgPermissions: [] as string[],
      isLoaded: true,
      isSignedIn: false,
      client: apiClient,
      setActive,
      has,
      signOut,
      openSignIn,
      openSignUp,
      openUserProfile,
      openOrganizationProfile,
    }),
    [apiClient, activeOrgId],
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
