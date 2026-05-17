import { Request, Response } from "express";
import { jwt } from "../../lib/jwt";
import { cache } from "../../lib/redis";
import { getKeyPair } from "../../lib/keys";
import {
  getProxyUrl,
  getPublishableKey,
  getSignInFallbackRedirectUrl,
  getSignInForceRedirectUrl,
  getSignInUrl,
  getSignUpFallbackRedirectUrl,
  getSignUpForceRedirectUrl,
  getSignUpUrl,
  getTelemetryDisabled,
  getTenantId,
} from "@blerp/shared";

export async function getJWKS(_req: Request, res: Response) {
  const cacheKey = "blerp:jwks:v1";
  const cached = await cache.get<{ keys: Record<string, unknown>[] }>(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  const { publicKey } = await getKeyPair();
  const jwk = await jwt.exportJWK(publicKey, "default-kid");
  // JWK is a string-keyed bag of standard claims; spread into a plain record
  // so it matches the cache's serializable shape without a type cast.
  const jwkRecord: Record<string, unknown> = { ...jwk };
  const response = { keys: [jwkRecord] };

  await cache.set(cacheKey, response, 3600); // Cache for 1 hour
  res.json(response);
}

/**
 * BUG-96 (round-2 sweep): runtime escape-hatch for NEXT_PUBLIC_* /
 * VITE_* env vars. Next.js 15+ docs are explicit that NEXT_PUBLIC_* is
 * inlined at `next build` and frozen for the lifetime of the bundle —
 * single-image multi-env Docker deploys cannot change them at runtime.
 * The official guidance is: "you'll have to setup your own API to
 * provide them to the client (either on demand or during
 * initialization)". This endpoint is that API.
 *
 * It's intentionally public (no auth) and returns only **public** values:
 * the publishable key, tenant id, and Clerk-parity URL config. The
 * secret key, webhook secret, and encryption key are never returned.
 *
 * Cache-control: short max-age + must-revalidate so a customer can
 * roll a new tenant id without a redeploy of the Next.js bundle.
 */
export function getPublicConfig(_req: Request, res: Response) {
  res.set("Cache-Control", "public, max-age=60, must-revalidate");
  res.json({
    publishable_key: getPublishableKey() ?? null,
    tenant_id: getTenantId(),
    sign_in_url: getSignInUrl(),
    sign_up_url: getSignUpUrl(),
    sign_in_force_redirect_url: getSignInForceRedirectUrl() ?? null,
    sign_in_fallback_redirect_url: getSignInFallbackRedirectUrl(),
    sign_up_force_redirect_url: getSignUpForceRedirectUrl() ?? null,
    sign_up_fallback_redirect_url: getSignUpFallbackRedirectUrl(),
    proxy_url: getProxyUrl() ?? null,
    telemetry_disabled: getTelemetryDisabled(),
  });
}

export async function getOIDCConfig(req: Request, res: Response) {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const issuer = `${baseUrl}/v1`; // Should be tenant-aware in real app

  res.json({
    issuer,
    jwks_uri: `${baseUrl}/v1/jwks`,
    authorization_endpoint: `${baseUrl}/v1/auth/oauth/authorize`,
    token_endpoint: `${baseUrl}/v1/tokens/refresh`,
    userinfo_endpoint: `${baseUrl}/v1/userinfo`,
    response_types_supported: ["code", "id_token", "token id_token"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: ["openid", "profile", "email"],
    claims_supported: ["sub", "iss", "aud", "exp", "iat", "email", "email_verified", "name"],
  });
}
