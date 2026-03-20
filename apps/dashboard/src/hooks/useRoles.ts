import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders, getCsrfToken } from "../lib/api";

interface CustomRole {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  is_default: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export function useRoles(organizationId: string) {
  return useQuery({
    queryKey: ["roles", organizationId],
    queryFn: async () => {
      const response = await fetch(`/v1/organizations/${organizationId}/roles`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to load roles");
      const data = await response.json();
      return data.data as CustomRole[];
    },
    enabled: !!organizationId,
  });
}

export function useCreateRole(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; description?: string; permissions: string[] }) => {
      const token = await getCsrfToken();
      const headers: Record<string, string> = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      };
      if (token) headers["x-csrf-token"] = token;
      const response = await fetch(`/v1/organizations/${organizationId}/roles`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message ?? "Failed to create role");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles", organizationId] });
    },
  });
}

export function useUpdateRole(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roleId,
      ...body
    }: {
      roleId: string;
      name?: string;
      description?: string;
      permissions?: string[];
    }) => {
      const token = await getCsrfToken();
      const headers: Record<string, string> = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      };
      if (token) headers["x-csrf-token"] = token;
      const response = await fetch(`/v1/organizations/${organizationId}/roles/${roleId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message ?? "Failed to update role");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles", organizationId] });
    },
  });
}

export function useDeleteRole(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roleId: string) => {
      const token = await getCsrfToken();
      const headers: Record<string, string> = {
        ...getAuthHeaders(),
      };
      if (token) headers["x-csrf-token"] = token;
      const response = await fetch(`/v1/organizations/${organizationId}/roles/${roleId}`, {
        method: "DELETE",
        headers,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message ?? "Failed to delete role");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles", organizationId] });
    },
  });
}
