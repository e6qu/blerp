"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface BlerpContextType {
  userId: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
}

const BlerpContext = createContext<BlerpContextType | undefined>(undefined);

export function BlerpProvider({
  children,
  publishableKey,
}: {
  children: React.ReactNode;
  publishableKey: string;
}) {
  const [state, setState] = useState<BlerpContextType>({
    userId: null,
    isLoaded: false,
    isSignedIn: false,
  });

  useEffect(() => {
    // In a real implementation, this would fetch the session from the Blerp API
    // or parse it from a cookie.
    setState({
      userId: null, // Placeholder
      isLoaded: true,
      isSignedIn: false,
    });
  }, [publishableKey]);

  return <BlerpContext.Provider value={state}>{children}</BlerpContext.Provider>;
}

export function useAuth() {
  const context = useContext(BlerpContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a BlerpProvider");
  }
  return context;
}
