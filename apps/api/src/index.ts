import { startOtel } from "./lib/otel";
startOtel();

import { app } from "./app";
import { getApiPort } from "@blerp/shared";
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});

// BUG-59 (codex r4): getApiPort() returns a string. Node/Express
// `app.listen(<string>, ...)` selects the Unix-socket-path overload and
// binds to a socket file rather than a TCP port. Coerce to number so the
// default "3000" actually binds TCP :3000.
const port = parseInt(getApiPort(), 10);

app.listen(port, () => {
  logger.info(`
╔══════════════════════════════════════════╗
║  Blerp API running on port ${String(port).padEnd(13)}║
║  http://localhost:${String(port).padEnd(23)}║
╚══════════════════════════════════════════╝`);
});
