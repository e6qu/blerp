# Monite SDK Clerk Data Storage

This document details the schema and types of data stored within Clerk (or Blerp) when integrated with the Monite SDK, based on the `monite-sdk-parity` implementation and integration tests.

## Organization Metadata

Monite uses Clerk Organizations to represent Monite Entities. Synchronization is typically handled via webhooks or server-side calls during the onboarding flow.

| Field       | Location           | Description                                                                                                                                      |
| ----------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `entity_id` | `private_metadata` | The unique identifier of the Entity in Monite (e.g., `monite_ent_abc123`). This is used to map Clerk organizations to Monite financial entities. |

## User Metadata

Users are mapped between Clerk and Monite to manage permissions and identity across the two platforms.

| Field            | Location           | Description                                                                                                                                             |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `monite_user_id` | `private_metadata` | The unique identifier of the User in Monite (e.g., `mu_123`). This allows Monite to associate Clerk-authenticated users with its internal user records. |

## Metadata Characteristics

- **Private Metadata**: Used for sensitive cross-platform identifiers (`entity_id`, `monite_user_id`) that should not be exposed to the client-side for security reasons. These are accessible only via server-side SDKs (`clerkClient` or `blerpClient`).
- **Public Metadata**: Can be used for non-sensitive flags or preferences that need to be readable by the frontend application, though the primary Monite integration focuses on private metadata for entity mapping.
- **Unsafe Metadata**: Generally avoided for core Monite integration to ensure data integrity, as this can be modified by the frontend.

## Data Lifecycle

1. **Organization Creation**: When a new organization is created in Clerk, a webhook (`organization.created`) triggers the creation of a corresponding Entity in Monite.
2. **Metadata Sync**: The resulting Monite `entity_id` is written back to the Clerk Organization's `private_metadata`.
3. **Entity Resolution**: During application runtime, the `entity_id` is retrieved from metadata to initialize the Monite SDK for the current tenant context.
