import { LOG_LEVELS } from "./log-levels.mjs";
import { getCallerInfo } from "./get-caller-info.mjs";

export function createLogger(scriptName = "", options = {}) {
  const envVarName = scriptName
    ? options.envVar || `${scriptName.toUpperCase().replaceAll("-", "_")}_LOG_LEVEL`
    : "LOG_LEVEL";
  const defaultLevel = options.defaultLevel || "INFO";

  const envLogLevel = process.env[envVarName]?.toUpperCase();
  const initialLevel = LOG_LEVELS[envLogLevel] ?? LOG_LEVELS[defaultLevel];
  const prefix = scriptName ? `[${scriptName}]` : "";
  let currentLogLevel = initialLevel;

  function setLogLevel(level) {
    const levelName = Object.keys(LOG_LEVELS).find((k) => LOG_LEVELS[k] === level);
    currentLogLevel = level;
    // Always write log level changes directly to stderr, bypassing level filtering
    process.stderr.write(`${prefix} [INFO] 📊 Log level: ${levelName}\n`);
  }

  function getLogLevel() {
    return currentLogLevel;
  }

  function incrementLogLevel() {
    if (currentLogLevel < LOG_LEVELS.ERROR) {
      setLogLevel(currentLogLevel + 1);
    }
  }

  function decrementLogLevel() {
    if (currentLogLevel > LOG_LEVELS.DEBUG) {
      setLogLevel(currentLogLevel - 1);
    }
  }

  // Signal handlers for dynamic log level control
  process.on("SIGUSR1", () => {
    // Always write signal receipts directly to stderr, bypassing level filtering
    process.stderr.write(`${prefix} [INFO] Received SIGUSR1 - decreasing verbosity\n`);
    incrementLogLevel();
  });

  process.on("SIGUSR2", () => {
    // Always write signal receipts directly to stderr, bypassing level filtering
    process.stderr.write(`${prefix} [INFO] Received SIGUSR2 - increasing verbosity\n`);
    decrementLogLevel();
  });

  /**
   * Safely serialize data for logging, handling circular references and Error objects
   * @param {any} data - Data to serialize
   * @returns {string} Serialized string or placeholder
   */
  function safeSerialize(data) {
    if (data === null || data === undefined) {
      return "";
    }

    // Handle Error objects - extract properties without circular references
    if (data instanceof Error) {
      const errorProps = {
        message: data.message,
        name: data.name,
        stack: data.stack?.split("\n").slice(0, 3).join("\n"), // First 3 lines of stack
      };
      // Safely extract cause if present (Node.js Error cause chain)
      if (data.cause && typeof data.cause === "object") {
        errorProps.cause =
          data.cause instanceof Error
            ? { message: data.cause.message, name: data.cause.name }
            : String(data.cause).slice(0, 100);
      }
      try {
        return JSON.stringify(errorProps);
      } catch {
        // Fallback with escaped quotes
        const msg = (data.message || "").replace(/"/g, '\\"');
        const nm = (data.name || "").replace(/"/g, '\\"');
        return `{"message":"${msg}","name":"${nm}"}`;
      }
    }

    // Handle plain objects with potential circular references
    if (typeof data === "object") {
      try {
        return JSON.stringify(data, (key, value) => {
          // Skip functions and symbols
          if (typeof value === "function" || typeof value === "symbol") {
            return "[function]";
          }
          // Detect and truncate circular references
          if (value && typeof value === "object") {
            if (key === "cause" || key === "parent" || key === "inner") {
              return "[circular]";
            }
          }
          return value;
        });
      } catch (err) {
        // Final fallback - just return type info
        return `[serialization failed: ${err.message}]`;
      }
    }

    // Primitives - convert directly
    try {
      return JSON.stringify(data);
    } catch {
      return String(data);
    }
  }

  /**
   * Format a log entry with optional data payload
   * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
   * @param {string} msg - Log message
   * @param {object} [data] - Optional structured data payload
   * @returns {string} Formatted log line
   */
  function formatLogEntry(level, msg, data) {
    const { filename, lineNumber } = getCallerInfo();
    const location = filename ? `[${filename}:${lineNumber}]` : "";
    let line = `${prefix}${location} [${level}] ${msg}`;
    if (data !== null && data !== undefined) {
      const serialized = safeSerialize(data);
      if (serialized) {
        line += ` ${serialized}`;
      }
    }
    return line + "\n";
  }

  // Logging functions - all output to stderr for systemd journal capture
  function logDebug(msg, data) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      process.stderr.write(formatLogEntry("DEBUG", msg, data));
    }
  }

  function logInfo(msg, data) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      process.stderr.write(formatLogEntry("INFO", msg, data));
    }
  }

  function logWarn(msg, data) {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      process.stderr.write(formatLogEntry("WARN", msg, data));
    }
  }

  function logError(msg, data) {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      process.stderr.write(formatLogEntry("ERROR", msg, data));
    }
  }

  return {
    logDebug,
    logInfo,
    logWarn,
    logError,
    setLogLevel,
    getLogLevel,
  };
}
