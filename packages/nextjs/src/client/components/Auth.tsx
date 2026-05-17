"use client";

import { useState, type SyntheticEvent } from "react";
import { setSessionCookies } from "../session-cookies";
import { useAuth, useBlerpClient } from "../BlerpProvider";
import { getSignUpUrl } from "@blerp/shared";

// BUG-116 (codex r20): add a "totp" second-factor step. The API
// returns `needs_second_factor` for users with TOTP enabled; without
// this step the embedded <SignIn> ate the response and left the user
// staring at a frozen Sign-in button.
type SignInStep = "email" | "password" | "totp";

interface SignInProps {
  routing?: "path" | "hash" | "virtual";
  path?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
  signUpUrl?: string;
  appearance?: Record<string, unknown>;
}

const SIGN_UP_URL = getSignUpUrl();

// BUG-109 (codex r19): honor `?redirect_url=...` injected by the
// middleware/openSignIn redirect chain. Reading inside the handler
// (not at module load) so server-side `next build` doesn't crash on
// the missing `window`.
//
// BUG-208 (codex r60): validate before returning. An attacker can
// link to `https://yourapp.com/sign-in?redirect_url=https://evil.com`
// and the post-auth navigation in `handlePasswordSubmit` /
// `handleTotpSubmit` would otherwise send the authenticated user
// to the attacker's domain — open-redirect / phishing. The
// middleware-generated values are always relative paths, so the
// safe set is: relative paths (start with `/` and NOT `//`, which
// is protocol-relative and could escape origin) OR absolute URLs
// whose origin matches `window.location.origin`. Anything else is
// dropped to undefined so the caller falls through to the runtime-
// config redirect resolution (BUG-201).
function isSafeRedirect(value: string): boolean {
  // Relative path. Reject `//host` (protocol-relative) and `/\…`
  // (path that some browsers treat as protocol-relative too).
  if (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return true;
  }
  // Absolute URL — must match current origin.
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

function readRedirectQueryParam(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const v = new URLSearchParams(window.location.search).get("redirect_url");
  if (!v || v.trim() === "") return undefined;
  return isSafeRedirect(v) ? v : undefined;
}

export function SignIn({ afterSignInUrl, signUpUrl = SIGN_UP_URL }: SignInProps) {
  const client = useBlerpClient();
  // BUG-185 (codex r50): runtime-resolver from BlerpProvider — see
  // session-verify / runtime-config rationale in BlerpProvider.tsx.
  const { resolveSignInRedirect } = useAuth();
  const [step, setStep] = useState<SignInStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signinId, setSigninId] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data, error: apiError } = await client.POST("/v1/auth/signins", {
        body: { identifier: email, strategy: "password" },
      });

      if (apiError) {
        const errorData = apiError as { error?: { message?: string } };
        setError(errorData.error?.message ?? "Failed to sign in");
      } else {
        setSigninId((data as { id: string }).id);
        setStep("password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data, error: apiError } = await client.POST("/v1/auth/signins/{signin_id}/attempt", {
        params: { path: { signin_id: signinId! } },
        body: { password, identifier: email },
      });

      if (apiError) {
        const errorData = apiError as { error?: { message?: string } };
        setError(errorData.error?.message ?? "Invalid credentials");
      } else {
        const response = data as {
          session?: { id: string };
          tokens?: { access_token: string };
          status?: string;
          signin_id?: string;
        };
        // BUG-116 (codex r20): MFA branch — server says
        // `needs_second_factor` for TOTP users. Transition the UI to
        // the totp step; the next submit hits the same attempt
        // endpoint with `{ code }`.
        if (response.status === "needs_second_factor") {
          setStep("totp");
        } else if (response.session) {
          if (response.tokens?.access_token) {
            setSessionCookies(response.tokens.access_token);
          }
          // BUG-101 (codex r18) / BUG-109 (codex r19): apply
          // `force > prop > redirect_url query > env fallback` precedence,
          // matching Clerk's documented redirect ordering.
          const target = afterSignInUrl ?? readRedirectQueryParam();
          window.location.assign(resolveSignInRedirect(target));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // BUG-116 (codex r20): second-factor submit. Auth controller routes
  // `{ code }` (no password / no identifier) into attemptSecondFactor.
  const handleTotpSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      // BUG-130 (codex r24): send explicit `strategy: "totp"` + `stage:
      // "second_factor"`. Without these, the service falls back to
      // permissive try-both, so a backup code typed into the TOTP-
      // labeled UI would silently succeed and consume a recovery code.
      // The TOTP UI here is exclusively for authenticator-app codes.
      const { data, error: apiError } = await client.POST("/v1/auth/signins/{signin_id}/attempt", {
        params: { path: { signin_id: signinId! } },
        body: { code: totpCode, strategy: "totp", stage: "second_factor" },
      });
      if (apiError) {
        const errorData = apiError as { error?: { message?: string } };
        setError(errorData.error?.message ?? "Invalid verification code");
      } else {
        const response = data as {
          session?: { id: string };
          tokens?: { access_token: string };
        };
        if (response.tokens?.access_token) {
          setSessionCookies(response.tokens.access_token);
        }
        if (response.session) {
          const target = afterSignInUrl ?? readRedirectQueryParam();
          window.location.assign(resolveSignInRedirect(target));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "github" | "google") => {
    const { data, error: apiError } = await client.GET("/v1/auth/oauth/{provider}", {
      params: {
        path: { provider },
        query: { redirect_uri: window.location.origin + "/callback" },
      },
    });

    if (apiError) {
      setError("Failed to initiate OAuth");
    } else if (data && (data as { url?: string }).url) {
      window.location.assign((data as { url: string }).url);
    }
  };

  const handleBack = () => {
    setStep("email");
    setPassword("");
    setError(null);
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Sign in to your account</h2>

      {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {step === "email" && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <button
              onClick={() => handleOAuth("github")}
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              GitHub
            </button>
            <button
              onClick={() => handleOAuth("google")}
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="blerp-signin-email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="blerp-signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Checking..." : "Continue"}
            </button>
          </form>
        </>
      )}

      {step === "password" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <button
            type="button"
            onClick={handleBack}
            className="mb-2 flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </button>

          <p className="text-sm text-gray-600">
            Signing in as <span className="font-medium">{email}</span>
          </p>

          <div>
            <label
              htmlFor="blerp-signin-password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="blerp-signin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      )}

      {/* BUG-116 (codex r20): TOTP second-factor step. */}
      {step === "totp" && (
        <form onSubmit={handleTotpSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app.
          </p>

          <div>
            <label htmlFor="blerp-signin-totp" className="block text-sm font-medium text-gray-700">
              Verification code
            </label>
            <input
              id="blerp-signin-totp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || totpCode.length !== 6}
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <a href={signUpUrl} className="font-medium text-blue-600 hover:text-blue-500">
          Sign up
        </a>
      </p>
    </div>
  );
}
