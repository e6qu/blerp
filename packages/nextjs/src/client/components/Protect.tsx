"use client";

import React from "react";
import { useAuth } from "../BlerpProvider";

interface ProtectProps {
  children: React.ReactNode;
  permission?: string;
  role?: string;
  fallback?: React.ReactNode;
}

export function Protect({ children, permission, role, fallback = null }: ProtectProps) {
  const { isLoaded, isSignedIn, has } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return fallback as React.ReactElement;

  const isAuthorized = has({ permission, role });

  if (!isAuthorized) {
    return fallback as React.ReactElement;
  }

  return <>{children}</>;
}
