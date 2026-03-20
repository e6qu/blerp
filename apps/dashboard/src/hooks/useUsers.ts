import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/api";
import type { components } from "@blerp/shared";

type User = components["schemas"]["User"];

interface UseUsersOptions {
  status?: "active" | "inactive" | "banned";
  limit?: number;
  cursor?: string;
}

export function useUsers(options: UseUsersOptions = {}) {
  return useQuery({
    queryKey: ["users", options],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/users", {
        params: {
          query: {
            status: options.status,
            limit: options.limit,
            cursor: options.cursor,
          },
        },
      });
      if (error) throw error;
      return (data as { data: User[] })?.data || [];
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      first_name?: string;
      last_name?: string;
      username?: string;
      status?: "active" | "inactive" | "banned";
    }) => {
      const { userId, ...body } = params;
      const { data, error } = await client.PATCH("/v1/users/{user_id}", {
        params: { path: { user_id: userId } },
        body,
      });
      if (error) throw error;
      return data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useBulkUpdateUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { user_ids: string[]; action: "delete" | "ban" | "activate" }) => {
      const response = await fetch("/v1/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message ?? "Bulk operation failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
