import { Request, Response } from "express";
import { jwt } from "../../lib/jwt";

let mockKeyPair: Awaited<ReturnType<typeof jwt.generateKeyPair>> | null = null;

async function getMockKeyPair() {
  if (!mockKeyPair) {
    mockKeyPair = await jwt.generateKeyPair();
  }
  return mockKeyPair;
}

export async function getJWKS(req: Request, res: Response) {
  const { publicKey } = await getMockKeyPair();
  const jwk = await jwt.exportJWK(publicKey, "default-kid");

  res.json({
    keys: [jwk],
  });
}
