"use client";

import React from "react";
import { useAuth } from "../BlerpProvider";
import { useUser } from "../hooks";
import {
  appendRedirectUrl,
  getSignInFallbackRedirectUrl,
  getSignInUrl,
  getSignUpUrl,
  resolveSignInRedirect,
} from "@blerp/shared";

export interface SignedInProps {
  children: React.ReactNode;
}

export function SignedIn({ children }: SignedInProps) {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) return null;
  return <>{children}</>;
}

export interface SignedOutProps {
  children: React.ReactNode;
}

export function SignedOut({ children }: SignedOutProps) {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return null;
  return <>{children}</>;
}

export interface ClerkLoadedProps {
  children: React.ReactNode;
}

export function ClerkLoaded({ children }: ClerkLoadedProps) {
  const { isLoaded } = useAuth();
  if (!isLoaded) return null;
  return <>{children}</>;
}

export interface ClerkLoadingProps {
  children: React.ReactNode;
}

export function ClerkLoading({ children }: ClerkLoadingProps) {
  const { isLoaded } = useAuth();
  if (isLoaded) return null;
  return <>{children}</>;
}

export interface RedirectToSignInProps {
  signInUrl?: string;
  afterSignInUrl?: string;
}

// BUG-86 / BUG-102 (codex r18): defaults derived from env helpers.
const SIGN_IN_URL_DEFAULT = getSignInUrl();
const SIGN_UP_URL_DEFAULT = getSignUpUrl();

export function RedirectToSignIn({
  signInUrl = SIGN_IN_URL_DEFAULT,
  afterSignInUrl,
}: RedirectToSignInProps) {
  const { isSignedIn } = useAuth();

  React.useEffect(() => {
    if (!isSignedIn) {
      // BUG-117 (codex r20): URL constructor handles pre-existing query strings.
      window.location.href = appendRedirectUrl(signInUrl, afterSignInUrl);
    }
  }, [isSignedIn, signInUrl, afterSignInUrl]);

  return null;
}

export interface RedirectToSignUpProps {
  signUpUrl?: string;
  afterSignUpUrl?: string;
}

export function RedirectToSignUp({
  signUpUrl = SIGN_UP_URL_DEFAULT,
  afterSignUpUrl,
}: RedirectToSignUpProps) {
  const { isSignedIn } = useAuth();

  React.useEffect(() => {
    if (!isSignedIn) {
      window.location.href = appendRedirectUrl(signUpUrl, afterSignUpUrl);
    }
  }, [isSignedIn, signUpUrl, afterSignUpUrl]);

  return null;
}

export interface RedirectToUserProfileProps {
  userProfileUrl?: string;
}

export function RedirectToUserProfile({
  userProfileUrl = "/user-profile",
}: RedirectToUserProfileProps) {
  const { isSignedIn } = useAuth();

  React.useEffect(() => {
    if (isSignedIn) {
      window.location.href = userProfileUrl;
    }
  }, [isSignedIn, userProfileUrl]);

  return null;
}

export interface RedirectToOrganizationProfileProps {
  organizationProfileUrl?: string;
}

export function RedirectToOrganizationProfile({
  organizationProfileUrl = "/organization-profile",
}: RedirectToOrganizationProfileProps) {
  const { isSignedIn } = useAuth();

  React.useEffect(() => {
    if (isSignedIn) {
      window.location.href = organizationProfileUrl;
    }
  }, [isSignedIn, organizationProfileUrl]);

  return null;
}

export interface RedirectToCreateOrganizationProps {
  createOrganizationUrl?: string;
}

export function RedirectToCreateOrganization({
  createOrganizationUrl = "/create-organization",
}: RedirectToCreateOrganizationProps) {
  const { isSignedIn } = useAuth();

  React.useEffect(() => {
    if (isSignedIn) {
      window.location.href = createOrganizationUrl;
    }
  }, [isSignedIn, createOrganizationUrl]);

  return null;
}

export function useSessionClaim(claim: string): unknown {
  const { user } = useUser();
  if (!user) return undefined;
  return (user as Record<string, unknown>)[claim];
}

export interface AuthenticateWithRedirectCallbackProps {
  signInUrl?: string;
  signUpUrl?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
}

export function AuthenticateWithRedirectCallback({
  signInUrl = SIGN_IN_URL_DEFAULT,
  signUpUrl = SIGN_UP_URL_DEFAULT,
}: AuthenticateWithRedirectCallbackProps) {
  const { isSignedIn } = useAuth();

  React.useEffect(() => {
    if (isSignedIn) return;

    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("__clerk_status");
    const redirectUrl = urlParams.get("redirect_url");

    if (status === "verified") {
      // BUG-102 (codex r18): apply Clerk's force > query > fallback
      // precedence (matches resolveSignInRedirect).
      window.location.href = resolveSignInRedirect(
        redirectUrl ?? undefined,
        getSignInFallbackRedirectUrl(),
      );
      return;
    }

    if (status === "failed" || status === "expired") {
      window.location.href = signInUrl;
      return;
    }

    const hasSignUpIntent = urlParams.get("__clerk_created_session");
    if (hasSignUpIntent) {
      window.location.href = signUpUrl;
      return;
    }
  }, [isSignedIn, signInUrl, signUpUrl]);

  return null;
}
