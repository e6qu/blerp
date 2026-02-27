"use client";

import React, { useState } from "react";

export interface TaskSetupMFAProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TaskSetupMFA({ onSuccess, onCancel }: TaskSetupMFAProps) {
  const [step, setStep] = useState<"choose" | "totp" | "backup" | "complete">("choose");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetupTotp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/mfa/totp/setup", { method: "POST" });
      if (res.ok) {
        setStep("totp");
      } else {
        setError("Failed to start MFA setup");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/mfa/totp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });
      const data = (await res.json()) as { backup_codes?: string[] };
      if (res.ok && data.backup_codes) {
        setBackupCodes(data.backup_codes);
        setStep("backup");
      } else {
        setError("Invalid verification code");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupCodesConfirmed = () => {
    setStep("complete");
    onSuccess?.();
  };

  if (step === "complete") {
    return (
      <div className="mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Two-factor authentication enabled</h2>
        <p className="text-sm text-gray-600">
          Your account is now protected with two-factor authentication.
        </p>
      </div>
    );
  }

  if (step === "backup") {
    return (
      <div className="mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-gray-900">Save your backup codes</h2>
        <p className="mb-4 text-sm text-gray-600">
          Store these codes in a safe place. You can use them to access your account if you lose
          your authenticator device.
        </p>

        <div className="mb-6 rounded-md bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {backupCodes.map((code, index) => (
              <div key={index} className="text-gray-700">
                {code}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleBackupCodesConfirmed}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          I&apos;ve saved my backup codes
        </button>
      </div>
    );
  }

  if (step === "totp") {
    return (
      <div className="mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-gray-900">Set up authenticator app</h2>
        <p className="mb-4 text-sm text-gray-600">
          Scan the QR code with your authenticator app, then enter the 6-digit code below.
        </p>

        <div className="mb-6 flex justify-center">
          <div className="flex h-40 w-40 items-center justify-center rounded-md bg-gray-100">
            <span className="text-xs text-gray-500">QR Code</span>
          </div>
        </div>

        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-center font-mono text-lg tracking-widest shadow-sm focus:border-blue-500 focus:outline-none"
              maxLength={6}
            />
          </div>
          <button
            onClick={handleVerifyCode}
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm">
      <h2 className="mb-2 text-xl font-bold text-gray-900">Two-factor authentication</h2>
      <p className="mb-6 text-sm text-gray-600">
        Add an extra layer of security to your account by enabling two-factor authentication.
      </p>

      {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="space-y-4">
        <button
          onClick={handleSetupTotp}
          disabled={isLoading}
          className="flex w-full items-center justify-between rounded-md border border-gray-200 p-4 hover:bg-gray-50"
        >
          <div className="text-left">
            <p className="font-medium text-gray-900">Authenticator app</p>
            <p className="text-sm text-gray-500">
              Use an authenticator app to get verification codes
            </p>
          </div>
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
