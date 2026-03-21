"use client";

import React, { useMemo, ElementType, Component, type ReactNode } from "react";
import { MoniteSDK } from "@monite/sdk-api";
import { MoniteProvider, Payables } from "@monite/sdk-react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

// Suppress Emotion's ":first-child" SSR warning that crashes Next.js dev overlay
const emotionCache = createCache({
  key: "monite",
  prepend: true,
});

// Prevent the original console.error from stylis ":first-child" warning
// from triggering Next.js dev overlay — it's a known emotion/Next.js incompatibility
const originalConsoleError = console.error;
if (typeof window !== "undefined") {
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes(":first-child") && msg.includes("potentially unsafe")) {
      return; // Suppress this specific known warning
    }
    originalConsoleError.apply(console, args);
  };
}

// Error boundary to prevent Monite SDK errors from crashing the page
class MoniteErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-bold text-red-800">Monite SDK Error</h2>
          <p className="text-sm text-red-600">{this.state.error}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function MoniteApp({ entityId }: { entityId: string }) {
  const monite = useMemo(() => {
    return new MoniteSDK({
      entityId,
      fetchToken: async () => {
        const res = await fetch("/api/auth/token");
        if (!res.ok) throw new Error("Failed to fetch token");
        return res.json();
      },
      headers: {
        "x-monite-version": "2023-03-14",
      },
    });
  }, [entityId]);

  const MoniteProviderCast = MoniteProvider as unknown as ElementType;
  const PayablesCast = Payables as unknown as ElementType;

  return (
    <MoniteErrorBoundary>
      <CacheProvider value={emotionCache}>
        <MoniteProviderCast monite={monite}>
          <div className="space-y-8">
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-xl font-bold">Payables (Official Monite SDK)</h2>
              <PayablesCast />
            </div>
          </div>
        </MoniteProviderCast>
      </CacheProvider>
    </MoniteErrorBoundary>
  );
}
