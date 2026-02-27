"use client";

import React, { useState } from "react";

export interface TaskResetPasswordProps {
  redirectUrl?: string;
  onReset?: () => void;
}

export function TaskResetPassword({ redirectUrl = "/sign-in", onReset }: TaskResetPasswordProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("sent");
        onReset?.();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "sent") {
    return (
      <div className="mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Check your email</h2>
        <p className="text-sm text-gray-600">
          If an account with {email} exists, you&apos;ll receive a password reset link shortly.
        </p>
        <button
          onClick={() => (window.location.href = redirectUrl)}
          className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm">
      <h2 className="mb-2 text-xl font-bold text-gray-900">Reset your password</h2>
      <p className="mb-6 text-sm text-gray-600">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      {status === "error" && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          Something went wrong. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Remember your password?{" "}
        <a href={redirectUrl} className="font-medium text-blue-600 hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}
