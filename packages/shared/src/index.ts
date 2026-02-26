import createClient from "openapi-fetch";
import type { paths } from "./schema.js";

export type { paths, components } from "./schema.js";

/**
 * Creates a typed Blerp API client.
 *
 * @param baseUrl - The base URL of the Blerp API.
 * @param apiKey - The API key to use for requests.
 * @returns A fully typed openapi-fetch client instance.
 */
export function createBlerpClient(baseUrl: string, apiKey?: string) {
  const defaultHeaders: Record<string, string> = {};
  if (apiKey) {
    defaultHeaders["Authorization"] = `Bearer ${apiKey}`;
  }

  return createClient<paths>({
    baseUrl,
    headers: defaultHeaders,
  });
}
