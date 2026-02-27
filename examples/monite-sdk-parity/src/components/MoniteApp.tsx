"use client";

import React, { useMemo } from "react";
import { MoniteSDK } from "@monite/sdk-api";
import { MoniteProvider, Payables } from "@monite/sdk-react";

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

  return (
    // @ts-expect-error - React 19 type compatibility issue with Monite SDK
    <MoniteProvider monite={monite}>
      <div className="space-y-8">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">Payables (Official Monite SDK)</h2>
          {/* @ts-expect-error - React 19 type compatibility issue with Monite SDK */}
          <Payables />
        </div>
      </div>
    </MoniteProvider>
  );
}
