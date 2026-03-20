import type createClient from "openapi-fetch";
import type { paths } from "@blerp/shared";
import { throwIfError } from "../errors.js";

export function createEmailAddressesApi(client: ReturnType<typeof createClient<paths>>) {
  return {
    listEmailAddresses: async (userId: string) => {
      const result = await client.GET("/v1/users/{user_id}/email_addresses", {
        params: { path: { user_id: userId } },
      });
      return throwIfError(result);
    },

    createEmailAddress: async (
      userId: string,
      params: {
        email: string;
      },
    ) => {
      const result = await client.POST("/v1/users/{user_id}/email_addresses", {
        params: { path: { user_id: userId } },
        body: params,
      });
      return throwIfError(result);
    },

    deleteEmailAddress: async (userId: string, emailAddressId: string) => {
      const result = await client.DELETE("/v1/users/{user_id}/email_addresses/{email_address_id}", {
        params: { path: { user_id: userId, email_address_id: emailAddressId } },
      });
      return throwIfError(result);
    },

    setPrimaryEmailAddress: async (userId: string, emailAddressId: string) => {
      const result = await client.POST(
        "/v1/users/{user_id}/email_addresses/{email_address_id}/set_primary",
        {
          params: { path: { user_id: userId, email_address_id: emailAddressId } },
        },
      );
      return throwIfError(result);
    },
  };
}
