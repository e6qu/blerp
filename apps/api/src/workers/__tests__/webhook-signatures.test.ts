/*
 * BUG-50: verify the Svix-compatible signature triple we emit alongside
 * the legacy `X-Blerp-Signature`. The verification algorithm below
 * mirrors what Svix and Clerk's documented webhook receivers do — a
 * customer porting their Clerk handler to point at blerp should see the
 * same successful verification.
 */
import { describe, expect, it } from "vitest";
import crypto from "node:crypto";
import { buildWebhookSignatureHeaders } from "../webhook.worker";

/**
 * Verify a Svix-format signature. Replicates the published Svix
 * algorithm without adding the `svix` npm dep — the algorithm is small,
 * stable, and well-documented; pulling the package just for the test
 * would coupling on transient deps that the install-scripts ban
 * (CLAUDE.md tooling mandate) discourages.
 */
function verifySvix(args: {
  secret: string;
  payload: string;
  svixId: string;
  svixTimestamp: string;
  svixSignature: string;
}): boolean {
  const svixSecret = args.secret.startsWith("whsec_")
    ? Buffer.from(args.secret.replace(/^whsec_/, ""), "base64")
    : Buffer.from(args.secret);
  const expected = crypto
    .createHmac("sha256", svixSecret)
    .update(`${args.svixId}.${args.svixTimestamp}.${args.payload}`)
    .digest("base64");
  // The signature header is `v1,<sig>` (possibly multiple
  // space-separated for key rotation). Accept if ANY v1 entry matches.
  return args.svixSignature.split(" ").some((entry) => {
    const [version, sig] = entry.split(",");
    if (version !== "v1") return false;
    return crypto.timingSafeEqual(Buffer.from(sig, "utf-8"), Buffer.from(expected, "utf-8"));
  });
}

describe("BUG-50: Svix-compatible webhook signature", () => {
  const payload = JSON.stringify({ id: "evt_test", type: "user.created", data: { foo: "bar" } });

  it("emits both legacy X-Blerp-Signature and the Svix triple for a whsec_ secret", () => {
    const headers = buildWebhookSignatureHeaders({
      secret: "whsec_dGVzdHNlY3JldA==", // base64 of "testsecret"
      payload,
    });
    expect(headers.legacySignature).toMatch(/^[0-9a-f]{64}$/);
    expect(headers.svixId).toMatch(/^msg_/);
    expect(headers.svixTimestamp).toMatch(/^\d+$/);
    expect(headers.svixSignature.startsWith("v1,")).toBe(true);
  });

  it("the emitted Svix signature passes the canonical Svix verification algorithm", () => {
    const secret = "whsec_dGVzdHNlY3JldA==";
    const headers = buildWebhookSignatureHeaders({ secret, payload });
    const verified = verifySvix({
      secret,
      payload,
      svixId: headers.svixId,
      svixTimestamp: headers.svixTimestamp,
      svixSignature: headers.svixSignature,
    });
    expect(verified).toBe(true);
  });

  it("verification fails when the payload is tampered with", () => {
    const secret = "whsec_dGVzdHNlY3JldA==";
    const headers = buildWebhookSignatureHeaders({ secret, payload });
    const verified = verifySvix({
      secret,
      payload: payload + "tampered",
      svixId: headers.svixId,
      svixTimestamp: headers.svixTimestamp,
      svixSignature: headers.svixSignature,
    });
    expect(verified).toBe(false);
  });

  it("verification fails when the wrong secret is used", () => {
    const secret = "whsec_dGVzdHNlY3JldA==";
    const headers = buildWebhookSignatureHeaders({ secret, payload });
    const verified = verifySvix({
      secret: "whsec_d3JvbmdzZWNyZXQ=",
      payload,
      svixId: headers.svixId,
      svixTimestamp: headers.svixTimestamp,
      svixSignature: headers.svixSignature,
    });
    expect(verified).toBe(false);
  });

  it("legacy hex HMAC still validates with raw HMAC-SHA256 over the payload", () => {
    const secret = "raw_dev_secret";
    const headers = buildWebhookSignatureHeaders({ secret, payload });
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    expect(headers.legacySignature).toBe(expected);
  });
});
