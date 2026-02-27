import { describe, it, expect } from "vitest";
import { deepMerge } from "../metadata";

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

  it("should deep merge nested objects within nested objects", () => {
    const target = {
      settings: {
        theme: "dark",
        notifications: {
          email: true,
        },
      },
    };
    const source = {
      settings: {
        notifications: {
          sms: false,
        },
      },
    };
    expect(deepMerge(target, source)).toEqual({
      settings: {
        theme: "dark",
        notifications: {
          email: true,
          sms: false,
        },
      },
    });
  });

  it("should not merge arrays", () => {
    const target = { tags: ["a"] };
    const source = { tags: ["b"] };
    expect(deepMerge(target, source)).toEqual({ tags: ["b"] });
  });

  it("should handle null targets or sources", () => {
    expect(deepMerge(null, { a: 1 })).toEqual({ a: 1 });
    expect(deepMerge({ a: 1 }, null)).toEqual({ a: 1 });
  });
});
