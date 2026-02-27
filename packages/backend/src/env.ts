const warned = new Set<string>();

function warnOnce(message: string) {
  if (!warned.has(message)) {
    warned.add(message);
    console.warn(`[Blerp] ${message}`);
  }
}

function getEnvValue(
  blerpKey: string,
  clerkKey: string,
  options?: { required?: boolean; defaultValue?: string },
): string | undefined {
  const blerpValue = process.env[blerpKey];
  const clerkValue = process.env[clerkKey];

  if (blerpValue && clerkValue) {
    warnOnce(
      `Both ${blerpKey} and ${clerkKey} are set. Using ${blerpKey}. ` +
        `Remove ${clerkKey} to silence this warning.`,
    );
  }

  const value = blerpValue ?? clerkValue ?? options?.defaultValue;

  if (!value && options?.required) {
    throw new Error(
      `Missing required environment variable: set ${blerpKey}` +
        (clerkKey ? ` (or ${clerkKey} for Clerk compatibility)` : ""),
    );
  }

  return value;
}

export function getSecretKey(): string | undefined {
  return getEnvValue("BLERP_SECRET_KEY", "CLERK_SECRET_KEY");
}

export function getSecretKeyOrThrow(): string {
  return getEnvValue("BLERP_SECRET_KEY", "CLERK_SECRET_KEY", { required: true })!;
}

export function getPublishableKey(): string | undefined {
  const blerpKey =
    process.env.BLERP_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY;
  const clerkKey =
    process.env.CLERK_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (blerpKey && clerkKey) {
    warnOnce(
      "Both BLERP_PUBLISHABLE_KEY and CLERK_PUBLISHABLE_KEY are set. Using BLERP_PUBLISHABLE_KEY.",
    );
  }

  return blerpKey ?? clerkKey;
}

export function getPublishableKeyOrThrow(): string {
  const key = getPublishableKey();
  if (!key) {
    throw new Error(
      "Missing required environment variable: set BLERP_PUBLISHABLE_KEY " +
        "(or CLERK_PUBLISHABLE_KEY for Clerk compatibility)",
    );
  }
  return key;
}

export function getApiUrl(): string {
  return getEnvValue("BLERP_API_URL", "CLERK_API_URL", {
    defaultValue: "http://localhost:3000",
  })!;
}

export function getWebhookSecret(): string | undefined {
  return getEnvValue("BLERP_WEBHOOK_SECRET", "CLERK_WEBHOOK_SECRET");
}

export function getWebhookSecretOrThrow(): string {
  return getEnvValue("BLERP_WEBHOOK_SECRET", "CLERK_WEBHOOK_SECRET", { required: true })!;
}
