import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, getSessionUserId } from "../lib/api";
import type { components } from "@blerp/shared";

type User = components["schemas"]["User"];

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "current"],
    queryFn: async () => {
      const userId = getSessionUserId();
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await client.GET("/v1/users/{user_id}", {
        params: { path: { user_id: userId } },
      });
      if (error) throw error;
      return data as User;
    },
  });
}

export function useUser(userId: string | null) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await client.GET("/v1/users/{user_id}", {
        params: { path: { user_id: userId } },
      });
      if (error) throw error;
      return data as User;
    },
    enabled: !!userId,
  });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      first_name?: string;
      last_name?: string;
      username?: string;
      password?: string;
      status?: "active" | "inactive" | "banned";
    }) => {
      const userId = getSessionUserId();
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await client.PATCH("/v1/users/{user_id}", {
        params: { path: { user_id: userId } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });
    },
  });
}
