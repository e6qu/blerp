import { describe, it, expect } from "vitest";
import { deepMerge, validateMetadata } from "../metadata";

describe("deepMerge", () => {
  it("should merge shallow objects", () => {
    const target = { a: 1 };
    const source = { b: 2 };
    expect(deepMerge(target, source)).toEqual({ a: 1, b: 2 });
  });

  it("should overwrite non-object properties", () => {
    const target = { a: 1 };
    const source = { a: 2 };
    expect(deepMerge(target, source)).toEqual({ a: 2 });
  });

  it("should deep merge nested objects", () => {
    const target = {
      entities: {
        org_1: { id: "user_1" },
      },
    };
    const source = {
      entities: {
        org_2: { id: "user_2" },
      },
    };
    expect(deepMerge(target, source)).toEqual({
      entities: {
        org_1: { id: "user_1" },
        org_2: { id: "user_2" },
      },
    });
  });

  it("should handle string target", () => {
    const target = '{"a": 1}';
    const source = { b: 2 };
    expect(deepMerge(target, source)).toEqual({ a: 1, b: 2 });
  });
});

describe("validateMetadata", () => {
  it("should accept valid entities structure", () => {
    const metadata = {
      entities: {
        monite_1: {
          entity_user_id: "eu_1",
          organization_id: "org_1",
        },
      },
    };
    expect(() => validateMetadata(metadata)).not.toThrow();
  });

  it("should throw if entities is not an object", () => {
    const metadata = { entities: "invalid" };
    expect(() => validateMetadata(metadata)).toThrow("metadata.entities must be an object");
  });

  it("should throw if entity value is missing required fields", () => {
    const metadata = {
      entities: {
        monite_1: {
          entity_user_id: "eu_1",
          // organization_id missing
        },
      },
    };
    expect(() => validateMetadata(metadata)).toThrow(/must have a string organization_id/);
  });
});
