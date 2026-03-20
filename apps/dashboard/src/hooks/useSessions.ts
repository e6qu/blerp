import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, getCsrfToken, getAuthHeaders } from "../lib/api";

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/sessions", {});
      if (error) throw error;
      return data?.data || [];
    },
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await client.DELETE("/v1/sessions/{session_id}", {
        params: { path: { session_id: sessionId } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = await getCsrfToken();
      const headers: Record<string, string> = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      };
      if (token) {
        headers["x-csrf-token"] = token;
      }
      const response = await fetch("/v1/sessions/revoke-all", {
        method: "POST",
        headers,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to revoke sessions");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
