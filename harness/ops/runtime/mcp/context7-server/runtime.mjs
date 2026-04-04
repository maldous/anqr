// Generated runtime carry-forward.

import { handleShutdown } from "./index.mjs";

import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";

process.on("SIGTERM", () => handleShutdown("SIGTERM"));

process.on("SIGINT", () => handleShutdown("SIGINT"));
