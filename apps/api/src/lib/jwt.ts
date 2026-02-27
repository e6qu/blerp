import {
  SignJWT,
  jwtVerify,
  generateKeyPair,
  exportJWK,
  type JWTPayload,
  type CryptoKey,
} from "jose";

export const jwt = {
  // Generate a new RS256 key pair
  generateKeyPair: async () => {
    const { publicKey, privateKey } = await generateKeyPair("RS256", {
      modulusLength: 2048,
    });
    return { publicKey, privateKey };
  },

  // Sign a JWT with a private key
  sign: async (
    payload: JWTPayload,
    privateKey: CryptoKey | Uint8Array,
    options: { issuer: string; audience: string; expiresIn: string },
  ) => {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt()
      .setIssuer(options.issuer)
      .setAudience(options.audience)
      .setExpirationTime(options.expiresIn)
      .sign(privateKey);
  },

  // Verify a JWT with a public key
  verify: async (
    token: string,
    publicKey: CryptoKey | Uint8Array,
    options: { issuer: string; audience: string },
  ) => {
    return jwtVerify(token, publicKey, {
      issuer: options.issuer,
      audience: options.audience,
    });
  },

  // Export public key as JWK
  exportJWK: async (publicKey: CryptoKey | Uint8Array, kid: string) => {
    const jwk = await exportJWK(publicKey);
    return {
      ...jwk,
      kid,
      alg: "RS256",
      use: "sig",
    };
  },
};
