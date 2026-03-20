import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, getSessionUserId, clearSession } from "../lib/api";

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const userId = getSessionUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await client.DELETE("/v1/users/{user_id}", {
        params: { path: { user_id: userId } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      clearSession();
      queryClient.clear();
      window.location.assign("/sign-in");
    },
  });
}
