"use client";

import { useQuery } from "@tanstack/react-query";
import { useBlerpClient } from "./BlerpProvider";

export function useOrganizations() {
  const client = useBlerpClient();
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/organizations", {});
      if (error) throw error;
      return data.data || [];
    },
  });
}
