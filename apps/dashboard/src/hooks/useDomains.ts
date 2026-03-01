import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/api";
import type { components } from "@blerp/shared";

type OrganizationDomain = components["schemas"]["OrganizationDomain"];

export function useDomains(organizationId: string) {
  return useQuery({
    queryKey: ["domains", organizationId],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/organizations/{organization_id}/domains", {
        params: { path: { organization_id: organizationId } },
      });
      if (error) throw error;
      return (data?.data || []) as OrganizationDomain[];
    },
    enabled: !!organizationId,
  });
}

export function useAddDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ organizationId, domain }: { organizationId: string; domain: string }) => {
      const { data, error } = await client.POST("/v1/organizations/{organization_id}/domains", {
        params: { path: { organization_id: organizationId } },
        body: { domain },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["domains", variables.organizationId] });
    },
  });
}

export function useVerifyDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      organizationId,
      domainId,
    }: {
      organizationId: string;
      domainId: string;
    }) => {
      const { data, error } = await client.POST(
        "/v1/organizations/{organization_id}/domains/{domain_id}/verify",
        {
          params: {
            path: { organization_id: organizationId, domain_id: domainId },
          },
        },
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["domains", variables.organizationId] });
    },
  });
}

export function useDeleteDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      organizationId,
      domainId,
    }: {
      organizationId: string;
      domainId: string;
    }) => {
      const { error } = await client.DELETE(
        "/v1/organizations/{organization_id}/domains/{domain_id}",
        {
          params: {
            path: { organization_id: organizationId, domain_id: domainId },
          },
        },
      );
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["domains", variables.organizationId] });
    },
  });
}
