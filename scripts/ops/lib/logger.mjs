/**
 * Centralized logging library for operational scripts
 * 
 * Provides level-based logging (DEBUG, INFO, WARN, ERROR) with:
 * - Dynamic log level control via SIGUSR1/SIGUSR2 signals
 * - Stderr output for systemd journal capture
 * - Environment variable configuration
 * 
 * Usage:
 *   import { createLogger } from '../lib/logger.mjs';
 *   const { logDebug, logInfo, logWarn, logError } = createLogger('my-script');
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
    logError(`${prefix} 📊 Log level: ${levelName}`);
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
    logError(`${prefix} Received SIGUSR1 - increasing log level`);
    incrementLogLevel();
  });

  process.on("SIGUSR2", () => {
    logError(`${prefix} Received SIGUSR2 - decreasing log level`);
    decrementLogLevel();
  });

  // Logging functions - all output to stderr for systemd journal capture
  function logDebug(msg) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      process.stderr.write(msg + "\n");
    }
  }

  function logInfo(msg) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      process.stderr.write(msg + "\n");
    }
  }

  function logWarn(msg) {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      process.stderr.write(msg + "\n");
    }
  }

  function logError(msg) {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      process.stderr.write(msg + "\n");
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
