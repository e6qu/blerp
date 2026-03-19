import { Request, Response } from "express";
import { jwt } from "../../lib/jwt";
import { cache } from "../../lib/redis";
import { getKeyPair } from "../../lib/keys";

export async function getJWKS(_req: Request, res: Response) {
  const cacheKey = "blerp:jwks:v1";
  const cached = await cache.get<{ keys: Record<string, unknown>[] }>(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  const { publicKey } = await getKeyPair();
  const jwk = await jwt.exportJWK(publicKey, "default-kid");
  const response = {
    keys: [jwk as unknown as Record<string, unknown>],
  };

  await cache.set(cacheKey, response, 3600); // Cache for 1 hour
  res.json(response);
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
