import { useQuery } from "@tanstack/react-query";
import { client } from "../lib/api";

export interface AuditLogFilters {
  action?: string;
  actor_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: ["audit_logs", filters],
    queryFn: async () => {
      const query: Record<string, string> = {};
      if (filters?.action) query.action = filters.action;
      if (filters?.actor_id) query.actor_id = filters.actor_id;
      if (filters?.start_date) query.start_date = filters.start_date;
      if (filters?.end_date) query.end_date = filters.end_date;
      if (filters?.limit) query.limit = String(filters.limit);
      if (filters?.offset) query.offset = String(filters.offset);

      const { data, error } = await client.GET("/v1/audit_logs", {
        params: { query },
      });
      if (error) throw error;
      return {
        logs: data?.data || [],
        total: (data as { meta?: { total: number } })?.meta?.total ?? 0,
      };
    },
  });
}
