/*
 * Thin re-export of @blerp/shared's central env helpers (BUG-46). The
 * previous duplicate implementation was only reachable from this package;
 * see packages/shared/src/env.ts for the unified logic shared with
 * @blerp/nextjs, @blerp/testing, apps/* and examples/*.
 */
export {
  getSecretKey,
  getSecretKeyOrThrow,
  getPublishableKey,
  getPublishableKeyOrThrow,
  getPublishableKeyOrBuildPlaceholder,
  getApiUrl,
  getWebhookSecret,
  getWebhookSecretOrThrow,
} from "@blerp/shared";
