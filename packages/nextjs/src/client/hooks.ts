import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBlerpClient } from "./BlerpProvider";
import type { components, paths } from "@blerp/shared";

type Organization = components["schemas"]["Organization"];
type Membership = components["schemas"]["Membership"];
type Invitation = components["schemas"]["Invitation"];
type OrganizationDomain = components["schemas"]["OrganizationDomain"];

export function useOrganizations(query?: { domain?: string }) {
  const client = useBlerpClient();
  return useQuery({
    queryKey: ["organizations", query],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/organizations", {
        params: { query: query as paths["/v1/organizations"]["get"]["parameters"]["query"] },
      });
      if (error) throw error;
      return (data as { data: Organization[] }).data || [];
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
      return data as Organization;
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
      return (data as { data: Membership[] }).data;
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
      return (data as { data: Invitation[] }).data;
    },
    enabled: !!organizationId,
  });
}

export function useDomains(organizationId: string) {
  const client = useBlerpClient();
  return useQuery({
    queryKey: ["domains", organizationId],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/organizations/{organization_id}/domains", {
        params: { path: { organization_id: organizationId } },
      });
      if (error) throw error;
      return (data as { data: OrganizationDomain[] }).data;
    },
    enabled: !!organizationId,
  });
}

export function useAddDomain(organizationId: string) {
  const client = useBlerpClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (domain: string) => {
      const { data, error } = await client.POST("/v1/organizations/{organization_id}/domains", {
        params: { path: { organization_id: organizationId } },
        body: { domain },
      });
      if (error) throw error;
      return data as OrganizationDomain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains", organizationId] });
    },
  });
}

export function useDeleteDomain(organizationId: string) {
  const client = useBlerpClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (domainId: string) => {
      const { error } = await client.DELETE(
        "/v1/organizations/{organization_id}/domains/{domain_id}",
        {
          params: { path: { organization_id: organizationId, domain_id: domainId } },
        },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains", organizationId] });
    },
  });
}

export function useVerifyDomain(organizationId: string) {
  const client = useBlerpClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (domainId: string) => {
      const { data, error } = await client.POST(
        "/v1/organizations/{organization_id}/domains/{domain_id}/verify",
        {
          params: { path: { organization_id: organizationId, domain_id: domainId } },
        },
      );
      if (error) throw error;
      return data as OrganizationDomain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains", organizationId] });
    },
  });
}

export function useUser() {
  const client = useBlerpClient();
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/userinfo", {});
      if (error) throw error;
      return data as { sub: string; name: string; email: string };
    },
  });
}
