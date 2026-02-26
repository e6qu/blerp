/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/api";

export function usePasskeys() {
  return useQuery({
    queryKey: ["passkeys"],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/auth/webauthn/passkeys" as any, {});
      if (error) throw error;
      return (data as any).data;
    },
  });
}

export function useRegisterPasskey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error: optError } = await client.GET(
        "/v1/auth/webauthn/registration/options" as any,
        {},
      );
      if (optError) throw optError;

      const { data, error } = await client.POST("/v1/auth/webauthn/registration/verify" as any, {
        body: { id: "mock_cred_id", name },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
    },
  });
}
