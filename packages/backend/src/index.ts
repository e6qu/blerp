import createClient from "openapi-fetch";
import type { paths } from "@blerp/shared";

type Metadata = Record<string, unknown>;

export class BlerpClient {
  private client: ReturnType<typeof createClient<paths>>;

  constructor(options: { baseUrl: string; secretKey: string }) {
    this.client = createClient<paths>({
      baseUrl: options.baseUrl,
      headers: {
        Authorization: `Bearer ${options.secretKey}`,
      },
    });
  }

  get organizations() {
    return {
      getOrganization: async (id: string) => {
        const { data, error } = await this.client.GET("/v1/organizations/{organization_id}", {
          params: { path: { organization_id: id } },
        });
        if (error) throw error;
        return data;
      },
      updateOrganizationMetadata: async (
        id: string,
        metadata: { public_metadata?: Metadata; private_metadata?: Metadata },
      ) => {
        const { data, error } = await this.client.PATCH(
          "/v1/organizations/{organization_id}/metadata",
          {
            params: { path: { organization_id: id } },
            body: metadata,
          },
        );
        if (error) throw error;
        return data;
      },
    };
  }

  get users() {
    return {
      getUser: async (id: string) => {
        const { data, error } = await this.client.GET("/v1/users/{user_id}", {
          params: { path: { user_id: id } },
        });
        if (error) throw error;
        return data;
      },
      updateUserMetadata: async (
        id: string,
        metadata: {
          public_metadata?: Metadata;
          private_metadata?: Metadata;
          unsafe_metadata?: Metadata;
        },
      ) => {
        const { data, error } = await this.client.PATCH("/v1/users/{user_id}/metadata", {
          params: { path: { user_id: id } },
          body: metadata,
        });
        if (error) throw error;
        return data;
      },
      listUsers: async (query?: {
        email?: string;
        status?: "active" | "inactive" | "banned";
        metadata_key?: string;
        metadata_value?: string;
        limit?: number;
        cursor?: string;
      }) => {
        const { data, error } = await this.client.GET("/v1/users", {
          params: { query },
        });
        if (error) throw error;
        return data;
      },
    };
  }
}

export function createBlerpClient(options: { baseUrl: string; secretKey: string }) {
  return new BlerpClient(options);
}
