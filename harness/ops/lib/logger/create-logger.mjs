import { LOG_LEVELS } from "./log-levels.mjs";
import { getCallerInfo } from "./get-caller-info.mjs";

const LOGGER_REGISTRY_KEY = Symbol.for("anqr.logger.registry");
const LOGGER_SIGNAL_SETUP_KEY = Symbol.for("anqr.logger.signal-setup");

const MAX_LOG_STRING_LENGTH = 240;
const MAX_LOG_ARRAY_ITEMS = 8;
const MAX_LOG_OBJECT_KEYS = 20;
const MAX_LOG_DEPTH = 3;

function getLoggerRegistry() {
  if (!globalThis[LOGGER_REGISTRY_KEY]) {
    globalThis[LOGGER_REGISTRY_KEY] = new Set();
  }
  return globalThis[LOGGER_REGISTRY_KEY];
}

function sanitizeText(value) {
  return String(value || "");
}

function summarizeObjectKeys(value) {
  return Object.keys(value || {}).slice(0, MAX_LOG_OBJECT_KEYS);
}

function truncateText(value, limit = MAX_LOG_STRING_LENGTH) {
  const text = sanitizeText(value);
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

export function createLogger(scriptName = "", options = {}) {
    const text = sanitizeText(value);
    return text.length > limit ? `${text.slice(0, limit)}…` : text;
  }

  function sanitizeValue(value, key = "", depth = 0, seen = new WeakSet()) {
    if (value === null || value === undefined) return value;
    if (depth > MAX_LOG_DEPTH) return "[depth-limited]";

    if (typeof value === "string") {
      if (/^requestBodyValues$|^responseBody$|^body$|^stack$/i.test(key)) {
        return truncateText(value, 160);
      }
      return truncateText(value);
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return value;
    }

    if (typeof value === "function" || typeof value === "symbol") {
      return `[${typeof value}]`;
    }

    if (value instanceof Error) {
      return {
        name: value.name,
        message: truncateText(value.message, 200),
        code: value.code || null,
        statusCode: value.statusCode || value.status || null,
        cause:
          value.cause && typeof value.cause === "object"
            ? sanitizeValue(value.cause, "cause", depth + 1, seen)
            : value.cause
              ? truncateText(value.cause, 120)
              : null,
      };
    }

    if (Array.isArray(value)) {
      const prefix = value
        .slice(0, MAX_LOG_ARRAY_ITEMS)
        .map((item) => sanitizeValue(item, key, depth + 1, seen));
      if (value.length > MAX_LOG_ARRAY_ITEMS) {
        prefix.push(`[+${value.length - MAX_LOG_ARRAY_ITEMS} more]`);
      }
      return prefix;
    }

    if (typeof value === "object") {
      if (seen.has(value)) return "[circular]";
      seen.add(value);

      if (/headers/i.test(key)) {
        const entries = Object.entries(value).slice(0, MAX_LOG_OBJECT_KEYS);
        return Object.fromEntries(
          entries.map(([childKey, childValue]) => [childKey, truncateText(childValue, 80)]),
        );
      }

      if (/requestBodyValues|responseBody|body|raw/i.test(key)) {
        return {
          summary: summarizeObjectKeys(value),
          type: Array.isArray(value) ? "array" : "object",
        };
      }

      if (key === "tools") {
        const sample = Array.isArray(value)
          ? value
              .slice(0, MAX_LOG_ARRAY_ITEMS)
              .map((item) => item?.name || item?.toolName || item?.type || "tool")
          : summarizeObjectKeys(value);
        return {
          count: Array.isArray(value) ? value.length : Object.keys(value).length,
          sample,
        };
      }

      const entries = Object.entries(value).slice(0, MAX_LOG_OBJECT_KEYS);
      const sanitized = {};
      for (const [childKey, childValue] of entries) {
        sanitized[childKey] = sanitizeValue(childValue, childKey, depth + 1, seen);
      }
      const totalKeys = Object.keys(value).length;
      if (totalKeys > MAX_LOG_OBJECT_KEYS) {
        sanitized.__truncatedKeys = totalKeys - MAX_LOG_OBJECT_KEYS;
      }
      return sanitized;
    }

    return truncateText(value);
  }

  function ensureSignalHandlers() {
    if (globalThis[LOGGER_SIGNAL_SETUP_KEY]) return;

    const applyToAllLoggers = (direction, signal) => {
      const registry = getLoggerRegistry();
      process.stderr.write(
        `[logger] [INFO] Received ${signal} - ${direction} verbosity for ${registry.size} logger(s)\n`,
      );
      for (const logger of registry) {
        if (direction === "decrease") logger.incrementLogLevel();
        else logger.decrementLogLevel();
      }
    };

    process.on("SIGUSR1", () => applyToAllLoggers("decrease", "SIGUSR1"));
    process.on("SIGUSR2", () => applyToAllLoggers("increase", "SIGUSR2"));
    globalThis[LOGGER_SIGNAL_SETUP_KEY] = true;
  }

  const envVarName = scriptName
    ? options.envVar || `${scriptName.toUpperCase().replaceAll("-", "_")}_LOG_LEVEL`
    : "LOG_LEVEL";
  const defaultLevel = options.defaultLevel || "INFO";

  const envLogLevel = process.env[envVarName]?.toUpperCase();
  const initialLevel = LOG_LEVELS[envLogLevel] ?? LOG_LEVELS[defaultLevel];
  const prefix = scriptName ? `[${scriptName}]` : "";
  let currentLogLevel = initialLevel;

  function setLogLevel(level) {
    const levelName = Object.keys(LOG_LEVELS).find((key) => LOG_LEVELS[key] === level);
    currentLogLevel = level;
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

  const loggerControls = { incrementLogLevel, decrementLogLevel };
  ensureSignalHandlers();
  getLoggerRegistry().add(loggerControls);

  function safeSerialize(data) {
    if (data === null || data === undefined) {
      return "";
    }

    try {
      return JSON.stringify(sanitizeValue(data));
    } catch (err) {
      return `[serialization failed: ${truncateText(err?.message || String(err), 120)}]`;
    }
  }

  function formatLogEntry(level, msg, data) {
    const { filename, lineNumber } = getCallerInfo();
    const location = filename ? `[${filename}:${lineNumber}]` : "";
    let line = `${prefix}${location} [${level}] ${truncateText(msg, 400)}`;
    if (data !== null && data !== undefined) {
      const serialized = safeSerialize(data);
      if (serialized) {
        line += ` ${serialized}`;
      }
    }
    return `${line}\n`;
  }

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
