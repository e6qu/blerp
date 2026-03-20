import type createClient from "openapi-fetch";
import type { paths } from "@blerp/shared";
import { throwIfError } from "../errors.js";

type Metadata = Record<string, unknown>;

export function createUsersApi(client: ReturnType<typeof createClient<paths>>) {
  return {
    getUser: async (id: string) => {
      const result = await client.GET("/v1/users/{user_id}", {
        params: { path: { user_id: id } },
      });
      return throwIfError(result);
    },

    listUsers: async (query?: {
      email?: string;
      status?: "active" | "inactive" | "banned";
      metadata_key?: string;
      metadata_value?: string;
      limit?: number;
      cursor?: string;
    }) => {
      const result = await client.GET("/v1/users", {
        params: { query },
      });
      return throwIfError(result);
    },

    createUser: async (params: {
      email_addresses?: string[];
      phone_numbers?: string[];
      password?: string;
      public_metadata?: Metadata;
      private_metadata?: Metadata;
    }) => {
      const result = await client.POST("/v1/users", {
        body: params,
      });
      return throwIfError(result);
    },

    updateUser: async (
      id: string,
      params: {
        first_name?: string;
        last_name?: string;
        username?: string;
        public_metadata?: Metadata;
        private_metadata?: Metadata;
        password?: string;
        status?: "active" | "inactive" | "banned";
      },
    ) => {
      const result = await client.PATCH("/v1/users/{user_id}", {
        params: { path: { user_id: id } },
        body: params,
      });
      return throwIfError(result);
    },

    updateUserMetadata: async (
      id: string,
      metadata: {
        public_metadata?: Metadata;
        private_metadata?: Metadata;
        unsafe_metadata?: Metadata;
      },
    ) => {
      const result = await client.PATCH("/v1/users/{user_id}/metadata", {
        params: { path: { user_id: id } },
        body: metadata,
      });
      return throwIfError(result);
    },

    deleteUser: async (id: string) => {
      const result = await client.DELETE("/v1/users/{user_id}", {
        params: { path: { user_id: id } },
      });
      return throwIfError(result);
    },

    restoreUser: async (id: string) => {
      const result = await client.POST("/v1/users/{user_id}/restore", {
        params: { path: { user_id: id } },
      });
      return throwIfError(result);
    },
  };
}
