import type createClient from "openapi-fetch";
import type { paths } from "@blerp/shared";
import { throwIfError } from "../errors.js";

type Metadata = Record<string, unknown>;

export function createOrganizationsApi(client: ReturnType<typeof createClient<paths>>) {
  return {
    getOrganization: async (id: string) => {
      const result = await client.GET("/v1/organizations/{organization_id}", {
        params: { path: { organization_id: id } },
      });
      return throwIfError(result);
    },

    listOrganizations: async (query?: { limit?: number; cursor?: string }) => {
      const result = await client.GET("/v1/organizations", {
        params: { query },
      });
      return throwIfError(result);
    },

    createOrganization: async (params: { project_id: string; name: string; slug?: string }) => {
      const result = await client.POST("/v1/organizations", {
        body: params,
      });
      return throwIfError(result);
    },

    updateOrganization: async (
      id: string,
      params: {
        metadata_public?: Metadata;
        metadata_private?: Metadata;
        settings?: Record<string, never>;
      },
    ) => {
      const result = await client.PATCH("/v1/organizations/{organization_id}", {
        params: { path: { organization_id: id } },
        body: params,
      });
      return throwIfError(result);
    },

    updateOrganizationMetadata: async (
      id: string,
      metadata: { public_metadata?: Metadata; private_metadata?: Metadata },
    ) => {
      const result = await client.PATCH("/v1/organizations/{organization_id}/metadata", {
        params: { path: { organization_id: id } },
        body: metadata,
      });
      return throwIfError(result);
    },

    deleteOrganization: async (id: string) => {
      const result = await client.DELETE("/v1/organizations/{organization_id}", {
        params: { path: { organization_id: id } },
      });
      return throwIfError(result);
    },
  };
}
