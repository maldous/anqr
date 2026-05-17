import { handleSignal, logError, main } from "./index.mjs";

process.on("SIGTERM", handleSignal("SIGTERM"));

process.on("SIGINT", handleSignal("SIGINT"));

process.on("SIGHUP", handleSignal("SIGHUP"));

try {
  await main();
} catch (err) {
  logError(`Fatal gateway wrapper error: ${err.message}`);
  process.exitCode = 1;
}
