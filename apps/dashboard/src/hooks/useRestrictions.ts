import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
      const params: Record<string, string> = {};
      if (type) params.type = type;
      const response = await fetch(`/v1/signup-restrictions${type ? `?type=${type}` : ""}`, {
        headers: {
          "X-Tenant-Id": "demo-tenant",
          "X-User-Id": "user_demo",
        },
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
      const response = await fetch("/v1/signup-restrictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": "demo-tenant",
          "X-User-Id": "user_demo",
        },
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
      const response = await fetch(`/v1/signup-restrictions/${id}`, {
        method: "DELETE",
        headers: {
          "X-Tenant-Id": "demo-tenant",
          "X-User-Id": "user_demo",
        },
      });
      if (!response.ok) throw new Error("Failed to delete restriction");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restrictions"] });
    },
  });
}
