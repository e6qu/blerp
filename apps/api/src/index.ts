import { startOtel } from "./lib/otel";
startOtel();

import { app } from "./app";
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});

const port = process.env.BLERP_API_PORT || process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`
╔══════════════════════════════════════════╗
║  Blerp API running on port ${String(port).padEnd(13)}║
║  http://localhost:${String(port).padEnd(23)}║
╚══════════════════════════════════════════╝`);
});
