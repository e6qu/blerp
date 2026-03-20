import { useState } from "react";

interface MagicLinkResult {
  id: string;
  token: string;
  expires_at: string;
}

interface VerifyResult {
  session: { id: string; user_id: string; status: string };
  tokens: { access_token: string; refresh_token: string; expires_in: number; session_id: string };
}

export function useMagicLink() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMagicLink = async (email: string): Promise<MagicLinkResult | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/v1/auth/magic-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": "demo-tenant",
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const err = await response.json();
        setError(err.error?.message || "Failed to send magic link");
        return null;
      }
      return (await response.json()) as MagicLinkResult;
    } catch {
      setError("Failed to send magic link");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = async (token: string): Promise<VerifyResult | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/v1/auth/magic-links/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": "demo-tenant",
        },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        const err = await response.json();
        setError(err.error?.message || "Invalid or expired token");
        return null;
      }
      return (await response.json()) as VerifyResult;
    } catch {
      setError("Failed to verify token");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMagicLink, verifyToken, isLoading, error, setError };
}
