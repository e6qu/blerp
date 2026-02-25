import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/v1/me", () => {
    return HttpResponse.json({
      id: "user_123",
      email_addresses: [{ email_address: "admin@blerp.dev" }],
      first_name: "Admin",
      last_name: "User",
      public_metadata: {},
    });
  }),
];
