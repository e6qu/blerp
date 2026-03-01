import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, DEMO_USER_ID } from "../lib/api";
import type { components } from "@blerp/shared";

type User = components["schemas"]["User"];

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "current"],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/users/{user_id}", {
        params: { path: { user_id: DEMO_USER_ID } },
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
      const { data, error } = await client.PATCH("/v1/users/{user_id}", {
        params: { path: { user_id: DEMO_USER_ID } },
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
