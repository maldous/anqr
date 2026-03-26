/**
 * Unit tests for logger.mjs
 *
 * Tests logging functionality including:
 * - Default log level (DEBUG)
 * - Environment variable configuration
 * - Signal handling (SIGUSR1/SIGUSR2)
 * - Log level control
 *
 * Run: npx vitest run scripts/ops/lib/logger.spec.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Dynamic import for the .mjs module (ESM-compatible)
// @ts-expect-error -- .mjs has no declaration file
const loggerModule = await import("./logger.mjs");

const { createLogger } = loggerModule;

describe("logger.mjs", () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stderrSpy.mockRestore();
    // Clean up environment variables
    delete process.env.TEST_SCRIPT_LOG_LEVEL;
    delete process.env.LOG_LEVEL;
  });

  describe("Default log level", () => {
    it("should default to DEBUG when no environment variable is set", () => {
      const { logDebug, getLogLevel } = createLogger("test-script");
      
      expect(getLogLevel()).toBe(0); // DEBUG = 0
      
      logDebug("test message");
      expect(stderrSpy).toHaveBeenCalled();
    });

    it("should use DEBUG as default level (not ERROR)", () => {
      const { logDebug, logInfo, logWarn, logError } = createLogger();
      
      // All levels should be visible with DEBUG default
      logDebug("debug");
      logInfo("info");
      logWarn("warn");
      logError("error");
      
      expect(stderrSpy).toHaveBeenCalledTimes(4);
    });

    it("should allow custom default level via options", () => {
      const { logDebug, getLogLevel } = createLogger("test", { defaultLevel: "ERROR" });
      
      expect(getLogLevel()).toBe(3); // ERROR = 3
      
      logDebug("should not appear");
      expect(stderrSpy).not.toHaveBeenCalled();
    });
  });

  describe("Environment variable configuration", () => {
    it("should read log level from script-specific env var", () => {
      process.env.TEST_SCRIPT_LOG_LEVEL = "ERROR";
      const { logDebug, logError, getLogLevel } = createLogger("test-script");
      
      expect(getLogLevel()).toBe(3); // ERROR = 3
      
      logDebug("should not appear");
      expect(stderrSpy).not.toHaveBeenCalled();
      
      stderrSpy.mockClear();
      logError("should appear");
      expect(stderrSpy).toHaveBeenCalled();
    });

    it("should use generic LOG_LEVEL for unnamed loggers", () => {
      process.env.LOG_LEVEL = "WARN";
      const { logInfo, logWarn, getLogLevel } = createLogger();
      
      expect(getLogLevel()).toBe(2); // WARN = 2
      
      logInfo("should not appear");
      expect(stderrSpy).not.toHaveBeenCalled();
      
      stderrSpy.mockClear();
      logWarn("should appear");
      expect(stderrSpy).toHaveBeenCalled();
    });

    it("should support custom env var name via options", () => {
      process.env.CUSTOM_LOG_VAR = "INFO";
      const { logDebug, logInfo, getLogLevel } = createLogger("test", { 
        envVar: "CUSTOM_LOG_VAR" 
      });
      
      expect(getLogLevel()).toBe(1); // INFO = 1
      
      logDebug("should not appear");
      expect(stderrSpy).not.toHaveBeenCalled();
      
      stderrSpy.mockClear();
      logInfo("should appear");
      expect(stderrSpy).toHaveBeenCalled();
    });
  });

  describe("Log level control", () => {
    it("should allow setting log level programmatically", () => {
      const { logDebug, setLogLevel, getLogLevel } = createLogger();
      
      setLogLevel(3); // ERROR
      expect(getLogLevel()).toBe(3);
      
      logDebug("should not appear");
      expect(stderrSpy).toHaveBeenCalledTimes(1); // Only the setLogLevel notification
    });

    it("should log level changes to stderr", () => {
      const { setLogLevel } = createLogger("test");
      
      setLogLevel(1); // INFO
      
      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining("[test]")
      );
      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining("Log level: INFO")
      );
    });
  });

  describe("Log formatting", () => {
    it("should include script name prefix when provided", () => {
      const { logInfo } = createLogger("my-script");
      
      logInfo("test message");
      
      const call = stderrSpy.mock.calls[0][0] as string;
      expect(call).toContain("[my-script]");
      expect(call).toContain("test message");
    });

    it("should include log level in output", () => {
      const { logDebug, logInfo, logWarn, logError } = createLogger();
      
      logDebug("debug msg");
      logInfo("info msg");
      logWarn("warn msg");
      logError("error msg");
      
      const calls = stderrSpy.mock.calls.map((c: any) => c[0] as string);
      expect(calls[0]).toContain("[DEBUG]");
      expect(calls[1]).toContain("[INFO]");
      expect(calls[2]).toContain("[WARN]");
      expect(calls[3]).toContain("[ERROR]");
    });

    it("should serialize structured data as JSON", () => {
      const { logInfo } = createLogger();
      
      logInfo("event occurred", { userId: 123, action: "create" });
      
      const call = stderrSpy.mock.calls[0][0] as string;
      expect(call).toContain("event occurred");
      expect(call).toContain('"userId":123');
      expect(call).toContain('"action":"create"');
    });

    it("should handle serialization errors gracefully", () => {
      const { logInfo } = createLogger();
      
      const circular: any = {};
      circular.self = circular;
      
      logInfo("circular object", circular);
      
      const call = stderrSpy.mock.calls[0][0] as string;
      expect(call).toContain("circular object");
      expect(call).toContain("serialization failed");
    });

    it("should include filename and line number in output", () => {
      const { logInfo } = createLogger();
      
      logInfo("test message");
      
      const call = stderrSpy.mock.calls[0][0] as string;
      // Should contain [filename:lineNumber] format
      expect(call).toMatch(/\[logger\.spec\.ts:\d+\]/);
    });
  });

  describe("Log level filtering", () => {
    it("should filter messages below current level", () => {
      const { logDebug, logInfo, logWarn, logError, setLogLevel } = createLogger();
      
      setLogLevel(2); // WARN
      stderrSpy.mockClear();
      
      logDebug("filtered");
      logInfo("filtered");
      logWarn("visible");
      logError("visible");
      
      expect(stderrSpy).toHaveBeenCalledTimes(2);
    });

    it("should show all messages at DEBUG level", () => {
      const { logDebug, logInfo, logWarn, logError, setLogLevel } = createLogger();
      
      setLogLevel(0); // DEBUG
      stderrSpy.mockClear();
      
      logDebug("1");
      logInfo("2");
      logWarn("3");
      logError("4");
      
      expect(stderrSpy).toHaveBeenCalledTimes(4);
    });

    it("should show only errors at ERROR level", () => {
      const { logDebug, logInfo, logWarn, logError, setLogLevel } = createLogger();
      
      setLogLevel(3); // ERROR
      stderrSpy.mockClear();
      
      logDebug("filtered");
      logInfo("filtered");
      logWarn("filtered");
      logError("visible");
      
      expect(stderrSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty script name", () => {
      const { logInfo } = createLogger("");
      
      logInfo("message");
      
      const call = stderrSpy.mock.calls[0][0] as string;
      expect(call).toContain("message");
    });

    it("should handle script names with hyphens", () => {
      const { logInfo } = createLogger("my-test-script");
      
      logInfo("message");
      
      const call = stderrSpy.mock.calls[0][0] as string;
      expect(call).toContain("[my-test-script]");
    });

    it("should handle invalid log level in env var", () => {
      process.env.TEST_LOG_LEVEL = "INVALID";
      const { getLogLevel } = createLogger("test");
      
      // Should fall back to default (DEBUG = 0)
      expect(getLogLevel()).toBe(0);
    });

    it("should handle undefined data parameter", () => {
      const { logInfo } = createLogger();
      
      logInfo("message", undefined);
      
      const call = stderrSpy.mock.calls[0][0] as string;
      expect(call).toContain("message");
      expect(call).not.toContain("undefined");
    });

    it("should handle null data parameter", () => {
      const { logInfo } = createLogger();
      
      logInfo("message", null);
      
      const call = stderrSpy.mock.calls[0][0] as string;
      expect(call).toContain("message");
    });
  });
});
