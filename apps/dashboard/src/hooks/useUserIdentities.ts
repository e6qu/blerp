/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/api";

export function useUserIdentities(userId: string) {
  return useQuery({
    queryKey: ["identities", userId],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/users/{user_id}/identities" as any, {
        params: { path: { user_id: userId } },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUnlinkIdentity(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (oauthAccountId: string) => {
      const { error } = await client.DELETE(
        "/v1/users/{user_id}/identities/oauth/{oauth_account_id}" as any,
        {
          params: { path: { user_id: userId, oauth_account_id: oauthAccountId } },
        },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identities", userId] });
    },
  });
}
