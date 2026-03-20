import type createClient from "openapi-fetch";
import type { paths } from "@blerp/shared";
import { throwIfError } from "../errors.js";

export function createOrganizationMembershipsApi(client: ReturnType<typeof createClient<paths>>) {
  return {
    listMemberships: async (
      orgId: string,
      query?: {
        limit?: number;
        cursor?: string;
      },
    ) => {
      const result = await client.GET("/v1/organizations/{organization_id}/memberships", {
        params: { path: { organization_id: orgId }, query },
      });
      return throwIfError(result);
    },

    createMembership: async (
      orgId: string,
      params: {
        user_id: string;
        role: string;
      },
    ) => {
      const result = await client.POST("/v1/organizations/{organization_id}/memberships", {
        params: { path: { organization_id: orgId } },
        body: params,
      });
      return throwIfError(result);
    },

    updateMembership: async (
      orgId: string,
      membershipId: string,
      params: {
        role?: string;
        permissions?: string[];
      },
    ) => {
      const result = await client.PATCH(
        "/v1/organizations/{organization_id}/memberships/{membership_id}",
        {
          params: { path: { organization_id: orgId, membership_id: membershipId } },
          body: params,
        },
      );
      return throwIfError(result);
    },

    deleteMembership: async (orgId: string, membershipId: string) => {
      const result = await client.DELETE(
        "/v1/organizations/{organization_id}/memberships/{membership_id}",
        {
          params: { path: { organization_id: orgId, membership_id: membershipId } },
        },
      );
      return throwIfError(result);
    },
  };
}
