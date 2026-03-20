import type createClient from "openapi-fetch";
import type { paths } from "@blerp/shared";
import { throwIfError } from "../errors.js";

export function createSessionsApi(client: ReturnType<typeof createClient<paths>>) {
  return {
    listSessions: async (query?: { limit?: number; cursor?: string }) => {
      const result = await client.GET("/v1/sessions", {
        params: { query },
      });
      return throwIfError(result);
    },

    revokeSession: async (sessionId: string) => {
      const result = await client.DELETE("/v1/sessions/{session_id}", {
        params: { path: { session_id: sessionId } },
      });
      return throwIfError(result);
    },
  };
}
