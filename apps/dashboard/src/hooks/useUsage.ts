/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { client } from "../lib/api";

export function useUsage() {
  return useQuery({
    queryKey: ["usage"],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/usage" as any, {});
      if (error) throw error;
      return data;
    },
  });
}
