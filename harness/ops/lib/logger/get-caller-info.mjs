export function getCallerInfo() {
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
