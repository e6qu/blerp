const warned = new Set<string>();

function warnOnce(message: string) {
  if (typeof window !== "undefined" && !warned.has(message)) {
    warned.add(message);
    console.warn(`[Blerp] ${message}`);
  }
}

function getEnvValue(
  blerpKey: string,
  clerkKey: string,
  defaultValue?: string,
): string | undefined {
  const blerpValue = process.env[blerpKey];
  const clerkValue = process.env[clerkKey];

  if (blerpValue && clerkValue) {
    warnOnce(`Both ${blerpKey} and ${clerkKey} are set. Using ${blerpKey}.`);
  }

  return blerpValue ?? clerkValue ?? defaultValue;
}

export function getPublishableKey(): string | undefined {
  return getEnvValue("NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

export function getPublishableKeyOrThrow(): string {
  const key = getPublishableKey();
  if (!key) {
    throw new Error(
      "Missing required environment variable: set NEXT_PUBLIC_BLERP_PUBLISHABLE_KEY " +
        "(or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY for Clerk compatibility)",
    );
  }
  return key;
}

const BUILD_TIME_KEY = "pk_build_placeholder";

export function getPublishableKeyOrBuildPlaceholder(): string {
  return getPublishableKey() ?? BUILD_TIME_KEY;
}
