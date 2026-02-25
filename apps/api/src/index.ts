import { app } from "./app";
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`API listening on port ${port}`);
});
