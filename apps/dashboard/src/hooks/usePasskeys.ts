import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, getCsrfToken, DEMO_USER_ID } from "../lib/api";

export function usePasskeys() {
  return useQuery({
    queryKey: ["passkeys"],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/auth/webauthn/passkeys", {});
      if (error) throw error;
      return data?.data || [];
    },
  });
}

export function useRegisterPasskey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!window.PublicKeyCredential) {
        throw new Error("WebAuthn is not available in this browser");
      }

      const { data: optionsData, error: optError } = await client.GET(
        "/v1/auth/webauthn/registration/options",
        {},
      );
      if (optError) throw optError;

      const options = optionsData as {
        challenge: string;
        rp: PublicKeyCredentialRpEntity;
        user: PublicKeyCredentialUserEntity;
        pubKeyCredParams: PublicKeyCredentialParameters[];
      };

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: Uint8Array.from(atob(options.challenge), (c) => c.charCodeAt(0)),
          rp: options.rp,
          user: {
            ...options.user,
            id: Uint8Array.from(atob(options.user.id as unknown as string), (c) => c.charCodeAt(0)),
          },
          pubKeyCredParams: options.pubKeyCredParams,
        },
      })) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error("Passkey registration was cancelled");
      }

      const { data, error } = await client.POST("/v1/auth/webauthn/registration/verify", {
        body: { id: credential.id, name },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
    },
  });
}

export function useDeletePasskey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (passkeyId: string) => {
      const token = await getCsrfToken();
      const headers: Record<string, string> = {
        "X-Tenant-Id": "demo-tenant",
        "X-User-Id": DEMO_USER_ID,
      };
      if (token) {
        headers["x-csrf-token"] = token;
      }
      const response = await fetch(`/v1/auth/webauthn/passkeys/${passkeyId}`, {
        method: "DELETE",
        headers,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to delete passkey");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
    },
  });
}
