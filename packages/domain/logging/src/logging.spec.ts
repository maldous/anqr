import { describe, it, expect } from "vitest";
import { createLogger } from "./create-logger";
import { NOOP_LOGGER } from "./noop-logger.const";
import { noop } from "./noop";
import { enableLogBuffer } from "./enable-log-buffer";
import { disableLogBuffer } from "./disable-log-buffer";
import { flushLogBuffer } from "./flush-log-buffer";
import * as index from "./index";

describe("domain/logging", () => {
  describe("noop", () => {
    it("is a function", () => {
      expect(typeof noop).toBe("function");
    });

    it("returns undefined", () => {
      expect(noop("test")).toBeUndefined();
    });

    it("accepts message and optional context", () => {
      expect(() => noop("msg")).not.toThrow();
      expect(() => noop("msg", { key: "value" })).not.toThrow();
    });
  });

  describe("NOOP_LOGGER", () => {
    it("has all 5 log methods", () => {
      expect(typeof NOOP_LOGGER.trace).toBe("function");
      expect(typeof NOOP_LOGGER.debug).toBe("function");
      expect(typeof NOOP_LOGGER.info).toBe("function");
      expect(typeof NOOP_LOGGER.warn).toBe("function");
      expect(typeof NOOP_LOGGER.error).toBe("function");
    });

    it("all methods are the same noop function", () => {
      expect(NOOP_LOGGER.trace).toBe(noop);
      expect(NOOP_LOGGER.debug).toBe(noop);
      expect(NOOP_LOGGER.info).toBe(noop);
      expect(NOOP_LOGGER.warn).toBe(noop);
      expect(NOOP_LOGGER.error).toBe(noop);
    });

    it("all methods return undefined", () => {
      expect(NOOP_LOGGER.trace("test")).toBeUndefined();
      expect(NOOP_LOGGER.debug("test")).toBeUndefined();
      expect(NOOP_LOGGER.info("test")).toBeUndefined();
      expect(NOOP_LOGGER.warn("test")).toBeUndefined();
      expect(NOOP_LOGGER.error("test")).toBeUndefined();
    });

    it("methods accept optional context", () => {
      expect(() => NOOP_LOGGER.info("msg", { foo: 42 })).not.toThrow();
      expect(() => NOOP_LOGGER.error("msg", { err: "fail" })).not.toThrow();
    });
  });

  describe("createLogger", () => {
    it("returns a Logger object", () => {
      const logger = createLogger("TEST");
      expect(typeof logger.trace).toBe("function");
      expect(typeof logger.debug).toBe("function");
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.error).toBe("function");
    });

    it("returns the NOOP_LOGGER", () => {
      const logger = createLogger("SCOPE");
      expect(logger).toBe(NOOP_LOGGER);
    });

    it("returns the same logger for any scope", () => {
      const a = createLogger("A");
      const b = createLogger("B");
      expect(a).toBe(b);
    });

    it("logger methods do not throw", () => {
      const logger = createLogger("SAFE");
      expect(() => logger.trace("msg")).not.toThrow();
      expect(() => logger.debug("msg")).not.toThrow();
      expect(() => logger.info("msg")).not.toThrow();
      expect(() => logger.warn("msg")).not.toThrow();
      expect(() => logger.error("msg")).not.toThrow();
    });
  });

  describe("enableLogBuffer", () => {
    it("returns undefined", () => {
      expect(enableLogBuffer()).toBeUndefined();
    });

    it("does not throw", () => {
      expect(() => enableLogBuffer()).not.toThrow();
    });
  });

  describe("disableLogBuffer", () => {
    it("returns undefined", () => {
      expect(disableLogBuffer()).toBeUndefined();
    });

    it("does not throw", () => {
      expect(() => disableLogBuffer()).not.toThrow();
    });
  });

  describe("flushLogBuffer", () => {
    it("returns an empty string", () => {
      expect(flushLogBuffer()).toBe("");
    });

    it("always returns empty string (stub)", () => {
      enableLogBuffer();
      createLogger("X").info("test");
      expect(flushLogBuffer()).toBe("");
      disableLogBuffer();
    });
  });

  describe("index barrel", () => {
    it("exports createLogger", () => {
      expect(index.createLogger).toBe(createLogger);
    });

    it("exports enableLogBuffer", () => {
      expect(index.enableLogBuffer).toBe(enableLogBuffer);
    });

    it("exports disableLogBuffer", () => {
      expect(index.disableLogBuffer).toBe(disableLogBuffer);
    });

    it("exports flushLogBuffer", () => {
      expect(index.flushLogBuffer).toBe(flushLogBuffer);
    });
  });
});
