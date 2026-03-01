import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, DEMO_USER_ID } from "../lib/api";

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
      const { data, error } = await client.POST("/v1/users/{user_id}/mfa/totp", {
        params: { path: { user_id: DEMO_USER_ID } },
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
      const { data, error } = await client.POST("/v1/users/{user_id}/mfa/totp/verify", {
        params: { path: { user_id: DEMO_USER_ID } },
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
      const { data, error } = await client.POST("/v1/users/{user_id}/mfa/backup_codes/regenerate", {
        params: { path: { user_id: DEMO_USER_ID } },
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
      const response = await fetch(`/api/v1/users/${DEMO_USER_ID}/mfa/totp`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
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
