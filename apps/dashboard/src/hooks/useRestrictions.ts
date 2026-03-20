import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders, getCsrfToken } from "../lib/api";

interface Restriction {
  id: string;
  type: "allowlist" | "blocklist";
  identifierType: "email" | "domain";
  value: string;
  createdAt: string;
}

export function useRestrictions(type?: "allowlist" | "blocklist") {
  return useQuery({
    queryKey: ["restrictions", type],
    queryFn: async () => {
      const response = await fetch(`/v1/signup-restrictions${type ? `?type=${type}` : ""}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch restrictions");
      const data = await response.json();
      return (data.data ?? []) as Restriction[];
    },
  });
}

export function useCreateRestriction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      type: "allowlist" | "blocklist";
      identifier_type: "email" | "domain";
      value: string;
    }) => {
      const token = await getCsrfToken();
      const headers: Record<string, string> = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      };
      if (token) headers["x-csrf-token"] = token;
      const response = await fetch("/v1/signup-restrictions", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Failed to create restriction");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restrictions"] });
    },
  });
}

export function useDeleteRestriction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getCsrfToken();
      const headers: Record<string, string> = {
        ...getAuthHeaders(),
      };
      if (token) headers["x-csrf-token"] = token;
      const response = await fetch(`/v1/signup-restrictions/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!response.ok) throw new Error("Failed to delete restriction");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restrictions"] });
    },
  });
}
