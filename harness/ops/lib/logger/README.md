# ANQR Logger

## 1. Directory Overview

This directory contains the logging utilities for the ANQR (Agentic Number Query Runner) harness. It provides a flexible, configurable logging system with support for log levels, dynamic adjustment via signals, safe serialization of complex objects (including Error objects with circular references), and caller location tracking.

## 2. File Summaries

### log-levels.mjs

Exports the `LOG_LEVELS` constant object defining the log severity hierarchy:
- `DEBUG` = 0 (most verbose)
- `INFO` = 1
- `WARN` = 2
- `ERROR` = 3 (least verbose, only errors shown)

This numeric ordering enables simple level comparison (`currentLogLevel <= LOG_LEVELS.DEBUG`).

### get-caller-info.mjs

Exports the `getCallerInfo()` function that extracts caller location from the JavaScript stack trace. It parses the stack to find the filename and line number of the actual caller (skipping internal logger frames). Returns `{ filename: string, lineNumber: string }`. Used by the logger to add location context to log entries.

Key implementation details:
- Skips stack lines 0-3 (Error constructor, getCallerInfo, formatLogEntry, and logging functions)
- Line 4 contains the actual caller
- Uses regex to extract path and line number from patterns like `at functionName (/path/to/file.mjs:123:45)`

### create-logger.mjs

The main logger factory module. Exports `createLogger(scriptName, options)` which returns a logger instance with the following API:

**Functions returned:**
- `logDebug(msg, data)` - Log at DEBUG level
- `logInfo(msg, data)` - Log at INFO level
- `logWarn(msg, data)` - Log at WARN level
- `logError(msg, data)` - Log at ERROR level
- `setLogLevel(level)` - Programmatically set log level
- `getLogLevel()` - Get current log level

**Features:**
- **Environment variable control**: Reads log level from `{SCRIPT_NAME}_LOG_LEVEL` env var or `LOG_LEVEL` (default: INFO)
- **Signal-based control** (lower numeric level = more verbose):
  - `SIGUSR1` increments level (DEBUG→INFO→WARN→ERROR = less verbose)
  - `SIGUSR2` decrements level (ERROR→WARN→INFO→DEBUG = more verbose)
- **Safe serialization**: Handles circular references, Error objects with cause chains, functions, and symbols
- **Location tracking**: Uses `getCallerInfo()` to add `[filename:lineNumber]` to log entries
- **stderr output**: All logging writes to stderr for systemd journal compatibility

The module includes extensive inline documentation with JSDoc annotations.

### index.mjs

Generated facade index that re-exports all public API members:
- `LOG_LEVELS` from `./log-levels.mjs`
- `getCallerInfo` from `./get-caller-info.mjs`
- `createLogger` from `./create-logger.mjs`

## 3. Overall Directory Function

This directory provides the core logging infrastructure for the ANQR harness. The modules work together as follows:

1. **log-levels.mjs** defines the severity scale used by all logging decisions
2. **get-caller-info.mjs** provides the location tracking capability
3. **create-logger.mjs** ties everything together into a usable logger factory with all features

The logger is used throughout the harness (imported via `../../lib/logger.mjs` facade) to provide consistent, configurable logging with:
- Structured log levels for filtering
- Dynamic runtime adjustment without code changes
- Safe handling of complex data structures
- Helpful context (script name, file location)

## 4. Usage Instructions

### Creating a logger

```javascript
import { createLogger } from "./ops/lib/logger/index.mjs";

// Simple logger with default settings
const logger = createLogger("my-script");

// Custom configuration
const logger = createLogger("my-script", {
  envVar: "MY_LOG_LEVEL",      // Custom env var (default: MY_SCRIPT_LOG_LEVEL)
  defaultLevel: "DEBUG"        // Default if env var not set
});

// Log messages
logger.logDebug("Detailed debugging info", { key: "value" });
logger.logInfo("Informational message", { count: 42 });
logger.logWarn("Warning condition", { reason: "something" });
logger.logError("Error occurred", errorObject);

// Dynamic level control
logger.setLogLevel("DEBUG");
const currentLevel = logger.getLogLevel();
```

### Environment variable control

```bash
# Set log level via environment variable
MY_SCRIPT_LOG_LEVEL=DEBUG node my-script.mjs
# Or using the generic LOG_LEVEL
LOG_LEVEL=WARN node my-script.mjs
```

### Signal-based control (while running)

```bash
# Increase verbosity (more detailed logging)
kill -SIGUSR2 $pid

# Decrease verbosity (less detailed)
kill -SIGUSR1 $pid
```

### Import from facade

Most harness modules import via the facade:
```javascript
import { createLogger } from "./ops/lib/logger.mjs";
```

## 5. Dependencies

### Runtime Dependencies

- **Node.js** - ESM modules with .mjs extension
- **process.stderr** - Used for all log output (systemd journal capture)

### Internal Dependencies

- No external package dependencies
- All modules are self-contained

### Environment Variables

- `{SCRIPT_NAME}_LOG_LEVEL` - Log level for specific script (hyphens converted to asterisks, e.g., `my-script` → `MY*SCRIPT_LOG_LEVEL`)
- `LOG_LEVEL` - Fallback log level if script-specific var not set

## 6. Additional Comments

- **stderr vs stdout**: All logging goes to stderr to separate log output from program output. This is the recommended practice for systemd services.

- **Signal handling**: SIGUSR1/SIGUSR2 are used for dynamic log level adjustment - this is a common Unix pattern for runtime configuration.

- **safeSerialize edge cases**: The serializer handles:
  - `null`/`undefined` - returns empty string
  - `Error` objects - extracts message, name, stack (first 3 lines), and cause
  - Circular references - detected and replaced with `[circular]` for cause/parent/inner keys
  - Functions/symbols - replaced with `[function]`
  - Other objects - JSON.stringify with replacer function

- **Location tracking**: The caller info feature adds `[filename:lineNumber]` to log entries, making it easier to identify where logs originate in source code.

- **Log level ordering**: Lower values = more verbose. DEBUG (0) shows everything, ERROR (3) shows only errors.