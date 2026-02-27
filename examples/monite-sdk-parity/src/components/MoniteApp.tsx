"use client";

import React, { useMemo, ElementType } from "react";
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

  const MoniteProviderCast = MoniteProvider as unknown as ElementType;
  const PayablesCast = Payables as unknown as ElementType;

  return (
    <MoniteProviderCast monite={monite}>
      <div className="space-y-8">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">Payables (Official Monite SDK)</h2>
          <PayablesCast />
        </div>
      </div>
    </MoniteProviderCast>
  );
}
