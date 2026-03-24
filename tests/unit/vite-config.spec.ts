import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { escapeRegex } from "../../vite-config/escape-regex.ts";
import { buildTsconfigAliases } from "../../vite-config/build-tsconfig-aliases.ts";
import { getEnvDefines } from "../../vite-config/get-env-defines.ts";
import { oxcMinifyPlugin } from "../../vite-config/oxc-minify-plugin.ts";
import { packageVersion } from "../../vite-config/package-version.const.ts";
import { sentryOrg } from "../../vite-config/sentry-org.const.ts";
import { sentryProject } from "../../vite-config/sentry-project.const.ts";
import { sentryUploadEnabled } from "../../vite-config/sentry-upload-enabled.const.ts";
import { analyzeBundle } from "../../vite-config/analyze-bundle.const.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

describe("vite-config", () => {
  // ── escapeRegex ────────────────────────────────────────────

  describe("escapeRegex", () => {
    it("escapes dot", () => {
      expect(escapeRegex("a.b")).toBe("a\\.b");
    });

    it("escapes asterisk", () => {
      expect(escapeRegex("a*b")).toBe("a\\*b");
    });

    it("escapes plus", () => {
      expect(escapeRegex("a+b")).toBe("a\\+b");
    });

    it("escapes question mark", () => {
      expect(escapeRegex("a?b")).toBe("a\\?b");
    });

    it("escapes caret and dollar", () => {
      expect(escapeRegex("^start$")).toBe("\\^start\\$");
    });

    it("escapes braces", () => {
      expect(escapeRegex("{a}")).toBe("\\{a\\}");
    });

    it("escapes parentheses", () => {
      expect(escapeRegex("(a)")).toBe("\\(a\\)");
    });

    it("escapes pipe", () => {
      expect(escapeRegex("a|b")).toBe("a\\|b");
    });

    it("escapes brackets", () => {
      expect(escapeRegex("[ab]")).toBe("\\[ab\\]");
    });

    it("escapes backslash", () => {
      expect(escapeRegex("a\\b")).toBe("a\\\\b");
    });

    it("returns empty string unchanged", () => {
      expect(escapeRegex("")).toBe("");
    });

    it("returns safe string unchanged", () => {
      expect(escapeRegex("hello-world_123")).toBe("hello-world_123");
    });

    it("escapes multiple special characters in one string", () => {
      expect(escapeRegex("@/domain/qr/*")).toBe("@/domain/qr/\\*");
    });

    it("produces a valid regex when used in RegExp constructor", () => {
      const special = "file.(test)+[0]";
      const pattern = new RegExp(`^${escapeRegex(special)}$`);
      expect(pattern.test(special)).toBe(true);
      expect(pattern.test("fileXtestY0")).toBe(false);  // cspell:disable-line
    });
  });

  // ── buildTsconfigAliases ───────────────────────────────────

  describe("buildTsconfigAliases", () => {
    const aliases = buildTsconfigAliases(repoRoot);

    it("returns an array", () => {
      expect(Array.isArray(aliases)).toBe(true);
    });

    it("returns non-empty aliases from tsconfig.base.json", () => {
      expect(aliases.length).toBeGreaterThan(0);
    });

    it("non-wildcard paths have string find property", () => {
      const nonWildcard = aliases.find(
        (a) => typeof a.find === "string" && a.find === "@/contracts/core",
      );
      expect(nonWildcard).toBeDefined();
      expect(typeof nonWildcard!.find).toBe("string");
    });

    it("wildcard paths have RegExp find property", () => {
      const wildcard = aliases.find((a) => a.find instanceof RegExp);
      expect(wildcard).toBeDefined();
      expect(wildcard!.find).toBeInstanceOf(RegExp);
    });

    it("replacement paths are absolute", () => {
      for (const alias of aliases) {
        expect(path.isAbsolute(alias.replacement)).toBe(true);
      }
    });

    it("sorts aliases by key length descending", () => {
      const stringAliases = aliases.filter((a) => typeof a.find === "string");
      for (let i = 1; i < stringAliases.length; i++) {
        const prev = stringAliases[i - 1];
        const curr = stringAliases[i];
        if (typeof prev.find === "string" && typeof curr.find === "string") {
          expect(prev.find.length).toBeGreaterThanOrEqual(curr.find.length);
        }
      }
    });

    it("wildcard RegExp matches expected import path", () => {
      const wildcard = aliases.find(
        (a) => a.find instanceof RegExp && a.replacement.includes("domain/share/src/share-links"),
      );
      expect(wildcard).toBeDefined();
      expect((wildcard!.find as RegExp).test("@/domain/share-links/api")).toBe(true);
      expect((wildcard!.find as RegExp).test("@/domain/share-links/")).toBe(false);
    });

    it("wildcard replacement ends with /$1", () => {
      const wildcards = aliases.filter((a) => a.find instanceof RegExp);
      for (const w of wildcards) {
        expect(w.replacement).toMatch(/\/\$1$/);
      }
    });
  });

  // ── getEnvDefines ──────────────────────────────────────────

  describe("getEnvDefines", () => {
    const savedEnv: Record<string, string | undefined> = {};

    beforeEach(() => {
      for (const key of Object.keys(process.env)) {
        if (key.startsWith("VITE_TEST_")) {
          savedEnv[key] = process.env[key];
        }
      }
    });

    afterEach(() => {
      for (const key of Object.keys(process.env)) {
        if (key.startsWith("VITE_TEST_")) {
          delete process.env[key];
        }
      }
      for (const [key, val] of Object.entries(savedEnv)) {
        if (val !== undefined) process.env[key] = val;
      }
    });

    it("picks up VITE_ prefixed env vars", () => {
      process.env.VITE_TEST_FOO = "bar";
      const defines = getEnvDefines();
      expect(defines["import.meta.env.VITE_TEST_FOO"]).toBe(JSON.stringify("bar"));
    });

    it("ignores non-VITE_ env vars", () => {
      const defines = getEnvDefines();
      expect(defines["import.meta.env.HOME"]).toBeUndefined();
      expect(defines["import.meta.env.PATH"]).toBeUndefined();
    });

    it("JSON.stringify wraps values in quotes", () => {
      process.env.VITE_TEST_VAL = "hello";
      const defines = getEnvDefines();
      expect(defines["import.meta.env.VITE_TEST_VAL"]).toBe('"hello"');
    });

    it("always includes VITE_SENTRY_RELEASE", () => {
      const defines = getEnvDefines();
      expect(defines["import.meta.env.VITE_SENTRY_RELEASE"]).toBeDefined();
      expect(typeof defines["import.meta.env.VITE_SENTRY_RELEASE"]).toBe("string");
    });

    it("returns object with import.meta.env keys", () => {
      process.env.VITE_TEST_A = "1";
      process.env.VITE_TEST_B = "2";
      const defines = getEnvDefines();
      const keys = Object.keys(defines).filter((k) => k.includes("VITE_TEST_"));
      expect(keys).toContain("import.meta.env.VITE_TEST_A");
      expect(keys).toContain("import.meta.env.VITE_TEST_B");
    });
  });

  // ── oxcMinifyPlugin ────────────────────────────────────────

  describe("oxcMinifyPlugin", () => {
    const plugin = oxcMinifyPlugin();

    it("has name 'oxc-minify'", () => {
      expect(plugin.name).toBe("oxc-minify");
    });

    it("applies to build only", () => {
      expect(plugin.apply).toBe("build");
    });

    it("enforces post", () => {
      expect(plugin.enforce).toBe("post");
    });

    it("renderChunk returns minified code", () => {
      const code = "const   x   =   1;\nconst   y   =   2;\nexport   { x, y };";
      const result = plugin.renderChunk(code, { fileName: "test.js" });
      expect(result.code).toBeDefined();
      expect(result.code.length).toBeLessThan(code.length);
    });

    it("renderChunk returns map property", () => {
      const code = "export const a = 1;";
      const result = plugin.renderChunk(code, { fileName: "test.js" });
      expect("map" in result).toBe(true);
    });

    it("renderChunk strips console.log calls", () => {
      const code = 'console.log("debug"); export const a = 1;';
      const result = plugin.renderChunk(code, { fileName: "test.js" });
      expect(result.code).not.toContain("console.log");
    });

    it("renderChunk preserves exports", () => {
      const code = "export const value = 42;";
      const result = plugin.renderChunk(code, { fileName: "test.js" });
      expect(result.code).toContain("42");
    });
  });

  // ── packageVersion ─────────────────────────────────────────

  describe("packageVersion", () => {
    it("is a string", () => {
      expect(typeof packageVersion).toBe("string");
    });

    it("matches version in package.json", () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
      expect(packageVersion).toBe(pkg.version);
    });

    it("looks like a semver string", () => {
      expect(packageVersion).toMatch(/^\d+\.\d+\.\d+/);
    });
  });

  // ── sentry & build constants (defaults) ────────────────────

  describe("sentry & build constants", () => {
    it("sentryOrg defaults to 'anqr'", () => {
      expect(sentryOrg).toBe("anqr");
    });

    it("sentryProject falls back to env or 'anqr-web'", () => {
      const expected = process.env.SENTRY_PROJECT || "anqr-web";
      expect(sentryProject).toBe(expected);
    });

    it("sentryUploadEnabled is false by default", () => {
      expect(sentryUploadEnabled).toBe(false);
    });

    it("analyzeBundle is false by default", () => {
      expect(analyzeBundle).toBe(false);
    });
  });
});
