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
