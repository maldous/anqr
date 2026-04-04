// Shared logger for this module's extracted members.
import { createLogger } from "../../lib/logger.mjs";

const { logInfo, logError, logDebug, logWarn } = createLogger();

export { logInfo, logError, logDebug, logWarn };
