import type createClient from "openapi-fetch";
import type { paths } from "@blerp/shared";
import { throwIfError } from "../errors.js";

export function createInvitationsApi(client: ReturnType<typeof createClient<paths>>) {
  return {
    listInvitations: async (query?: {
      email?: string;
      organization_id?: string;
      status?: "pending" | "accepted" | "revoked" | "expired";
      cursor?: string;
      limit?: number;
    }) => {
      const result = await client.GET("/v1/invitations", {
        params: { query },
      });
      return throwIfError(result);
    },

    createInvitation: async (params: {
      email: string;
      organization_id: string;
      role: string;
      permissions?: string[];
      expires_at?: string;
      redirect_url?: string;
    }) => {
      const result = await client.POST("/v1/invitations", {
        body: params,
      });
      return throwIfError(result);
    },

    revokeInvitation: async (id: string) => {
      const result = await client.POST("/v1/invitations/{invitation_id}/revoke", {
        params: { path: { invitation_id: id } },
      });
      return throwIfError(result);
    },
  };
}
