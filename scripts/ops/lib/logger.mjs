/**
 * Centralized logging library for operational scripts
 *
 * Provides level-based logging (DEBUG, INFO, WARN, ERROR) with:
 * - Dynamic log level control via SIGUSR1/SIGUSR2 signals
 * - Stderr output for systemd journal capture
 * - Environment variable configuration
 * - Optional structured data payloads
 *
 * Usage:
 *   import { createLogger } from '../lib/logger.mjs';
 *   const { logDebug, logInfo, logWarn, logError } = createLogger('my-script');
 *   logInfo('Processing request', { userId: 123, action: 'create' });
 */

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

/**
 * Get filename and line number from call stack
 * @returns {object} { filename: string, lineNumber: string }
 */
function getCallerInfo() {
  try {
    // SONAR S7722: Pass a message to the Error constructor
    const stack = new Error("stack trace").stack;
    if (!stack) return { filename: "", lineNumber: "" };

    const lines = stack.split("\n");
    // Skip:
    // 0: Error
    // 1: getCallerInfo
    // 2: formatLogEntry
    // 3: logDebug/logInfo/logWarn/logError
    // 4: actual caller (what we want)
    const callerLine = lines[4];
    if (!callerLine) return { filename: "", lineNumber: "" };

    // Extract filename and line number from patterns like:
    // "    at functionName (/path/to/file.mjs:123:45)"
    // "    at /path/to/file.mjs:123:45"
    const pathMatch = callerLine.match(/\(([^)]+)\)|\s+at\s+(.+)/);
    if (!pathMatch) return { filename: "", lineNumber: "" };

    const fullPath = pathMatch[1] || pathMatch[2];
    if (!fullPath) return { filename: "", lineNumber: "" };

    // Extract filename (without directories) and line number
    const fileMatch = fullPath.match(/([^/\\]+):(\d+):\d+/);
    if (!fileMatch) return { filename: "", lineNumber: "" };

    return {
      filename: fileMatch[1],
      lineNumber: fileMatch[2],
    };
  } catch {
    return { filename: "", lineNumber: "" };
  }
}

/**
 * Create a logger instance for a script
 * @param {string} scriptName - Name of the script (e.g., 'symphony-agent')
 * @param {object} options - Configuration options
 * @param {string} options.envVar - Environment variable name for log level (default: <SCRIPT_NAME>_LOG_LEVEL)
 * @param {string} options.defaultLevel - Default log level (default: 'DEBUG')
 * @returns {object} Logger functions: { logDebug, logInfo, logWarn, logError, setLogLevel, getLogLevel }
 */
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
        errorProps.cause = data.cause instanceof Error
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
