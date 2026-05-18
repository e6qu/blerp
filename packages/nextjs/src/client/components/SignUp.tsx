"use client";

import { useState, type SyntheticEvent } from "react";
import { setSessionCookies } from "../session-cookies";
import { useAuth, useBlerpClient } from "../BlerpProvider";
import { readRedirectQueryParam } from "../safe-redirect";

// BUG-114 (codex r20): real three-step flow — email → password → verify.
// Previously the "password" step sent the password as the verification
// code, which never matched the OTP and sign-up always failed silently.
type SignUpStep = "email" | "password" | "verify";

interface SignUpProps {
  routing?: "path" | "hash" | "virtual";
  path?: string;
  afterSignUpUrl?: string;
  afterSignInUrl?: string;
  signInUrl?: string;
  appearance?: Record<string, unknown>;
}

// BUG-214 (codex r63): removed module-level `getSignInUrl()` —
// see Auth.tsx for the rationale. The component now reads
// `useAuth().signInUrl` (runtime-hydrated).

// BUG-109 (codex r19) / BUG-208 (codex r60): `readRedirectQueryParam`
// lives in `safe-redirect.ts` (lifted post-r68 from per-component
// duplicates). See Auth.tsx for the rationale.

export function SignUp({ afterSignUpUrl, signInUrl: signInUrlProp }: SignUpProps) {
  const client = useBlerpClient();
  // BUG-185 (codex r50): runtime-resolver from BlerpProvider — see
  // BlerpProvider.tsx for rationale.
  // BUG-214 (codex r63): also pull `signInUrl` from the runtime
  // context for the footer cross-link. Caller-supplied prop wins.
  const { resolveSignUpRedirect, signInUrl: contextSignInUrl } = useAuth();
  const signInUrl = signInUrlProp ?? contextSignInUrl;
  const [step, setStep] = useState<SignUpStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupId, setSignupId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [devVerificationCode, setDevVerificationCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    // Collect email → advance to password. Network call happens after
    // both email + password are entered (createSignup needs both).
    setStep("password");
  };

  const handlePasswordSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // BUG-114 (codex r20): pass `password` through to createSignup so
      // the API can install it on the user during verification.
      const { data, error: apiError } = await client.POST("/v1/auth/signups", {
        body: { email, password, strategy: "password" },
      });
      if (apiError) {
        const errorData = apiError as { error?: { message?: string } };
        setError(errorData.error?.message ?? "Failed to create account");
        return;
      }
      const created = data as { id: string; verification_code?: string };
      setSignupId(created.id);
      // Dev convenience: API echoes the code in non-production so the
      // demo flow doesn't require an email server.
      if (created.verification_code) setDevVerificationCode(created.verification_code);
      setStep("verify");
    } finally {
      setIsSubmitting(false);
    }
  };

  // BUG-114 (codex r20): verification step. Sends the OTP (not the
  // password) to `attemptSignup`. API returns `{ user_id, session,
  // tokens }`; redirect on user_id presence so we work even if a
  // future API version drops the session on this endpoint.
  const handleVerifySubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { data, error: apiError } = await client.POST("/v1/auth/signups/{signup_id}/attempt", {
        params: { path: { signup_id: signupId! } },
        body: { code: verificationCode },
      });
      if (apiError) {
        const errorData = apiError as { error?: { message?: string } };
        setError(errorData.error?.message ?? "Invalid verification code");
        return;
      }
      const response = data as {
        user_id?: string;
        session?: { id: string };
        tokens?: { access_token: string };
      };
      if (response.tokens?.access_token) {
        setSessionCookies(response.tokens.access_token);
      }
      if (response.user_id) {
        // BUG-101 / BUG-109: force > prop > query > env fallback.
        const target = afterSignUpUrl ?? readRedirectQueryParam();
        window.location.assign(resolveSignUpRedirect(target));
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
    if (step === "verify") {
      setStep("password");
      setVerificationCode("");
      setDevVerificationCode(null);
    } else {
      setStep("email");
      setPassword("");
    }
    setError(null);
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Create your account</h2>

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
                htmlFor="blerp-signup-email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="blerp-signup-email"
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
              {isSubmitting ? "Creating..." : "Continue"}
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
            Creating account for <span className="font-medium">{email}</span>
          </p>

          <div>
            <label
              htmlFor="blerp-signup-password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="blerp-signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              minLength={8}
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Sending code..." : "Continue"}
          </button>
        </form>
      )}

      {/* BUG-114 (codex r20): verification step. */}
      {step === "verify" && (
        <form onSubmit={handleVerifySubmit} className="space-y-4">
          <button
            type="button"
            onClick={handleBack}
            className="mb-2 flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </button>

          <p className="text-sm text-gray-600">
            We sent a 6-digit verification code to <span className="font-medium">{email}</span>.
          </p>

          {devVerificationCode && (
            <p className="rounded-md bg-yellow-50 p-2 text-xs text-yellow-800">
              Dev mode: code is <span className="font-mono">{devVerificationCode}</span>
            </p>
          )}

          <div>
            <label htmlFor="blerp-signup-code" className="block text-sm font-medium text-gray-700">
              Verification code
            </label>
            <input
              id="blerp-signup-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || verificationCode.length !== 6}
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Verifying..." : "Create account"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <a href={signInUrl} className="font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </a>
      </p>
    </div>
  );
}
