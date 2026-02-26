import { describe, it, expect, vi, beforeEach } from "vitest";
import { initWorker } from "../webhook.worker";
import { redis } from "../../lib/redis";

vi.mock("../../lib/redis", () => ({
  redis: {
    xgroup: vi.fn().mockResolvedValue("OK"),
    xreadgroup: vi.fn(),
    xack: vi.fn(),
  },
}));

vi.mock("../../lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("WebhookWorker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize the consumer group", async () => {
    await initWorker();
    expect(redis.xgroup).toHaveBeenCalledWith(
      "CREATE",
      "blerp_events",
      "webhook_worker_group",
      "0",
      "MKSTREAM",
    );
  });

  it("should handle existing consumer group", async () => {
    vi.mocked(redis.xgroup).mockRejectedValue(
      new Error("BUSYGROUP Consumer Group name already exists"),
    );
    await expect(initWorker()).resolves.not.toThrow();
  });
});
