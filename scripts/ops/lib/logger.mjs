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
 * Create a logger instance for a script
 * @param {string} scriptName - Name of the script (e.g., 'symphony-agent')
 * @param {object} options - Configuration options
 * @param {string} options.envVar - Environment variable name for log level (default: <SCRIPT_NAME>_LOG_LEVEL)
 * @param {string} options.defaultLevel - Default log level (default: 'DEBUG')
 * @returns {object} Logger functions: { logDebug, logInfo, logWarn, logError, setLogLevel, getLogLevel }
 */
export function createLogger(scriptName, options = {}) {
  const envVarName = options.envVar || `${scriptName.toUpperCase().replace(/-/g, '_')}_LOG_LEVEL`;
  const defaultLevel = options.defaultLevel || 'ERROR';
  
  const envLogLevel = process.env[envVarName]?.toUpperCase();
  const initialLevel = LOG_LEVELS[envLogLevel] ?? LOG_LEVELS[defaultLevel];
  let currentLogLevel = initialLevel;

  const prefix = `[${scriptName}]`;

  function setLogLevel(level) {
    const levelName = Object.keys(LOG_LEVELS).find(k => LOG_LEVELS[k] === level);
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
   * Format a log entry with optional data payload
   * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
   * @param {string} msg - Log message
   * @param {object} [data] - Optional structured data payload
   * @returns {string} Formatted log line
   */
  function formatLogEntry(level, msg, data) {
    let line = `${prefix} [${level}] ${msg}`;
    if (data && typeof data === 'object') {
      try {
        line += ` ${JSON.stringify(data)}`;
      } catch (err) {
        line += ` [data serialization failed: ${err.message}]`;
      }
    }
    return line + '\n';
  }

  // Logging functions - all output to stderr for systemd journal capture
  function logDebug(msg, data) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      process.stderr.write(formatLogEntry('DEBUG', msg, data));
    }
  }

  function logInfo(msg, data) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      process.stderr.write(formatLogEntry('INFO', msg, data));
    }
  }

  function logWarn(msg, data) {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      process.stderr.write(formatLogEntry('WARN', msg, data));
    }
  }

  function logError(msg, data) {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      process.stderr.write(formatLogEntry('ERROR', msg, data));
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
