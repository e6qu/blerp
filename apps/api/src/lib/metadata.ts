/**
 * Generic type for JSON metadata.
 */
export type MetadataValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: MetadataValue }
  | MetadataValue[];
export type Metadata = Record<string, MetadataValue>;

/**
 * Simple deep merge utility for metadata objects.
 * It recursively merges plain objects.
 */
export function deepMerge(target: Metadata | string, source: Metadata): Metadata {
  if (!source) return typeof target === "string" ? {} : target;

  let actualTarget: Metadata = {};
  if (typeof target === "string") {
    try {
      actualTarget = JSON.parse(target) as Metadata;
    } catch {
      actualTarget = {};
    }
  } else {
    actualTarget = target;
  }

  if (!actualTarget || typeof actualTarget !== "object" || Array.isArray(actualTarget)) {
    actualTarget = {};
  }

  if (typeof source !== "object" || Array.isArray(source)) {
    return source;
  }

  const output: Metadata = { ...actualTarget };

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = actualTarget[key];

    if (
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      output[key] = deepMerge(targetValue as Metadata, sourceValue as Metadata);
    } else {
      output[key] = sourceValue;
    }
  });

  return output;
}

/**
 * Validates the Monite entities metadata structure.
 */
export function validateMetadata(metadata: Metadata): void {
  if (!metadata) return;

  const entities = metadata.entities;
  if (entities) {
    if (typeof entities !== "object" || Array.isArray(entities)) {
      throw new Error("metadata.entities must be an object");
    }

    Object.entries(entities as Record<string, unknown>).forEach(([entityId, value]) => {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new Error(`metadata.entities[${entityId}] must be an object`);
      }

      const entityValue = value as Record<string, unknown>;
      if (typeof entityValue.entity_user_id !== "string") {
        throw new Error(`metadata.entities[${entityId}] must have a string entity_user_id`);
      }
      if (typeof entityValue.organization_id !== "string") {
        throw new Error(`metadata.entities[${entityId}] must have a string organization_id`);
      }
    });
  }
}
