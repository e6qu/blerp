import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, getCsrfToken, getAuthHeaders, getSessionUserId } from "../lib/api";

interface TotpEnrollment {
  secret: string;
  uri: string;
  qr_code_url: string;
}

interface TotpVerification {
  verified: boolean;
  backup_codes: string[];
}

interface BackupCodesResponse {
  codes: string[];
}

export function useEnrollTotp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const userId = getSessionUserId();
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await client.POST("/v1/users/{user_id}/mfa/totp", {
        params: { path: { user_id: userId } },
      });
      if (error) throw error;
      return data as TotpEnrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });
    },
  });
}

export function useVerifyTotp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const userId = getSessionUserId();
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await client.POST("/v1/users/{user_id}/mfa/totp/verify", {
        params: { path: { user_id: userId } },
        body: { code },
      });
      if (error) throw error;
      return data as TotpVerification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });
    },
  });
}

export function useRegenerateBackupCodes() {
  return useMutation({
    mutationFn: async () => {
      const userId = getSessionUserId();
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await client.POST("/v1/users/{user_id}/mfa/backup_codes/regenerate", {
        params: { path: { user_id: userId } },
      });
      if (error) throw error;
      return data as BackupCodesResponse;
    },
  });
}

export function useDisableTotp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const userId = getSessionUserId();
      if (!userId) throw new Error("Not authenticated");
      const token = await getCsrfToken();
      const headers: Record<string, string> = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      };
      if (token) {
        headers["x-csrf-token"] = token;
      }
      const response = await fetch(`/v1/users/${userId}/mfa/totp`, {
        method: "DELETE",
        headers,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to disable TOTP");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });
    },
  });
}
