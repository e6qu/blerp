import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/api";
import type { components } from "@blerp/shared";

type APIKey = components["schemas"]["APIKey"];
type Project = components["schemas"]["Project"];

const PROJECT_ID = "demo-project";

export function useProject() {
  return useQuery({
    queryKey: ["project", PROJECT_ID],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/projects/{project_id}", {
        params: { path: { project_id: PROJECT_ID } },
      });
      if (error) throw error;
      return data as Project;
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name?: string }) => {
      const { data, error } = await client.PUT("/v1/projects/{project_id}", {
        params: { path: { project_id: PROJECT_ID } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", PROJECT_ID] });
    },
  });
}

export function useDeleteProject() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await client.DELETE("/v1/projects/{project_id}", {
        params: { path: { project_id: PROJECT_ID } },
      });
      if (error) throw error;
    },
  });
}

export function useApiKeys(filters?: {
  environment?: "development" | "staging" | "production";
  type?: "publishable" | "secret";
}) {
  return useQuery({
    queryKey: ["apiKeys", filters],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/projects/{project_id}/keys", {
        params: {
          path: { project_id: PROJECT_ID },
          query: filters,
        },
      });
      if (error) throw error;
      return (data?.data || []) as APIKey[];
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      environment: "development" | "staging" | "production";
      type: "publishable" | "secret";
      label?: string;
    }) => {
      const { data, error } = await client.POST("/v1/projects/{project_id}/keys", {
        params: { path: { project_id: PROJECT_ID } },
        body,
      });
      if (error) throw error;
      return data as APIKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
  });
}

export function useRotateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (keyId: string) => {
      const { data, error } = await client.POST("/v1/projects/{project_id}/keys/{key_id}/rotate", {
        params: { path: { project_id: PROJECT_ID, key_id: keyId } },
      });
      if (error) throw error;
      return data as APIKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await client.DELETE("/v1/projects/{project_id}/keys/{key_id}", {
        params: { path: { project_id: PROJECT_ID, key_id: keyId } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
  });
}
