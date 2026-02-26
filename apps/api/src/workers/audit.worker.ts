/* eslint-disable @typescript-eslint/no-explicit-any */
import { redis } from "../lib/redis";
import { logger } from "../lib/logger";
import { getTenantDb } from "../db/router";
import { AuditLogService } from "../v1/services/audit.service";

const STREAM_NAME = "blerp_events";
const CONSUMER_GROUP = "audit_worker_group";
const CONSUMER_NAME = `audit_worker_${process.pid}`;

export async function initAuditWorker() {
  try {
    await redis.xgroup("CREATE", STREAM_NAME, CONSUMER_GROUP, "0", "MKSTREAM");
  } catch (err: any) {
    if (!err.message.includes("BUSYGROUP")) {
      throw err;
    }
  }
}

export async function processAuditEvents() {
  while (true) {
    try {
      const response = await (redis.xreadgroup as any)(
        "GROUP",
        CONSUMER_GROUP,
        CONSUMER_NAME,
        "COUNT",
        "10",
        "BLOCK",
        "1000",
        "STREAMS",
        STREAM_NAME,
        ">",
      );

      if (!response) continue;

      for (const [, messages] of response) {
        for (const [messageId, fields] of messages) {
          const event = parseEvent(fields);
          if (event) {
            await persistAuditLog(event);
          }
          await redis.xack(STREAM_NAME, CONSUMER_GROUP, messageId);
        }
      }
    } catch (error) {
      logger.error({ error }, "Error processing events in audit worker");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

function parseEvent(fields: string[]) {
  const data: Record<string, string> = {};
  for (let i = 0; i < fields.length; i += 2) {
    data[fields[i]] = fields[i + 1];
  }

  return {
    id: data.id,
    type: data.type,
    tenantId: data.tenantId,
    timestamp: parseInt(data.timestamp),
    payload: JSON.parse(data.data),
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function persistAuditLog(event: any) {
  try {
    const db = await getTenantDb(event.tenantId);
    const auditService = new AuditLogService(db);

    await auditService.create({
      action: event.type,
      actor: { type: "system" }, // Placeholder for actual actor resolution
      payload: event.payload,
      userId: event.payload.userId,
      organizationId: event.payload.organizationId,
    });

    logger.info({ eventId: event.id, type: event.type }, "Audit log persisted");
  } catch (error) {
    logger.error({ error, eventId: event.id }, "Failed to persist audit log");
  }
}
