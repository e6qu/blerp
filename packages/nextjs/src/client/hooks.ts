/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBlerpClient } from "./BlerpProvider";
import type { components } from "@blerp/shared";

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

export function useCreateOrganization() {
  const client = useBlerpClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; slug?: string; project_id: string }) => {
      const { data, error } = await client.POST("/v1/organizations", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useMemberships(organizationId: string) {
  const client = useBlerpClient();
  return useQuery({
    queryKey: ["memberships", organizationId],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/organizations/{organization_id}/memberships", {
        params: { path: { organization_id: organizationId } },
      });
      if (error) throw error;
      return (data as any).data as components["schemas"]["Membership"][];
    },
    enabled: !!organizationId,
  });
}

export function useInvitations(organizationId: string) {
  const client = useBlerpClient();
  return useQuery({
    queryKey: ["invitations", organizationId],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/invitations", {
        params: { query: { organization_id: organizationId } },
      });
      if (error) throw error;
      return (data as any).data as components["schemas"]["Invitation"][];
    },
    enabled: !!organizationId,
  });
}
