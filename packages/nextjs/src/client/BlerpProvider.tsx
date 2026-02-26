"use client";

import React, { createContext, useContext, useMemo } from "react";
import createClient from "openapi-fetch";
import type { paths } from "@blerp/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

interface BlerpContextType {
  userId: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  client: ReturnType<typeof createClient<paths>>;
}

const BlerpContext = createContext<BlerpContextType | undefined>(undefined);

export function BlerpProvider({
  children,
  publishableKey,
}: {
  children: React.ReactNode;
  publishableKey: string;
}) {
  const apiClient = useMemo(() => {
    return createClient<paths>({
      baseUrl: "/",
      headers: {
        Authorization: `Bearer ${publishableKey}`,
      },
    });
  }, [publishableKey]);

  const state = useMemo(
    () => ({
      userId: null,
      isLoaded: true,
      isSignedIn: false,
      client: apiClient,
    }),
    [apiClient],
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
  const { userId, isLoaded, isSignedIn } = context;
  return { userId, isLoaded, isSignedIn };
}

export function useBlerpClient() {
  const context = useContext(BlerpContext);
  if (context === undefined) {
    throw new Error("useBlerpClient must be used within a BlerpProvider");
  }
  return context.client;
}
