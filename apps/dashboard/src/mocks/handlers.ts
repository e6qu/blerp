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

  http.post("/v1/auth/signups", async ({ request }) => {
    const { email } = (await request.json()) as { email: string };

    if (email === "error@blerp.dev") {
      return HttpResponse.json(
        {
          error: { message: "Simulated error for testing" },
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      id: "sig_mock_123",
      status: "needs_verification",
      identifier: email,
      strategy: "password",
      verification: {
        channel: "email_code",
        expires_at: new Date(Date.now() + 15 * 60000).toISOString(),
      },
    });
  }),
];
