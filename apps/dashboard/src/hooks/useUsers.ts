import { useQuery } from "@tanstack/react-query";
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
