"use client";

import React from "react";
import { useAuth } from "../BlerpProvider";
import { useUser } from "../hooks";
import { appendRedirectUrl } from "@blerp/shared";

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

// BUG-203 (codex r58): the previous module-level
// SIGN_IN_URL_DEFAULT / SIGN_UP_URL_DEFAULT were resolved once at
// import time from the build-time env, so single-image multi-env
// Docker deploys that override `CLERK_SIGN_*_URL` via /v1/public-
// config never saw the runtime value. They're gone — components
// now delegate to the BlerpProvider's `openSignIn` / `openSignUp`
// which await the runtime-config gate and read from
// `latestConfigRef` (BUG-190 / BUG-201).

export function RedirectToSignIn({ signInUrl, afterSignInUrl }: RedirectToSignInProps) {
  const { isSignedIn, openSignIn } = useAuth();

  React.useEffect(() => {
    if (isSignedIn) return;
    if (signInUrl) {
      // Caller supplied an explicit URL — honor it verbatim
      // (build-time semantics preserved).
      // BUG-117 (codex r20): URL constructor handles pre-existing query strings.
      window.location.href = appendRedirectUrl(signInUrl, afterSignInUrl);
      return;
    }
    // Default: delegate to the provider's `openSignIn`. It awaits
    // the runtime-config gate and resolves the URL from the
    // hydrated `config.sign_in_url` (BUG-201), so single-image
    // multi-env deploys honor `CLERK_SIGN_IN_URL` overrides. We
    // don't await — `openSignIn` navigates internally.
    void openSignIn({ afterSignInUrl });
  }, [isSignedIn, signInUrl, afterSignInUrl, openSignIn]);

  return null;
}

export interface RedirectToSignUpProps {
  signUpUrl?: string;
  afterSignUpUrl?: string;
}

export function RedirectToSignUp({ signUpUrl, afterSignUpUrl }: RedirectToSignUpProps) {
  const { isSignedIn, openSignUp } = useAuth();

  React.useEffect(() => {
    if (isSignedIn) return;
    if (signUpUrl) {
      window.location.href = appendRedirectUrl(signUpUrl, afterSignUpUrl);
      return;
    }
    // BUG-203 (codex r58): see RedirectToSignIn — delegate to
    // openSignUp so runtime-config overrides are honored.
    void openSignUp({ afterSignUpUrl });
  }, [isSignedIn, signUpUrl, afterSignUpUrl, openSignUp]);

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
  signInUrl,
  signUpUrl,
}: AuthenticateWithRedirectCallbackProps) {
  // BUG-185 (codex r50): use the runtime-config resolver from the
  // provider instead of `resolveSignInRedirect` from `@blerp/shared`.
  // Build-time env reads would ignore /v1/public-config overrides.
  // BUG-203 (codex r58): same problem for the failed/expired/sign-up
  // intent paths. Delegate to `openSignIn` / `openSignUp` when the
  // caller doesn't supply an explicit URL — they await the runtime-
  // config gate and resolve from `latestConfigRef` (BUG-201). Caller-
  // supplied URLs are used verbatim (build-time semantics preserved).
  const { isSignedIn, resolveSignInRedirect, openSignIn, openSignUp } = useAuth();

  React.useEffect(() => {
    if (isSignedIn) return;

    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("__clerk_status");
    const redirectUrl = urlParams.get("redirect_url");

    if (status === "verified") {
      // BUG-102 (codex r18): apply Clerk's force > query > fallback
      // precedence (matches resolveSignInRedirect).
      window.location.href = resolveSignInRedirect(redirectUrl ?? undefined);
      return;
    }

    if (status === "failed" || status === "expired") {
      if (signInUrl) {
        window.location.href = signInUrl;
      } else {
        void openSignIn();
      }
      return;
    }

    const hasSignUpIntent = urlParams.get("__clerk_created_session");
    if (hasSignUpIntent) {
      if (signUpUrl) {
        window.location.href = signUpUrl;
      } else {
        void openSignUp();
      }
      return;
    }
  }, [isSignedIn, signInUrl, signUpUrl, resolveSignInRedirect, openSignIn, openSignUp]);

  return null;
}
