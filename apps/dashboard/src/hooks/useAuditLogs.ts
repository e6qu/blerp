import { useQuery } from "@tanstack/react-query";
import { client } from "../lib/api";

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit_logs"],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/audit_logs", {});
      if (error) throw error;
      return data?.data || [];
    },
  });
}
