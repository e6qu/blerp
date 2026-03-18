import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, DEMO_USER_ID } from "../lib/api";

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await client.DELETE("/v1/users/{user_id}", {
        params: { path: { user_id: DEMO_USER_ID } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.assign("/sign-in");
    },
  });
}
