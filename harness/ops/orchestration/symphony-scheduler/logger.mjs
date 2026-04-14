import { createLogger } from "../../lib/logger.mjs";

const { logInfo, logWarn, logError, logDebug } = createLogger("scheduler");

export { logInfo, logWarn, logError, logDebug };
