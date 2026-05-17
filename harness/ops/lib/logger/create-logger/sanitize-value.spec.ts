import { describe, it, expect } from "vitest";

const { sanitizeValue } = await import("./sanitize-value.mjs");

describe("sanitizeValue", () => {
  describe("primitives", () => {
    it("should return null as-is", () => {
      expect(sanitizeValue(null)).toBe(null);
    });

    it("should return undefined as-is", () => {
      expect(sanitizeValue(undefined)).toBe(undefined);
    });

    it("should pass through numbers", () => {
      expect(sanitizeValue(42)).toBe(42);
      expect(sanitizeValue(0)).toBe(0);
      expect(sanitizeValue(-1)).toBe(-1);
    });

    it("should pass through booleans", () => {
      expect(sanitizeValue(true)).toBe(true);
      expect(sanitizeValue(false)).toBe(false);
    });

    it("should convert functions to type string", () => {
      expect(sanitizeValue(() => {})).toBe("[function]");
    });

    it("should convert symbols to type string", () => {
      expect(sanitizeValue(Symbol("test"))).toBe("[symbol]");
    });
  });

  describe("strings", () => {
    it("should truncate long strings", () => {
      const long = "a".repeat(500);
      const result = sanitizeValue(long);
      expect(result.length).toBeLessThan(500);
      expect(result).toMatch(/a+…/);
    });

    it("should truncate requestBodyValues key at 160 chars", () => {
      const long = "a".repeat(300);
      const result = sanitizeValue(long, "requestBodyValues");
      expect(String(result).length).toBeLessThanOrEqual(161);
    });

    it("should truncate stack key at 160 chars", () => {
      const long = "a".repeat(300);
      const result = sanitizeValue(long, "stack");
      expect(String(result).length).toBeLessThanOrEqual(161);
    });

    it("should keep short strings intact", () => {
      expect(sanitizeValue("hello")).toBe("hello");
    });
  });

  describe("Error objects", () => {
    it("should extract Error fields", () => {
      const err = new Error("test error");
      const result = sanitizeValue(err) as Record<string, unknown>;
      expect(result.name).toBe("Error");
      expect(result.message).toBe("test error");
    });

    it("should sanitize nested Error cause (object)", () => {
      const cause = new Error("cause error");
      const err = new Error("parent", { cause });
      const result = sanitizeValue(err) as Record<string, unknown>;
      expect(result.name).toBe("Error");
      expect(result.message).toBe("parent");
      expect(result.cause).toBeDefined();
    });

    it("should truncate string Error cause", () => {
      const err = new Error("parent");
      // @ts-expect-error setting non-standard cause
      err.cause = "a".repeat(500);
      const result = sanitizeValue(err) as Record<string, unknown>;
      expect(result.cause).toMatch(/a+…/);
    });

    it("should include code and statusCode when present", () => {
      const err = new Error("test");
      (err as any).code = "ERR_TEST";
      (err as any).statusCode = 500;
      const result = sanitizeValue(err) as Record<string, unknown>;
      expect(result.code).toBe("ERR_TEST");
      expect(result.statusCode).toBe(500);
    });
  });

  describe("depth limiting", () => {
    it("should cap at MAX_LOG_DEPTH", () => {
      const deep = { a: { b: { c: { d: { e: "too deep" } } } } };
      const result = sanitizeValue(deep, "", 4) as Record<string, unknown>;
      expect(result).toBe("[depth-limited]");
    });

    it("should allow values within max depth", () => {
      const nested = { a: { b: "shallow" } };
      const result = sanitizeValue(nested, "", 0) as Record<string, unknown>;
      expect((result as any).a.b).toBe("shallow");
    });
  });

  describe("circular references", () => {
    it("should detect and mark circular objects", () => {
      const obj: Record<string, unknown> = {};
      obj.self = obj;
      const result = sanitizeValue(obj) as Record<string, unknown>;
      expect(result.self).toBe("[circular]");
    });
  });

  describe("arrays", () => {
    it("should sanitize each element", () => {
      const result = sanitizeValue([1, "hello", true]) as unknown[];
      expect(result).toEqual([1, "hello", true]);
    });

    it("should truncate long arrays with +N more marker", () => {
      const long = Array.from({ length: 20 }, (_, i) => i);
      const result = sanitizeValue(long) as unknown[];
      expect(result).toContain("[+12 more]");
    });

    it("should keep short arrays intact", () => {
      const arr = [1, 2, 3];
      expect(sanitizeValue(arr)).toEqual([1, 2, 3]);
    });
  });

  describe("objects", () => {
    it("should sanitize object values", () => {
      const result = sanitizeValue({ name: "test", count: 5 }) as Record<string, unknown>;
      expect(result.name).toBe("test");
      expect(result.count).toBe(5);
    });

    it("should add truncated keys marker", () => {
      const obj = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`key${i}`, i]));
      const result = sanitizeValue(obj) as Record<string, unknown>;
      expect(result.__truncatedKeys).toBe(10);
    });

    it("should sanitize headers under 'headers' key", () => {
      const headers = { authorization: "Bearer token123", "content-type": "application/json" };
      const result = sanitizeValue(headers, "headers") as Record<string, unknown>;
      expect(result.authorization).toBe("Bearer token123");
    });
  });

  describe("key-specific handling", () => {
    it("should summarize body under 'body' key", () => {
      const body = { userId: 1, action: "test" };
      const result = sanitizeValue(body, "body") as Record<string, unknown>;
      expect(result.summary).toEqual(["userId", "action"]);
      expect(result.type).toBe("object");
    });

    it("should summarize tools with count and sample", () => {
      const tools = [
        { name: "read_file" },
        { name: "write_file" },
        { name: "run_command" },
      ];
      const result = sanitizeValue(tools, "tools") as Record<string, unknown>;
      expect(result.count).toBe(3);
      expect(result.sample).toEqual(["read_file", "write_file", "run_command"]);
    });
  });
});
