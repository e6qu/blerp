/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Simple deep merge utility for metadata objects.
 * It recursively merges plain objects.
 */
export function deepMerge(target: any, source: any): any {
  if (!source) return target;

  let actualTarget = target;
  if (typeof target === "string") {
    try {
      actualTarget = JSON.parse(target);
    } catch {
      actualTarget = {};
    }
  }

  if (!actualTarget || typeof actualTarget !== "object" || Array.isArray(actualTarget)) {
    actualTarget = {};
  }

  if (typeof source !== "object" || Array.isArray(source)) {
    return source;
  }

  const output = { ...actualTarget };

  Object.keys(source).forEach((key) => {
    const sourceValue = (source as Record<string, any>)[key];
    const targetValue = (actualTarget as Record<string, any>)[key];

    if (typeof sourceValue === "object" && sourceValue !== null && !Array.isArray(sourceValue)) {
      if (!(key in actualTarget)) {
        Object.assign(output, { [key]: sourceValue });
      } else {
        output[key] = deepMerge(targetValue, sourceValue);
      }
    } else {
      Object.assign(output, { [key]: sourceValue });
    }
  });

  return output;
}

/**
 * Validates the Monite entities metadata structure.
 */
export function validateMetadata(metadata: any): void {
  if (!metadata) return;

  if (metadata.entities) {
    if (typeof metadata.entities !== "object" || Array.isArray(metadata.entities)) {
      throw new Error("metadata.entities must be an object");
    }

    Object.entries(metadata.entities).forEach(([entityId, value]: [string, any]) => {
      if (typeof value !== "object" || Array.isArray(value)) {
        throw new Error(`metadata.entities[${entityId}] must be an object`);
      }
      if (!value.entity_user_id || typeof value.entity_user_id !== "string") {
        throw new Error(`metadata.entities[${entityId}] must have a string entity_user_id`);
      }
      if (!value.organization_id || typeof value.organization_id !== "string") {
        throw new Error(`metadata.entities[${entityId}] must have a string organization_id`);
      }
    });
  }
}
