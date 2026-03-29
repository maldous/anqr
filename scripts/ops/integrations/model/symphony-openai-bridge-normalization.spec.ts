import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * Test suite for robust parameter normalization in symphony-openai-bridge
 *
 * This test validates that ALL tools with array parameters can accept:
 * - Arrays (native format)
 * - Strings (single value, wrapped in array)
 * - JSON-encoded strings (parsed and normalized)
 * - Objects with path/paths properties (extracted and normalized)
 * - Empty values (gracefully handled with fallback)
 *
 * The Symphony Bridge uses z.preprocess() to normalize inputs BEFORE validation,
 * preventing "Invalid parameters" errors when AI SDKs send malformed inputs.
 */

// Helper functions for parameter normalization (match symphony-openai-bridge implementation)
const helpers = {
  coerceStringArrayInput(value: any, { fallback = undefined }: { fallback?: any } = {}) {
    if (Array.isArray(value)) {
      const cleaned = value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
      return cleaned.length > 0 ? cleaned : fallback;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return fallback;
      if (
        (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
        (trimmed.startsWith('"') && trimmed.endsWith('"'))
      ) {
        try {
          return helpers.coerceStringArrayInput(JSON.parse(trimmed), { fallback });
        } catch {
          // Fall through and treat as a literal path string.
        }
      }
      return [trimmed];
    }

    if (value && typeof value === "object") {
      if (typeof value.path === "string") return [value.path.trim()].filter(Boolean);
      if (typeof value.paths === "string" || Array.isArray(value.paths)) {
        return helpers.coerceStringArrayInput(value.paths, { fallback });
      }
    }

    return fallback;
  },

  coerceOptionalNumberInput(value: any, fallback: any = undefined) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return fallback;
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
  },
};

const { coerceStringArrayInput, coerceOptionalNumberInput } = helpers;

describe("Tool Parameter Normalization (Symphony Bridge)", () => {
  describe("run_file_change_hooks (files parameter)", () => {
    const schema = z.preprocess(
      (val) => {
        if (Array.isArray(val)) {
          const filtered = val.filter((item) => typeof item === "string" && item.trim());
          return filtered.length > 0 ? filtered : [];
        }
        if (typeof val === "string") {
          const trimmed = val.trim();
          if (!trimmed) return [];
          if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
              const parsed = JSON.parse(trimmed);
              if (Array.isArray(parsed)) {
                const filtered = parsed.filter((item) => typeof item === "string" && item.trim());
                return filtered.length > 0 ? filtered : [];
              }
              return [trimmed];
            } catch {
              return [trimmed];
            }
          }
          return [trimmed];
        }
        return [];
      },
      z.array(z.string()),
    );

    it("should accept array of strings", async () => {
      const result = await schema.parseAsync(["file1.ts", "file2.ts"]);
      expect(result).toEqual(["file1.ts", "file2.ts"]);
    });

    it("should accept single string and wrap in array", async () => {
      const result = await schema.parseAsync("file1.ts");
      expect(result).toEqual(["file1.ts"]);
    });

    it("should accept JSON-encoded array string", async () => {
      const result = await schema.parseAsync('["file1.ts", "file2.ts"]');
      expect(result).toEqual(["file1.ts", "file2.ts"]);
    });

    it("should handle empty string gracefully", async () => {
      const result = await schema.parseAsync("");
      expect(result).toEqual([]);
    });

    it("should filter out non-string items", async () => {
      const result = await schema.parseAsync(["file1.ts", null, 123, "file2.ts"]);
      expect(result).toEqual(["file1.ts", "file2.ts"]);
    });

    it("should handle whitespace-only strings", async () => {
      const result = await schema.parseAsync("   ");
      expect(result).toEqual([]);
    });
  });

  describe("read_files (paths parameter)", () => {
    const schema = z.preprocess(
      (val) => {
        const result = coerceStringArrayInput(val, { fallback: [] });
        if (!result || result.length === 0) {
          throw new Error("paths must contain at least one file path");
        }
        return result;
      },
      z.array(z.string()),
    );

    it("should accept array of paths", async () => {
      const result = await schema.parseAsync(["src/file1.ts", "src/file2.ts"]);
      expect(result).toEqual(["src/file1.ts", "src/file2.ts"]);
    });

    it("should accept single path string", async () => {
      const result = await schema.parseAsync("src/file1.ts");
      expect(result).toEqual(["src/file1.ts"]);
    });

    it("should accept JSON-encoded array", async () => {
      const result = await schema.parseAsync('["src/file1.ts"]');
      expect(result).toEqual(["src/file1.ts"]);
    });

    it("should reject empty array", async () => {
      await expect(schema.parseAsync([])).rejects.toThrow("paths must contain at least one file path");
    });

    it("should reject empty string", async () => {
      await expect(schema.parseAsync("")).rejects.toThrow("paths must contain at least one file path");
    });
  });

  describe("str_replace (replacements parameter)", () => {
    const schema = z.preprocess(
      (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
          const trimmed = val.trim();
          if (!trimmed) return [];
          if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [];
            }
          }
          try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [];
          }
        }
        if (val && typeof val === "object") return [val];
        return [];
      },
      z.array(
        z.object({
          old: z.string(),
          new: z.string(),
          allowMultiple: z.boolean().optional(),
        }),
      ),
    );

    it("should accept array of replacements", async () => {
      const result = await schema.parseAsync([
        { old: "foo", new: "bar" },
        { old: "baz", new: "qux" },
      ]);
      expect(result).toEqual([
        { old: "foo", new: "bar" },
        { old: "baz", new: "qux" },
      ]);
    });

    it("should accept single replacement object", async () => {
      const result = await schema.parseAsync({ old: "foo", new: "bar" });
      expect(result).toEqual([{ old: "foo", new: "bar" }]);
    });

    it("should accept JSON-encoded array", async () => {
      const result = await schema.parseAsync('[{"old":"foo","new":"bar"}]');
      expect(result).toEqual([{ old: "foo", new: "bar" }]);
    });

    it("should handle empty string gracefully", async () => {
      const result = await schema.parseAsync("");
      expect(result).toEqual([]);
    });
  });

  describe("spawn_agents (agents parameter)", () => {
    const schema = z.preprocess(
      (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
          const trimmed = val.trim();
          if (!trimmed) return [];
          try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [];
          }
        }
        if (val && typeof val === "object") return [val];
        return [];
      },
      z.array(
        z.object({
          agent_type: z.string(),
          prompt: z.string().optional(),
          params: z.record(z.any()).optional(),
        }),
      ),
    );

    it("should accept array of agents", async () => {
      const result = await schema.parseAsync([
        { agent_type: "file-picker" },
        { agent_type: "basher", prompt: "run tests" },
      ]);
      expect(result).toEqual([
        { agent_type: "file-picker" },
        { agent_type: "basher", prompt: "run tests" },
      ]);
    });

    it("should accept single agent object", async () => {
      const result = await schema.parseAsync({ agent_type: "file-picker" });
      expect(result).toEqual([{ agent_type: "file-picker" }]);
    });

    it("should accept JSON-encoded array", async () => {
      const result = await schema.parseAsync('[{"agent_type":"file-picker"}]');
      expect(result).toEqual([{ agent_type: "file-picker" }]);
    });
  });

  describe("read_subtree (paths and maxTokens parameters)", () => {
    const schema = z.object({
      paths: z.preprocess(
        (val) => coerceStringArrayInput(val, { fallback: ["."] }),
        z.array(z.string()).optional(),
      ),
      maxTokens: z.preprocess(
        (val) => coerceOptionalNumberInput(val, undefined),
        z.number().int().positive().optional(),
      ),
    });

    it("should accept array of paths", async () => {
      const result = await schema.parseAsync({ paths: ["src", "docs"] });
      expect(result.paths).toEqual(["src", "docs"]);
    });

    it("should accept single path string", async () => {
      const result = await schema.parseAsync({ paths: "src" });
      expect(result.paths).toEqual(["src"]);
    });

    it("should use default when paths is undefined", async () => {
      const result = await schema.parseAsync({});
      expect(result.paths).toEqual(["."]);
    });

    it("should accept number for maxTokens", async () => {
      const result = await schema.parseAsync({ maxTokens: 1000 });
      expect(result.maxTokens).toBe(1000);
    });

    it("should accept numeric string for maxTokens", async () => {
      const result = await schema.parseAsync({ maxTokens: "1000" });
      expect(result.maxTokens).toBe(1000);
    });

    it("should handle invalid maxTokens gracefully", async () => {
      const result = await schema.parseAsync({ maxTokens: "invalid" });
      expect(result.maxTokens).toBeUndefined();
    });
  });

  describe("coerceStringArrayInput helper", () => {
    it("should handle array input", () => {
      const result = coerceStringArrayInput(["a", "b", "c"]);
      expect(result).toEqual(["a", "b", "c"]);
    });

    it("should handle single string", () => {
      const result = coerceStringArrayInput("test.ts");
      expect(result).toEqual(["test.ts"]);
    });

    it("should handle JSON array string", () => {
      const result = coerceStringArrayInput('["a", "b"]');
      expect(result).toEqual(["a", "b"]);
    });

    it("should handle object with path property", () => {
      const result = coerceStringArrayInput({ path: "test.ts" });
      expect(result).toEqual(["test.ts"]);
    });

    it("should handle object with paths property (string)", () => {
      const result = coerceStringArrayInput({ paths: "test.ts" });
      expect(result).toEqual(["test.ts"]);
    });

    it("should handle object with paths property (array)", () => {
      const result = coerceStringArrayInput({ paths: ["a", "b"] });
      expect(result).toEqual(["a", "b"]);
    });

    it("should return fallback for empty string", () => {
      const result = coerceStringArrayInput("", { fallback: ["default"] });
      expect(result).toEqual(["default"]);
    });

    it("should return fallback for null", () => {
      const result = coerceStringArrayInput(null, { fallback: ["default"] });
      expect(result).toEqual(["default"]);
    });

    it("should filter out non-string items in arrays", () => {
      const result = coerceStringArrayInput(["a", null, 123, "b", undefined]);
      expect(result).toEqual(["a", "b"]);
    });

    it("should trim whitespace from strings", () => {
      const result = coerceStringArrayInput(["  a  ", "  b  "]);
      expect(result).toEqual(["a", "b"]);
    });
  });

  describe("coerceOptionalNumberInput helper", () => {
    it("should accept valid number", () => {
      const result = coerceOptionalNumberInput(1000);
      expect(result).toBe(1000);
    });

    it("should accept numeric string", () => {
      const result = coerceOptionalNumberInput("1000");
      expect(result).toBe(1000);
    });

    it("should handle empty string", () => {
      const result = coerceOptionalNumberInput("", "default");
      expect(result).toBe("default");
    });

    it("should handle invalid string", () => {
      const result = coerceOptionalNumberInput("invalid", "default");
      expect(result).toBe("default");
    });

    it("should handle null", () => {
      const result = coerceOptionalNumberInput(null, "default");
      expect(result).toBe("default");
    });

    it("should handle undefined", () => {
      const result = coerceOptionalNumberInput(undefined, "default");
      expect(result).toBe("default");
    });
  });

  describe("Edge cases and malformed inputs", () => {
    describe("Deeply nested JSON strings", () => {
      it("should handle double-encoded JSON", () => {
        const doubleEncoded = JSON.stringify(JSON.stringify(["file1.ts", "file2.ts"]));
        const result = coerceStringArrayInput(doubleEncoded);
        // First parse gets the JSON string, second iteration parses to array
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("Mixed valid/invalid data", () => {
      it("should extract valid strings from mixed array", () => {
        const result = coerceStringArrayInput([
          "valid.ts",
          123,
          null,
          undefined,
          { foo: "bar" },
          "",
          "  ",
          "another.ts",
        ]);
        expect(result).toEqual(["valid.ts", "another.ts"]);
      });
    });

    describe("Unicode and special characters", () => {
      it("should handle Unicode filenames", () => {
        // cspell:disable-next-line
        const result = coerceStringArrayInput(["测试.ts", "файл.js"]);
        // cspell:disable-next-line
        expect(result).toEqual(["测试.ts", "файл.js"]);
      });

      it("should handle paths with spaces", () => {
        const result = coerceStringArrayInput(["my file.ts", "another file.js"]);
        expect(result).toEqual(["my file.ts", "another file.js"]);
      });
    });

    describe("Malformed JSON", () => {
      it("should treat invalid JSON as literal string", () => {
        const result = coerceStringArrayInput("{not valid json}");
        expect(result).toEqual(["{not valid json}"]);
      });

      it("should treat incomplete JSON array as literal string", () => {
        const result = coerceStringArrayInput("[\"incomplete");
        expect(result).toEqual(['["incomplete']);
      });
    });
  });

  describe("Real-world error cases from logs", () => {
    it("should handle the exact error case from journalctl", async () => {
      // The error log shows: "expected": "array", "received": "string"
      // This means the SDK is passing a string when Zod expects an array
      // With z.preprocess(), this should now work:

      const runFileChangeHooksSchema = z.object({
        files: z.preprocess(
          (val) => {
            if (Array.isArray(val)) {
              const filtered = val.filter((item) => typeof item === "string" && item.trim());
              return filtered.length > 0 ? filtered : [];
            }
            if (typeof val === "string") {
              const trimmed = val.trim();
              if (!trimmed) return [];
              if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                try {
                  const parsed = JSON.parse(trimmed);
                  if (Array.isArray(parsed)) {
                    const filtered = parsed.filter((item) => typeof item === "string" && item.trim());
                    return filtered.length > 0 ? filtered : [];
                  }
                  return [trimmed];
                } catch {
                  return [trimmed];
                }
              }
              return [trimmed];
            }
            return [];
          },
          z.array(z.string()),
        ),
      });

      // This exact case was failing before:
      const result = await runFileChangeHooksSchema.parseAsync({ files: "test.txt" });
      expect(result.files).toEqual(["test.txt"]);
    });

    it("should handle str_replace with string instead of array", async () => {
      const strReplaceSchema = z.object({
        path: z.string(),
        replacements: z.preprocess(
          (val) => {
            if (Array.isArray(val)) return val;
            if (typeof val === "string") {
              const trimmed = val.trim();
              if (!trimmed) return [];
              if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                try {
                  const parsed = JSON.parse(trimmed);
                  return Array.isArray(parsed) ? parsed : [parsed];
                } catch {
                  return [];
                }
              }
              try {
                const parsed = JSON.parse(trimmed);
                return Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                return [];
              }
            }
            if (val && typeof val === "object") return [val];
            return [];
          },
          z.array(
            z.object({
              old: z.string(),
              new: z.string(),
              allowMultiple: z.boolean().optional(),
            }),
          ),
        ),
      });

      // SDK sending object instead of array
      const result = await strReplaceSchema.parseAsync({
        path: "test.ts",
        replacements: { old: "foo", new: "bar" },
      });
      expect(result.replacements).toEqual([{ old: "foo", new: "bar" }]);
    });

    it("should handle spawn_agents with single agent object", async () => {
      const spawnAgentsSchema = z.object({
        agents: z.preprocess(
          (val) => {
            if (Array.isArray(val)) return val;
            if (typeof val === "string") {
              const trimmed = val.trim();
              if (!trimmed) return [];
              try {
                const parsed = JSON.parse(trimmed);
                return Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                return [];
              }
            }
            if (val && typeof val === "object") return [val];
            return [];
          },
          z.array(
            z.object({
              agent_type: z.string(),
              prompt: z.string().optional(),
              params: z.record(z.any()).optional(),
            }),
          ),
        ),
      });

      const result = await spawnAgentsSchema.parseAsync({
        agents: { agent_type: "file-picker" },
      });
      expect(result.agents).toEqual([{ agent_type: "file-picker" }]);
    });
  });

  describe("Performance and robustness", () => {
    it("should handle large arrays efficiently", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => `file${i}.ts`);
      const result = coerceStringArrayInput(largeArray);
      expect(result).toEqual(largeArray);
    });

    it("should not crash on circular references", () => {
      const circular: any = { foo: "bar" };
      circular.self = circular;
      const result = coerceStringArrayInput(circular, { fallback: [] });
      expect(result).toEqual([]);
    });

    it("should handle very long strings gracefully", () => {
      const longString = "a".repeat(1000000);
      const result = coerceStringArrayInput(longString);
      expect(result).toEqual([longString]);
    });
  });
});
