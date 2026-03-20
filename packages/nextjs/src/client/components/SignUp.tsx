"use client";

import React, { useState } from "react";
import { useBlerpClient } from "../BlerpProvider";

type SignUpStep = "email" | "password";

interface SignUpProps {
  routing?: "path" | "hash" | "virtual";
  path?: string;
  afterSignUpUrl?: string;
  afterSignInUrl?: string;
  signInUrl?: string;
  appearance?: Record<string, unknown>;
}

export function SignUp({ afterSignUpUrl = "/", signInUrl = "/sign-in" }: SignUpProps) {
  const client = useBlerpClient();
  const [step, setStep] = useState<SignUpStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupId, setSignupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data, error: apiError } = await client.POST("/v1/auth/signups", {
        body: { email, strategy: "password" },
      });

      if (apiError) {
        const errorData = apiError as { error?: { message?: string } };
        setError(errorData.error?.message ?? "Failed to create account");
      } else {
        setSignupId((data as { id: string }).id);
        setStep("password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data, error: apiError } = await client.POST("/v1/auth/signups/{signup_id}/attempt", {
        params: { path: { signup_id: signupId! } },
        body: { code: password, email },
      });

      if (apiError) {
        const errorData = apiError as { error?: { message?: string } };
        setError(errorData.error?.message ?? "Failed to complete signup");
      } else if ((data as { session?: unknown }).session) {
        window.location.assign(afterSignUpUrl);
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
            {isSubmitting ? "Creating account..." : "Create account"}
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
