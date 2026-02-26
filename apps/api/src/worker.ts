import { initWorker, processEvents } from "./workers/webhook.worker";
import { initAuditWorker, processAuditEvents } from "./workers/audit.worker";
import { logger } from "./lib/logger";

async function main() {
  logger.info("Starting workers...");

  await Promise.all([initWorker(), initAuditWorker()]);

  await Promise.all([processEvents(), processAuditEvents()]);
}

main().catch((error) => {
  logger.error({ error }, "Worker failed");
  process.exit(1);
});
