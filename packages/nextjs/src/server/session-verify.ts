import * as jose from "jose";
import { getApiUrl, getTenantId } from "@blerp/shared";

/**
 * BUG-181 (codex r49): the API middleware (BUG-155 codex r37) binds
 * session JWTs to the tenant they were minted for. The Next.js SDK
 * previously verified only the signature — a session minted for
 * tenant A would pass `auth()` / `blerpMiddleware` when the host app
 * is configured for tenant B, even though the API now rejects that
 * same cookie on the next request. Centralise the verification here
 * so both `auth()` and `middleware.ts` enforce the same contract.
 *
 *   * Signature must verify against the API's published JWKS.
 *   * If the token carries a `tenant_id` claim, it must match
 *     `getTenantId()` for the host app.
 *   * If the token does NOT carry a `tenant_id` claim, it is only
 *     honored in non-production (back-compat with sessions minted
 *     before BUG-155).
 *
 * Returns the verified payload on success, `null` on any failure.
 * Callers treat `null` as unauthenticated.
 */
let jwksCache: ReturnType<typeof jose.createRemoteJWKSet> | undefined;
function getJWKS(): ReturnType<typeof jose.createRemoteJWKSet> {
  if (!jwksCache) {
    jwksCache = jose.createRemoteJWKSet(new URL(`${getApiUrl()}/v1/jwks`));
  }
  return jwksCache;
}

export async function verifySessionToken(token: string): Promise<jose.JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJWKS(), {
      issuer: "blerp",
      audience: "blerp-api",
    });
    const jwtTenantId = typeof payload.tenant_id === "string" ? payload.tenant_id : undefined;
    if (jwtTenantId) {
      if (jwtTenantId !== getTenantId()) return null;
    } else if (process.env.NODE_ENV === "production") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
