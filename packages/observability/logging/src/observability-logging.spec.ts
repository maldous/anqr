import { describe, it, expect, beforeEach, vi } from "vitest";
import { levels } from "./log-levels.const";
import { LOG_LEVEL_INDEX } from "./logger-level-index";
import { SENSITIVE_KEYS } from "./sensitive-keys.const";
import { REDACTED } from "./redacted.const";
import { redactSensitive } from "./logger-redaction";
import { maxDepthRedaction } from "./max-depth-redaction";
import { sanitizeLogContext } from "./sanitize-log-context";
import { safeJsonReplacer } from "./safe-json-replacer";
import { extractObjectProperties } from "./extract-object-properties";
import { safeSerializeContext } from "./logger-context-serialization";
import {
  loggerState,
  MAX_BUFFER_SIZE,
  MAX_STRUCTURED_BUFFER_SIZE,
  MAX_CONTEXT_DEPTH,
} from "./logger-state";
import { enableLogBuffer } from "./enable-log-buffer";
import { disableLogBuffer } from "./disable-log-buffer";
import { flushLogBuffer } from "./flush-log-buffer";
import { getBufferSize } from "./get-buffer-size";
import { getStructuredLogs } from "./get-structured-logs";
import { getStructuredLogCount } from "./get-structured-log-count";
import { clearStructuredLogs } from "./clear-structured-logs";
import { filterLogs } from "./filter-logs";
import { filterLogsByScopes } from "./filter-logs-by-scopes";
import { filterLogsByLevel } from "./filter-logs-by-level";
import { captureToBuffer } from "./logger-capture-to-buffer";
import { logTimestamp } from "./log-timestamp";
import { SCOPE_PREFIXES } from "./logger-scope-prefixes";
import { sentryModuleState } from "./sentry-module-state";
import { captureErrorEvent } from "./capture-error-event";

function resetLoggerState(): void {
  loggerState.logBufferEnabled = false;
  loggerState.logBuffer = [];
  loggerState.structuredLogBuffer = [];
}

describe("observability/logging", () => {
  beforeEach(() => {
    resetLoggerState();
  });

  // ── levels const ───────────────────────────────────────────────

  describe("levels", () => {
    it("maps 0 to trace", () => {
      expect(levels[0]).toBe("trace");
    });

    it("maps 1 to debug", () => {
      expect(levels[1]).toBe("debug");
    });

    it("maps 2 to info", () => {
      expect(levels[2]).toBe("info");
    });

    it("maps 3 to warn", () => {
      expect(levels[3]).toBe("warn");
    });

    it("maps 4 to error", () => {
      expect(levels[4]).toBe("error");
    });

    it("maps 5 to silent", () => {
      expect(levels[5]).toBe("silent");
    });

    it("has exactly 6 entries", () => {
      expect(Object.keys(levels)).toHaveLength(6);
    });
  });

  // ── LOG_LEVEL_INDEX ────────────────────────────────────────────

  describe("LOG_LEVEL_INDEX", () => {
    it("maps trace to 0", () => {
      expect(LOG_LEVEL_INDEX.trace).toBe(0);
    });

    it("maps debug to 1", () => {
      expect(LOG_LEVEL_INDEX.debug).toBe(1);
    });

    it("maps info to 2", () => {
      expect(LOG_LEVEL_INDEX.info).toBe(2);
    });

    it("maps warn to 3", () => {
      expect(LOG_LEVEL_INDEX.warn).toBe(3);
    });

    it("maps error to 4", () => {
      expect(LOG_LEVEL_INDEX.error).toBe(4);
    });

    it("maps silent to 5", () => {
      expect(LOG_LEVEL_INDEX.silent).toBe(5);
    });

    it("is inverse of levels", () => {
      for (const [num, name] of Object.entries(levels)) {
        expect(LOG_LEVEL_INDEX[name]).toBe(Number(num));
      }
    });
  });

  // ── SENSITIVE_KEYS ─────────────────────────────────────────────

  describe("SENSITIVE_KEYS", () => {
    it("is a Set", () => {
      expect(SENSITIVE_KEYS).toBeInstanceOf(Set);
    });

    it("contains password", () => {
      expect(SENSITIVE_KEYS.has("password")).toBe(true);
    });

    it("contains token", () => {
      expect(SENSITIVE_KEYS.has("token")).toBe(true);
    });

    it("contains authorization", () => {
      expect(SENSITIVE_KEYS.has("authorization")).toBe(true);
    });

    it("contains api_key", () => {
      expect(SENSITIVE_KEYS.has("api_key")).toBe(true);
    });

    it("does not contain non-sensitive keys", () => {
      expect(SENSITIVE_KEYS.has("username")).toBe(false);
      expect(SENSITIVE_KEYS.has("email")).toBe(false);
    });
  });

  // ── REDACTED ───────────────────────────────────────────────────

  describe("REDACTED", () => {
    it("is [REDACTED]", () => {
      expect(REDACTED).toBe("[REDACTED]");
    });
  });

  // ── Constants ──────────────────────────────────────────────────

  describe("state constants", () => {
    it("MAX_BUFFER_SIZE is 2000", () => {
      expect(MAX_BUFFER_SIZE).toBe(2000);
    });

    it("MAX_STRUCTURED_BUFFER_SIZE is 5000", () => {
      expect(MAX_STRUCTURED_BUFFER_SIZE).toBe(5000);
    });

    it("MAX_CONTEXT_DEPTH is 10", () => {
      expect(MAX_CONTEXT_DEPTH).toBe(10);
    });
  });

  // ── SCOPE_PREFIXES ─────────────────────────────────────────────

  describe("SCOPE_PREFIXES", () => {
    it("has MAIN scope", () => {
      expect(SCOPE_PREFIXES.MAIN).toBe("MAIN");
    });

    it("has QART scope", () => {
      expect(SCOPE_PREFIXES.QART).toBe("QART");
    });

    it("has ERROR scope", () => {
      expect(SCOPE_PREFIXES.ERROR).toBe("ERROR");
    });

    it("has TELEMETRY scope", () => {
      expect(SCOPE_PREFIXES.TELEMETRY).toBe("TELEMETRY");
    });

    it("has at least 20 scopes", () => {
      expect(Object.keys(SCOPE_PREFIXES).length).toBeGreaterThanOrEqual(20);
    });
  });

  // ── maxDepthRedaction ──────────────────────────────────────────

  describe("maxDepthRedaction", () => {
    it("returns null for depth 0", () => {
      expect(maxDepthRedaction(0)).toBeNull();
    });

    it("returns null for depth at MAX_CONTEXT_DEPTH", () => {
      expect(maxDepthRedaction(MAX_CONTEXT_DEPTH)).toBeNull();
    });

    it("returns [MAX_DEPTH] for depth above MAX_CONTEXT_DEPTH", () => {
      expect(maxDepthRedaction(MAX_CONTEXT_DEPTH + 1)).toBe("[MAX_DEPTH]");
    });

    it("returns [MAX_DEPTH] for very large depth", () => {
      expect(maxDepthRedaction(100)).toBe("[MAX_DEPTH]");
    });
  });

  // ── redactSensitive ────────────────────────────────────────────

  describe("redactSensitive", () => {
    it("returns null for null", () => {
      expect(redactSensitive(null)).toBeNull();
    });

    it("returns undefined for undefined", () => {
      expect(redactSensitive(undefined)).toBeUndefined();
    });

    it("returns primitives unchanged", () => {
      expect(redactSensitive(42)).toBe(42);
      expect(redactSensitive("hello")).toBe("hello");
      expect(redactSensitive(true)).toBe(true);
    });

    it("redacts password field", () => {
      const result = redactSensitive({ password: "secret123" });
      expect(result).toEqual({ password: REDACTED });
    });

    it("redacts token field", () => {
      const result = redactSensitive({ token: "abc" });
      expect(result).toEqual({ token: REDACTED });
    });

    it("preserves non-sensitive fields", () => {
      const result = redactSensitive({ name: "Alice", password: "x" });
      expect(result).toEqual({ name: "Alice", password: REDACTED });
    });

    it("redacts nested objects", () => {
      const result = redactSensitive({ config: { token: "abc", user: "bob" } }) as Record<
        string,
        unknown
      >;
      expect(result.config).toEqual({ token: REDACTED, user: "bob" });
    });

    it("handles arrays", () => {
      const result = redactSensitive([{ password: "x" }, { name: "y" }]);
      expect(result).toEqual([{ password: REDACTED }, { name: "y" }]);
    });

    it("returns Error instances unchanged", () => {
      const err = new Error("test");
      expect(redactSensitive(err)).toBe(err);
    });

    it("returns Set instances unchanged", () => {
      const s = new Set([1, 2]);
      expect(redactSensitive(s)).toBe(s);
    });

    it("returns Map instances unchanged", () => {
      const m = new Map([["a", 1]]);
      expect(redactSensitive(m)).toBe(m);
    });

    it("is case-insensitive for key matching", () => {
      const result = redactSensitive({ PASSWORD: "x", Token: "y" });
      expect(result).toEqual({ PASSWORD: REDACTED, Token: REDACTED });
    });
  });

  // ── sanitizeLogContext ─────────────────────────────────────────

  describe("sanitizeLogContext", () => {
    it("returns undefined for undefined", () => {
      expect(sanitizeLogContext(undefined)).toBeUndefined();
    });

    it("redacts sensitive keys in context", () => {
      const result = sanitizeLogContext({ token: "secret", user: "alice" });
      expect(result).toEqual({ token: REDACTED, user: "alice" });
    });

    it("preserves safe context", () => {
      const result = sanitizeLogContext({ action: "login", count: 5 });
      expect(result).toEqual({ action: "login", count: 5 });
    });
  });

  // ── safeJsonReplacer ───────────────────────────────────────────

  describe("safeJsonReplacer", () => {
    it("passes through primitives", () => {
      expect(safeJsonReplacer("", "hello")).toBe("hello");
      expect(safeJsonReplacer("", 42)).toBe(42);
      expect(safeJsonReplacer("", true)).toBe(true);
      expect(safeJsonReplacer("", null)).toBeNull();
    });

    it("converts Error to object", () => {
      const err = new Error("test error");
      const result = safeJsonReplacer("", err) as Record<string, unknown>;
      expect(result.__type).toBe("Error");
      expect(result.name).toBe("Error");
      expect(result.message).toBe("test error");
      expect(result.stack).toBeDefined();
    });

    it("converts Set to object with values", () => {
      const result = safeJsonReplacer("", new Set([1, 2, 3])) as Record<string, unknown>;
      expect(result.__type).toBe("Set");
      expect(result.values).toEqual([1, 2, 3]);
    });

    it("converts Map to object with entries", () => {
      const result = safeJsonReplacer(
        "",
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
      ) as Record<string, unknown>;
      expect(result.__type).toBe("Map");
      expect(result.entries).toEqual([
        ["a", 1],
        ["b", 2],
      ]);
    });

    it("converts functions to [Function]", () => {
      expect(safeJsonReplacer("", () => {})).toBe("[Function]");
    });

    it("converts Uint8Array to object with values", () => {
      const result = safeJsonReplacer("", new Uint8Array([1, 2, 3])) as Record<string, unknown>;
      expect(result.__type).toBe("Uint8Array");
      expect(result.values).toEqual([1, 2, 3]);
    });

    it("passes through plain objects", () => {
      const obj = { foo: "bar" };
      expect(safeJsonReplacer("", obj)).toBe(obj);
    });
  });

  // ── extractObjectProperties ────────────────────────────────────

  describe("extractObjectProperties", () => {
    it("extracts simple properties", () => {
      expect(extractObjectProperties({ a: 1, b: "two" })).toEqual({ a: 1, b: "two" });
    });

    it("converts functions to [Function]", () => {
      expect(extractObjectProperties({ fn: () => {} })).toEqual({ fn: "[Function]" });
    });

    it("handles null values", () => {
      expect(extractObjectProperties({ x: null })).toEqual({ x: null });
    });

    it("handles undefined values", () => {
      expect(extractObjectProperties({ x: undefined })).toEqual({ x: undefined });
    });

    it("deep clones nested objects", () => {
      const nested = { inner: { val: 42 } };
      const result = extractObjectProperties(nested) as Record<string, unknown>;
      expect(result.inner).toEqual({ val: 42 });
      expect(result.inner).not.toBe(nested.inner);
    });
  });

  // ── safeSerializeContext ───────────────────────────────────────

  describe("safeSerializeContext", () => {
    it("returns null for null", () => {
      expect(safeSerializeContext(null)).toBeNull();
    });

    it("returns undefined for undefined", () => {
      expect(safeSerializeContext(undefined)).toBeUndefined();
    });

    it("clones simple objects", () => {
      const obj = { a: 1, b: "two" };
      const result = safeSerializeContext(obj);
      expect(result).toEqual(obj);
      expect(result).not.toBe(obj);
    });

    it("handles nested objects", () => {
      const obj = { nested: { deep: true } };
      const result = safeSerializeContext(obj) as Record<string, unknown>;
      expect(result).toEqual(obj);
    });
  });

  // ── logTimestamp ───────────────────────────────────────────────

  describe("logTimestamp", () => {
    it("returns a string", () => {
      expect(typeof logTimestamp()).toBe("string");
    });

    it("does not contain colons", () => {
      expect(logTimestamp()).not.toContain(":");
    });

    it("does not contain dots", () => {
      expect(logTimestamp()).not.toContain(".");
    });

    it("contains date components separated by dashes", () => {
      const ts = logTimestamp();
      expect(ts.split("-").length).toBeGreaterThanOrEqual(5);
    });
  });

  // ── enableLogBuffer / disableLogBuffer / flushLogBuffer ────────

  describe("enableLogBuffer", () => {
    it("sets logBufferEnabled to true", () => {
      enableLogBuffer();
      expect(loggerState.logBufferEnabled).toBe(true);
    });

    it("resets the log buffer", () => {
      loggerState.logBuffer = ["old"];
      enableLogBuffer();
      expect(loggerState.logBuffer).toEqual([]);
    });
  });

  describe("disableLogBuffer", () => {
    it("sets logBufferEnabled to false", () => {
      loggerState.logBufferEnabled = true;
      disableLogBuffer();
      expect(loggerState.logBufferEnabled).toBe(false);
    });
  });

  describe("flushLogBuffer", () => {
    it("returns empty string when buffer is empty", () => {
      expect(flushLogBuffer()).toBe("");
    });

    it("joins buffer lines with newlines", () => {
      loggerState.logBuffer = ["line1", "line2", "line3"];
      expect(flushLogBuffer()).toBe("line1\nline2\nline3");
    });

    it("resets the buffer after flush", () => {
      loggerState.logBuffer = ["line1"];
      flushLogBuffer();
      expect(loggerState.logBuffer).toEqual([]);
    });
  });

  // ── getBufferSize ──────────────────────────────────────────────

  describe("getBufferSize", () => {
    it("returns 0 for empty buffer", () => {
      expect(getBufferSize()).toBe(0);
    });

    it("returns correct count", () => {
      loggerState.logBuffer = ["a", "b", "c"];
      expect(getBufferSize()).toBe(3);
    });
  });

  // ── structured log access ──────────────────────────────────────

  describe("getStructuredLogs", () => {
    it("returns empty array initially", () => {
      expect(getStructuredLogs()).toEqual([]);
    });

    it("returns a copy of structured buffer", () => {
      loggerState.structuredLogBuffer.push({
        timestamp: "t",
        scope: "TEST",
        level: "info",
        message: "hello",
      });
      const logs = getStructuredLogs();
      expect(logs).toHaveLength(1);
      expect(logs).not.toBe(loggerState.structuredLogBuffer);
    });
  });

  describe("getStructuredLogCount", () => {
    it("returns 0 initially", () => {
      expect(getStructuredLogCount()).toBe(0);
    });

    it("returns correct count", () => {
      loggerState.structuredLogBuffer.push(
        { timestamp: "t", scope: "A", level: "info", message: "m" },
        { timestamp: "t", scope: "B", level: "warn", message: "m" },
      );
      expect(getStructuredLogCount()).toBe(2);
    });
  });

  describe("clearStructuredLogs", () => {
    it("empties the structured buffer", () => {
      loggerState.structuredLogBuffer.push({
        timestamp: "t",
        scope: "A",
        level: "info",
        message: "m",
      });
      clearStructuredLogs();
      expect(getStructuredLogCount()).toBe(0);
    });
  });

  // ── filterLogs ─────────────────────────────────────────────────

  describe("filterLogs", () => {
    beforeEach(() => {
      loggerState.structuredLogBuffer = [
        { timestamp: "t1", scope: "QART", level: "info", message: "a" },
        { timestamp: "t2", scope: "MAIN", level: "warn", message: "b" },
        { timestamp: "t3", scope: "QART", level: "error", message: "c" },
      ];
    });

    it("filters by scope (case-insensitive)", () => {
      const result = filterLogs("qart");
      expect(result).toHaveLength(2);
      expect(result[0].message).toBe("a");
      expect(result[1].message).toBe("c");
    });

    it("returns empty for non-matching scope", () => {
      expect(filterLogs("UNKNOWN")).toEqual([]);
    });
  });

  describe("filterLogsByScopes", () => {
    beforeEach(() => {
      loggerState.structuredLogBuffer = [
        { timestamp: "t1", scope: "QART", level: "info", message: "a" },
        { timestamp: "t2", scope: "MAIN", level: "warn", message: "b" },
        { timestamp: "t3", scope: "ERROR", level: "error", message: "c" },
      ];
    });

    it("filters by multiple scopes", () => {
      const result = filterLogsByScopes(["QART", "ERROR"]);
      expect(result).toHaveLength(2);
    });

    it("is case-insensitive", () => {
      const result = filterLogsByScopes(["qart"]);
      expect(result).toHaveLength(1);
    });
  });

  describe("filterLogsByLevel", () => {
    beforeEach(() => {
      loggerState.structuredLogBuffer = [
        { timestamp: "t1", scope: "A", level: "info", message: "a" },
        { timestamp: "t2", scope: "A", level: "warn", message: "b" },
        { timestamp: "t3", scope: "A", level: "error", message: "c" },
      ];
    });

    it("filters by single level", () => {
      const result = filterLogsByLevel(["error"]);
      expect(result).toHaveLength(1);
      expect(result[0].message).toBe("c");
    });

    it("filters by multiple levels", () => {
      const result = filterLogsByLevel(["warn", "error"]);
      expect(result).toHaveLength(2);
    });

    it("is case-insensitive", () => {
      const result = filterLogsByLevel(["INFO"]);
      expect(result).toHaveLength(1);
    });
  });

  // ── captureToBuffer ────────────────────────────────────────────

  describe("captureToBuffer", () => {
    it("does nothing when both capture options are false", () => {
      captureToBuffer("TEST", "info", "msg", undefined, {
        captureStructured: false,
        captureString: false,
      });
      expect(getStructuredLogCount()).toBe(0);
      expect(getBufferSize()).toBe(0);
    });

    it("captures structured log entry", () => {
      captureToBuffer(
        "TEST",
        "info",
        "hello",
        { key: "val" },
        {
          captureStructured: true,
          captureString: false,
        },
      );
      expect(getStructuredLogCount()).toBe(1);
      const logs = getStructuredLogs();
      expect(logs[0].scope).toBe("TEST");
      expect(logs[0].level).toBe("info");
      expect(logs[0].message).toBe("hello");
    });

    it("captures string log entry", () => {
      captureToBuffer("TEST", "warn", "warning msg", undefined, {
        captureStructured: false,
        captureString: true,
      });
      expect(getBufferSize()).toBe(1);
      const flushed = flushLogBuffer();
      expect(flushed).toContain("TEST");
      expect(flushed).toContain("warn");
      expect(flushed).toContain("warning msg");
    });

    it("captures both when both options are true", () => {
      captureToBuffer("SC", "error", "err", undefined, {
        captureStructured: true,
        captureString: true,
      });
      expect(getStructuredLogCount()).toBe(1);
      expect(getBufferSize()).toBe(1);
    });

    it("includes context object in string output", () => {
      captureToBuffer(
        "SC",
        "info",
        "msg",
        { count: 42 },
        {
          captureStructured: false,
          captureString: true,
        },
      );
      const flushed = flushLogBuffer();
      expect(flushed).toContain("count=42");
    });

    it("evicts oldest structured entry at max capacity", () => {
      for (let i = 0; i < MAX_STRUCTURED_BUFFER_SIZE; i++) {
        loggerState.structuredLogBuffer.push({
          timestamp: "t",
          scope: "A",
          level: "info",
          message: `msg-${i}`,
        });
      }
      captureToBuffer("B", "info", "new-msg", undefined, {
        captureStructured: true,
        captureString: false,
      });
      expect(getStructuredLogCount()).toBe(MAX_STRUCTURED_BUFFER_SIZE);
      const logs = getStructuredLogs();
      expect(logs[logs.length - 1].message).toBe("new-msg");
    });

    it("evicts oldest string entry at max capacity", () => {
      for (let i = 0; i < MAX_BUFFER_SIZE; i++) {
        loggerState.logBuffer.push(`line-${i}`);
      }
      captureToBuffer("B", "info", "new", undefined, {
        captureStructured: false,
        captureString: true,
      });
      expect(getBufferSize()).toBe(MAX_BUFFER_SIZE);
    });
  });

  // ── sentryModuleState ──────────────────────────────────────────

  describe("sentryModuleState", () => {
    it("starts with null module", () => {
      expect(sentryModuleState.module).toBeNull();
    });

    it("is mutable", () => {
      const prev = sentryModuleState.module;
      sentryModuleState.module = {} as typeof sentryModuleState.module;
      expect(sentryModuleState.module).not.toBeNull();
      sentryModuleState.module = prev;
    });
  });

  // ── captureErrorEvent ──────────────────────────────────────────

  describe("captureErrorEvent", () => {
    it("does nothing when sentry module is null", () => {
      const prev = sentryModuleState.module;
      sentryModuleState.module = null;
      expect(() => captureErrorEvent("TEST", "msg", undefined)).not.toThrow();
      sentryModuleState.module = prev;
    });

    it("calls sentry.withScope when module is set", () => {
      const prev = sentryModuleState.module;
      const mockWithScope = vi.fn();
      sentryModuleState.module = {
        withScope: mockWithScope,
        captureException: vi.fn(),
        captureMessage: vi.fn(),
        addBreadcrumb: vi.fn(),
      } as unknown as typeof sentryModuleState.module;

      captureErrorEvent("TEST", "msg", { key: "val" });
      expect(mockWithScope).toHaveBeenCalledOnce();

      sentryModuleState.module = prev;
    });

    it("captures exception when context has error", () => {
      const prev = sentryModuleState.module;
      const mockCaptureException = vi.fn();
      const mockScope = {
        setTag: vi.fn(),
        setExtras: vi.fn(),
        setExtra: vi.fn(),
      };
      sentryModuleState.module = {
        withScope: (cb: (scope: typeof mockScope) => void) => cb(mockScope),
        captureException: mockCaptureException,
        captureMessage: vi.fn(),
        addBreadcrumb: vi.fn(),
      } as unknown as typeof sentryModuleState.module;

      const err = new Error("test");
      captureErrorEvent("TEST", "msg", undefined, { error: err });
      expect(mockCaptureException).toHaveBeenCalledWith(err);

      sentryModuleState.module = prev;
    });

    it("captures message when no error object in context", () => {
      const prev = sentryModuleState.module;
      const mockCaptureMessage = vi.fn();
      const mockScope = {
        setTag: vi.fn(),
        setExtras: vi.fn(),
        setExtra: vi.fn(),
      };
      sentryModuleState.module = {
        withScope: (cb: (scope: typeof mockScope) => void) => cb(mockScope),
        captureException: vi.fn(),
        captureMessage: mockCaptureMessage,
        addBreadcrumb: vi.fn(),
      } as unknown as typeof sentryModuleState.module;

      captureErrorEvent("TEST", "msg", { key: "val" });
      expect(mockCaptureMessage).toHaveBeenCalledWith("[TEST] msg", "error");

      sentryModuleState.module = prev;
    });
  });
});
