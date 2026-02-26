# Monite SDK Clerk Data Storage

This document details the schema and types of data stored within Clerk (or Blerp) when integrated with the Monite SDK, based on an inspection of the official `monite-sdk` repository and its integration examples.

## Organization Metadata

Monite uses Clerk Organizations to represent Monite Entities. The mapping and configuration are stored in the Organization's `private_metadata`.

| Field              | Location           | Description                                                                                                              |
| ------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `entity_id`        | `private_metadata` | The unique identifier of the Entity in Monite (e.g., `monite_ent_abc123`). Primary key for mapping.                      |
| `default_roles`    | `private_metadata` | An object mapping Monite role names (e.g., `admin`, `member`) to their corresponding Monite `role_id`.                   |
| `verified_domains` | `private_metadata` | An object containing verified domains for the organization, including their `verification_status` and `enrollment_mode`. |

## User Metadata

User-to-entity relationships are stored in the User's `private_metadata`. Monite supports a multi-entity architecture where one Clerk user can belong to multiple Monite entities.

| Field      | Location           | Description                                                                                                                     |
| ---------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `entities` | `private_metadata` | An object (record) where keys are Monite `entity_id`s and values are objects containing `entity_user_id` and `organization_id`. |

### Example User Metadata Structure

```json
{
  "privateMetadata": {
    "entities": {
      "monite_ent_123": {
        "entity_user_id": "mu_abc",
        "organization_id": "org_xyz"
      }
    }
  }
}
```

## Metadata Characteristics

- **Private Metadata**: Used for all cross-platform identifiers. This prevents sensitive Monite IDs from being exposed to the browser or modified by the user.
- **Access Control**: These fields are only readable/writable via the Server SDKs (`clerkClient` or `blerpClient`) using a Secret Key.

## Data Lifecycle

1. **Webhook Sync**: Upon `organization.created` or `user.created`, a backend service creates the corresponding resource in Monite.
2. **Back-fill**: The service immediately updates the Clerk Organization or User metadata with the generated Monite IDs.
3. **Token Exchange**: The frontend calls a server-side endpoint which reads the `entity_user_id` from the User's metadata and exchanges it for a short-lived Monite Access Token.
