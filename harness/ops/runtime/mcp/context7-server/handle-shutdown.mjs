import { stopContext7Server } from "./stop-context7-server.mjs";
import { logInfo } from "./logger.mjs";

export async function handleShutdown(signal) {
  logInfo(`Received ${signal} — shutting down Context7 MCP server`);
  await stopContext7Server();
}
