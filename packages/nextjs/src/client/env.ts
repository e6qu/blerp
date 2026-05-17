/*
 * Re-export the central client-side env helpers from @blerp/shared (BUG-46).
 * Keep this module path stable for any consumer still importing from
 * `@blerp/nextjs/client/env`.
 */
export {
  getPublishableKey,
  getPublishableKeyOrThrow,
  getPublishableKeyOrBuildPlaceholder,
} from "@blerp/shared";
