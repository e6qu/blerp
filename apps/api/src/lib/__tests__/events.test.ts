import { describe, it, expect, vi } from "vitest";
import { eventBus } from "../events";
import { redis } from "../redis";

vi.mock("../redis", () => ({
  isRedisAvailable: vi.fn().mockReturnValue(true),
  redis: {
    xadd: vi.fn().mockResolvedValue("123-0"),
  },
}));

vi.mock("../logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("EventBus", () => {
  it("should emit events to redis streams", async () => {
    const result = await eventBus.emit("user.created", "tenant_123", { userId: "user_123" });

    expect(redis.xadd).toHaveBeenCalled();
    expect(result).toBe("123-0");

    const [stream, id, ...args] = vi.mocked(redis.xadd).mock.calls[0];
    expect(stream).toBe("blerp_events");
    expect(id).toBe("*");

    // Check if args contains expected fields
    const data = Object.fromEntries(
      (args as string[]).reduce((acc: string[][], val, i) => {
        if (i % 2 === 0) acc.push([val, args[i + 1] as string]);
        return acc;
      }, []),
    );

    expect(data.type).toBe("user.created");
    expect(data.tenantId).toBe("tenant_123");
    expect(JSON.parse(data.data)).toEqual({ userId: "user_123" });
  });
});
