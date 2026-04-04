import { stopContext7Server } from "../context7-server.mjs";

import { server } from "./server.mjs";
import { logInfo } from "./logger.mjs";

export async function shutdown(signal) {
  logInfo(`Received ${signal}, shutting down...`);
  await stopContext7Server();
  server.close(() => {
    logInfo("HTTP server closed");
  });
  process.exit(0);
}
