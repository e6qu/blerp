import { redis } from "./redis";
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
  timestamp: number;
  data: Metadata;
}

export const eventBus = {
  emit: async (type: EventType, tenantId: string, data: Metadata): Promise<string | null> => {
    const event: BlerpEvent = {
      id: `evt_${nanoid()}`,
      type,
      tenantId,
      timestamp: Date.now(),
      data,
    };

    try {
      const streamName = "blerp_events";

      const message = {
        id: event.id,
        type: event.type,
        tenantId: event.tenantId,
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
