import { isRedisAvailable, redis } from "./redis";
import { logger } from "./logger";
import { nanoid } from "nanoid";
import { Metadata } from "./metadata";

export type EventType =
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "organization.created"
  | "organization.updated"
  | "organization.deleted"
  | "session.created"
  | "session.revoked";

export interface BlerpEvent {
  id: string;
  type: EventType;
  tenantId: string;
  // BUG-163 (codex r41): project_id is required for fan-out. Webhook
  // delivery filters by it so a Project-B endpoint never sees a
  // Project-A event. Emitters that don't have a project context (rare
  // — most events are about a project-scoped resource) pass `null`,
  // which the worker treats as "tenant system event — only delivered
  // to endpoints with no project_id, i.e. legacy tenant-wide ones."
  projectId: string | null;
  timestamp: number;
  data: Metadata;
}

export const eventBus = {
  emit: async (
    type: EventType,
    tenantId: string,
    data: Metadata,
    projectId: string | null = null,
  ): Promise<string | null> => {
    const event: BlerpEvent = {
      id: `evt_${nanoid()}`,
      type,
      tenantId,
      projectId,
      timestamp: Date.now(),
      data,
    };

    try {
      if (!isRedisAvailable()) return null;
      const streamName = "blerp_events";

      const message = {
        id: event.id,
        type: event.type,
        tenantId: event.tenantId,
        projectId: event.projectId ?? "",
        timestamp: event.timestamp.toString(),
        data: JSON.stringify(event.data),
      };

      const result = await redis.xadd(streamName, "*", ...Object.entries(message).flat());

      logger.info({ eventId: event.id, type, tenantId }, "Event emitted");
      return result;
    } catch (error) {
      logger.error({ error, eventId: event.id, type }, "Failed to emit event");
      return null;
    }
  },
};
