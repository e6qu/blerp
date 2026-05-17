import { Request, Response } from "express";
import { jwt } from "../../lib/jwt";
import { cache } from "../../lib/redis";
import { getKeyPair } from "../../lib/keys";

// BUG-179 (codex r48) / same root cause as BUG-65 (codex r7): this
// controller is loaded eagerly by `app.ts` during API boot. A value
// import from `@blerp/shared` resolves through the gitignored
// `packages/shared/dist/index.js`, so `cd apps/api && bun run dev`
// on a clean checkout (Playwright's webServer pattern) fails to
// start before `/health` is even reachable. Inline the env reads
// here — same dual-name (BLERP_* / CLERK_*) and cross-framework
// (NEXT_PUBLIC_* / VITE_* / PUBLIC_* / EXPO_PUBLIC_* / NUXT_PUBLIC_*)
// alias surface as `packages/shared/src/env.ts`. The behavioural
// contract is pinned by `apps/api/src/__tests__/public-config.integration.test.ts`
// and `env-clerk-compat.test.ts`. `import type` would erase at
// compile time and stay safe; value imports do not.
const PUBLIC_PREFIXES = ["", "NEXT_PUBLIC_", "VITE_", "PUBLIC_", "EXPO_PUBLIC_", "NUXT_PUBLIC_"];
function nonBlank(v: string | undefined): string | undefined {
  return v && v.trim() !== "" ? v : undefined;
}
function firstEnv(...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = nonBlank(process.env[k]);
    if (v) return v;
  }
  return undefined;
}
function publicAliases(blerpSuffix: string, clerkSuffix: string): string[] {
  const out: string[] = [];
  for (const p of PUBLIC_PREFIXES) {
    out.push(`${p}BLERP_${blerpSuffix}`, `${p}CLERK_${clerkSuffix}`);
  }
  return out;
}
function parseBool(v: string | undefined): boolean {
  return v === undefined ? false : ["1", "true", "yes"].includes(v.toLowerCase());
}

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
    publishable_key: firstEnv(...publicAliases("PUBLISHABLE_KEY", "PUBLISHABLE_KEY")) ?? null,
    tenant_id: firstEnv(...publicAliases("TENANT_ID", "TENANT_ID")) ?? "demo-tenant",
    sign_in_url: firstEnv(...publicAliases("SIGN_IN_URL", "SIGN_IN_URL")) ?? "/sign-in",
    sign_up_url: firstEnv(...publicAliases("SIGN_UP_URL", "SIGN_UP_URL")) ?? "/sign-up",
    sign_in_force_redirect_url:
      firstEnv(...publicAliases("SIGN_IN_FORCE_REDIRECT_URL", "SIGN_IN_FORCE_REDIRECT_URL")) ??
      null,
    sign_in_fallback_redirect_url:
      firstEnv(
        ...publicAliases("SIGN_IN_FALLBACK_REDIRECT_URL", "SIGN_IN_FALLBACK_REDIRECT_URL"),
        ...publicAliases("AFTER_SIGN_IN_URL", "AFTER_SIGN_IN_URL"),
      ) ?? "/",
    sign_up_force_redirect_url:
      firstEnv(...publicAliases("SIGN_UP_FORCE_REDIRECT_URL", "SIGN_UP_FORCE_REDIRECT_URL")) ??
      null,
    sign_up_fallback_redirect_url:
      firstEnv(
        ...publicAliases("SIGN_UP_FALLBACK_REDIRECT_URL", "SIGN_UP_FALLBACK_REDIRECT_URL"),
        ...publicAliases("AFTER_SIGN_UP_URL", "AFTER_SIGN_UP_URL"),
      ) ?? "/",
    proxy_url: firstEnv(...publicAliases("PROXY_URL", "PROXY_URL")) ?? null,
    telemetry_disabled: parseBool(
      firstEnv(...publicAliases("TELEMETRY_DISABLED", "TELEMETRY_DISABLED")),
    ),
  });
}

export async function getOIDCConfig(req: Request, res: Response) {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const issuer = `${baseUrl}/v1`; // Should be tenant-aware in real app

  res.json({
    issuer,
    jwks_uri: `${baseUrl}/v1/jwks`,
    authorization_endpoint: `${baseUrl}/v1/auth/oauth/authorize`,
    // BUG-175 (codex r47): /v1/tokens/refresh was advertised here but
    // never implemented. Removed from OpenAPI; point token_endpoint
    // at the OAuth2 client-credentials endpoint, which IS implemented
    // (M2M token exchange). Re-add a refresh-token endpoint when that
    // grant type ships.
    token_endpoint: `${baseUrl}/v1/oauth/token`,
    userinfo_endpoint: `${baseUrl}/v1/userinfo`,
    response_types_supported: ["code", "id_token", "token id_token"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: ["openid", "profile", "email"],
    claims_supported: ["sub", "iss", "aud", "exp", "iat", "email", "email_verified", "name"],
  });
}
