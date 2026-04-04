// Shared logger for this module's extracted members.
import { createLogger } from "../../logger.mjs";

const { logInfo, logWarn, logError } = createLogger("rag-build-index");

export { logInfo, logWarn, logError };
