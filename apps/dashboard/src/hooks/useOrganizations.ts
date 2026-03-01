import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/api";
import type { components } from "@blerp/shared";

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/organizations", {});
      if (error) throw error;
      return data?.data || [];
    },
  });
}

export function useCreateOrganization() {
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
  return useQuery({
    queryKey: ["memberships", organizationId],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/organizations/{organization_id}/memberships", {
        params: { path: { organization_id: organizationId } },
      });
      if (error) throw error;
      return data?.data || [];
    },
    enabled: !!organizationId,
  });
}

export function useUpdateMembership(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ membershipId, role }: { membershipId: string; role: string }) => {
      const { data, error } = await client.PATCH(
        "/v1/organizations/{organization_id}/memberships/{membership_id}",
        {
          params: {
            path: { organization_id: organizationId, membership_id: membershipId },
          },
          body: { role },
        },
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memberships", organizationId] });
    },
  });
}

export function useDeleteMembership(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (membershipId: string) => {
      const { error } = await client.DELETE(
        "/v1/organizations/{organization_id}/memberships/{membership_id}",
        {
          params: {
            path: { organization_id: organizationId, membership_id: membershipId },
          },
        },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memberships", organizationId] });
    },
  });
}

export function useInvitations(organizationId: string) {
  return useQuery({
    queryKey: ["invitations", organizationId],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/invitations", {
        params: { query: { organization_id: organizationId } },
      });
      if (error) throw error;
      return (data as { data?: components["schemas"]["Invitation"][] })?.data || [];
    },
    enabled: !!organizationId,
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await client.POST("/v1/invitations/{invitation_id}/revoke", {
        params: { path: { invitation_id: invitationId } },
        body: {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}
