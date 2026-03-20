import { exportPKCS8, exportSPKI, importPKCS8, importSPKI } from "jose";
import { jwt } from "./jwt";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { logger } from "./logger";

interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

let cached: KeyPair | undefined;

const currentDir = dirname(fileURLToPath(import.meta.url));
const KEYS_DIR = join(dirname(dirname(currentDir)), "keys");
const PRIVATE_PEM_PATH = join(KEYS_DIR, "private.pem");
const PUBLIC_PEM_PATH = join(KEYS_DIR, "public.pem");

async function loadOrGenerate(): Promise<KeyPair> {
  // Try loading from disk
  if (existsSync(PRIVATE_PEM_PATH) && existsSync(PUBLIC_PEM_PATH)) {
    const privatePem = readFileSync(PRIVATE_PEM_PATH, "utf-8");
    const publicPem = readFileSync(PUBLIC_PEM_PATH, "utf-8");
    const privateKey = await importPKCS8(privatePem, "RS256");
    const publicKey = await importSPKI(publicPem, "RS256");
    return { publicKey, privateKey };
  }

  // Generate new pair
  const pair = await jwt.generateKeyPair();

  // Try to persist
  try {
    if (!existsSync(KEYS_DIR)) {
      mkdirSync(KEYS_DIR, { recursive: true });
    }
    const privatePem = await exportPKCS8(pair.privateKey);
    const publicPem = await exportSPKI(pair.publicKey);
    writeFileSync(PRIVATE_PEM_PATH, privatePem, { mode: 0o600 });
    writeFileSync(PUBLIC_PEM_PATH, publicPem, { mode: 0o644 });
  } catch (err) {
    logger.warn(
      { error: (err as Error).message },
      "Could not persist key pair to disk — using in-memory only",
    );
  }

  return pair;
}

export async function getKeyPair(): Promise<KeyPair> {
  if (!cached) {
    cached = await loadOrGenerate();
  }
  return cached;
}
