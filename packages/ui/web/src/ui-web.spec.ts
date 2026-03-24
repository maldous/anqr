import { describe, it, expect, beforeEach } from "vitest";
import { clampProgress } from "./composites/clamp-progress";
import { normalizeToken } from "./dynamic-testid-normalize";
import { allocateUniqueId } from "./dynamic-testid-allocate";
import { baseFromProps } from "./dynamic-testid-base-from-props";
import { getRegistry } from "./dynamic-testid-registry";
import { autoTestIdState } from "./dynamic-testid-state";
import { cn } from "./utils";
import { buildNavigationUrl } from "./primitives/build-help-link-navigation-url";
import { parseTierFromUrl } from "./primitives/parse-help-link-tier-from-url";

describe("ui/web", () => {
  // ── clampProgress ──────────────────────────────────────────────

  describe("clampProgress", () => {
    it("returns 0 for null", () => {
      expect(clampProgress(null)).toBe(0);
    });

    it("returns 0 for undefined", () => {
      expect(clampProgress(undefined)).toBe(0);
    });

    it("returns 0 for NaN", () => {
      expect(clampProgress(NaN)).toBe(0);
    });

    it("returns 0 for Infinity", () => {
      expect(clampProgress(Infinity)).toBe(0);
    });

    it("returns 0 for -Infinity", () => {
      expect(clampProgress(-Infinity)).toBe(0);
    });

    it("clamps negative to 0", () => {
      expect(clampProgress(-10)).toBe(0);
    });

    it("clamps above 100 to 100", () => {
      expect(clampProgress(150)).toBe(100);
    });

    it("returns 0 for 0", () => {
      expect(clampProgress(0)).toBe(0);
    });

    it("returns 100 for 100", () => {
      expect(clampProgress(100)).toBe(100);
    });

    it("rounds to nearest integer", () => {
      expect(clampProgress(50.4)).toBe(50);
      expect(clampProgress(50.6)).toBe(51);
    });

    it("passes through normal values", () => {
      expect(clampProgress(42)).toBe(42);
    });

    it("rounds 0.5 up", () => {
      expect(clampProgress(0.5)).toBe(1);
    });

    it("rounds 99.5 to 100", () => {
      expect(clampProgress(99.5)).toBe(100);
    });
  });

  // ── normalizeToken ─────────────────────────────────────────────

  describe("normalizeToken", () => {
    it("lowercases input", () => {
      expect(normalizeToken("HELLO")).toBe("hello");
    });

    it("trims whitespace", () => {
      expect(normalizeToken("  hello  ")).toBe("hello");
    });

    it("replaces spaces with dashes", () => {
      expect(normalizeToken("hello world")).toBe("hello-world");
    });

    it("collapses consecutive non-alnum chars to single dash", () => {
      expect(normalizeToken("hello---world")).toBe("hello-world");
    });

    it("removes trailing dashes", () => {
      expect(normalizeToken("hello!")).toBe("hello");
    });

    it("removes leading non-alnum chars", () => {
      expect(normalizeToken("---hello")).toBe("hello");
    });

    it("handles mixed case and special chars", () => {
      expect(normalizeToken("Hello World!")).toBe("hello-world");
    });

    it("handles numbers", () => {
      expect(normalizeToken("item42")).toBe("item42");
    });

    it("returns empty string for only special chars", () => {
      expect(normalizeToken("!!!")).toBe("");
    });

    it("returns empty string for empty input", () => {
      expect(normalizeToken("")).toBe("");
    });

    it("handles underscores as separators", () => {
      expect(normalizeToken("foo_bar")).toBe("foo-bar");
    });

    it("handles dots as separators", () => {
      expect(normalizeToken("foo.bar")).toBe("foo-bar");
    });
  });

  // ── getRegistry ────────────────────────────────────────────────

  describe("getRegistry", () => {
    beforeEach(() => {
      const bag = globalThis as Record<string, unknown>;
      delete bag["__ANQR_DYNAMIC_TESTID_REGISTRY__"];
    });

    it("returns an object with usedBySource map", () => {
      const reg = getRegistry();
      expect(reg.usedBySource).toBeInstanceOf(Map);
    });

    it("returns an object with countsByBase map", () => {
      const reg = getRegistry();
      expect(reg.countsByBase).toBeInstanceOf(Map);
    });

    it("returns the same registry on subsequent calls", () => {
      const a = getRegistry();
      const b = getRegistry();
      expect(a).toBe(b);
    });

    it("starts with empty maps", () => {
      const reg = getRegistry();
      expect(reg.usedBySource.size).toBe(0);
      expect(reg.countsByBase.size).toBe(0);
    });

    it("persists mutations across calls", () => {
      const reg = getRegistry();
      reg.usedBySource.set("key", "val");
      expect(getRegistry().usedBySource.get("key")).toBe("val");
    });
  });

  // ── allocateUniqueId ───────────────────────────────────────────

  describe("allocateUniqueId", () => {
    beforeEach(() => {
      const bag = globalThis as Record<string, unknown>;
      delete bag["__ANQR_DYNAMIC_TESTID_REGISTRY__"];
    });

    it("returns base for first allocation", () => {
      expect(allocateUniqueId("btn", "src-1")).toBe("btn");
    });

    it("returns same id for same source key", () => {
      const first = allocateUniqueId("btn", "src-1");
      const second = allocateUniqueId("btn", "src-1");
      expect(first).toBe(second);
    });

    it("appends suffix for duplicate base from different source", () => {
      allocateUniqueId("btn", "src-1");
      const second = allocateUniqueId("btn", "src-2");
      expect(second).toBe("btn-2");
    });

    it("increments suffix for each additional duplicate", () => {
      allocateUniqueId("btn", "src-1");
      allocateUniqueId("btn", "src-2");
      const third = allocateUniqueId("btn", "src-3");
      expect(third).toBe("btn-3");
    });

    it("different bases do not collide", () => {
      const a = allocateUniqueId("btn", "src-1");
      const b = allocateUniqueId("input", "src-2");
      expect(a).toBe("btn");
      expect(b).toBe("input");
    });

    it("returns cached id for existing source even after more allocations", () => {
      allocateUniqueId("btn", "src-1");
      allocateUniqueId("btn", "src-2");
      expect(allocateUniqueId("btn", "src-1")).toBe("btn");
    });
  });

  // ── baseFromProps ──────────────────────────────────────────────

  describe("baseFromProps", () => {
    it("returns explicit testId when provided", () => {
      expect(baseFromProps({ testId: "my-id" }, "prefix", "react-1")).toBe("my-id");
    });

    it("trims explicit testId", () => {
      expect(baseFromProps({ testId: "  my-id  " }, "prefix", "react-1")).toBe("my-id");
    });

    it("ignores empty testId string", () => {
      const result = baseFromProps({ testId: "  " }, "prefix", "react-1");
      expect(result).toBe("prefix-react-1");
    });

    it("falls back to label", () => {
      expect(baseFromProps({ label: "Save" }, "btn", "r1")).toBe("btn-save");
    });

    it("falls back to aria-label", () => {
      expect(baseFromProps({ "aria-label": "Close" }, "btn", "r1")).toBe("btn-close");
    });

    it("falls back to title", () => {
      expect(baseFromProps({ title: "Info" }, "btn", "r1")).toBe("btn-info");
    });

    it("falls back to name", () => {
      expect(baseFromProps({ name: "email" }, "input", "r1")).toBe("input-email");
    });

    it("falls back to id", () => {
      expect(baseFromProps({ id: "field-1" }, "input", "r1")).toBe("input-field-1");
    });

    it("falls back to reactId", () => {
      expect(baseFromProps({}, "ctrl", "react-42")).toBe("ctrl-react-42");
    });

    it("uses 'control' when reactId is empty", () => {
      expect(baseFromProps({}, "ctrl", "")).toBe("ctrl-control");
    });

    it("prioritizes label over aria-label", () => {
      expect(baseFromProps({ label: "Save", "aria-label": "Close" }, "btn", "r1")).toBe("btn-save");
    });

    it("prioritizes aria-label over title", () => {
      expect(baseFromProps({ "aria-label": "Close", title: "Info" }, "btn", "r1")).toBe("btn-close");
    });

    it("normalizes the fallback candidate", () => {
      expect(baseFromProps({ label: "Hello World!" }, "btn", "r1")).toBe("btn-hello-world");
    });
  });

  // ── autoTestIdState ────────────────────────────────────────────

  describe("autoTestIdState", () => {
    it("has a counter property", () => {
      expect(typeof autoTestIdState.counter).toBe("number");
    });

    it("counter is mutable", () => {
      const before = autoTestIdState.counter;
      autoTestIdState.counter += 1;
      expect(autoTestIdState.counter).toBe(before + 1);
      autoTestIdState.counter = before;
    });
  });

  // ── cn (class name utility) ────────────────────────────────────

  describe("cn", () => {
    it("returns empty string for no args", () => {
      expect(cn()).toBe("");
    });

    it("passes through a single class", () => {
      expect(cn("foo")).toBe("foo");
    });

    it("merges multiple classes", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("filters out falsy values", () => {
      expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
    });

    it("handles conditional classes", () => {
      const active = true;
      expect(cn("base", active && "active")).toBe("base active");
    });

    it("merges tailwind conflicting classes (last wins)", () => {
      const result = cn("p-4", "p-2");
      expect(result).toBe("p-2");
    });

    it("merges tailwind conflicting text colors", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
    });

    it("keeps non-conflicting tailwind classes", () => {
      const result = cn("p-4", "m-2");
      expect(result).toBe("p-4 m-2");
    });

    it("handles array input", () => {
      expect(cn(["foo", "bar"])).toBe("foo bar");
    });
  });

  // ── buildNavigationUrl ─────────────────────────────────────────

  describe("buildNavigationUrl", () => {
    it("appends lang param to simple path", () => {
      const result = buildNavigationUrl("/help", "en");
      expect(result.fullHref).toBe("/help?lang=en");
      expect(result.hash).toBe("");
    });

    it("preserves existing query params", () => {
      const result = buildNavigationUrl("/help?tab=basic", "en");
      expect(result.fullHref).toBe("/help?tab=basic&lang=en");
    });

    it("preserves hash fragment", () => {
      const result = buildNavigationUrl("/help#section", "en");
      expect(result.fullHref).toBe("/help?lang=en#section");
      expect(result.hash).toBe("#section");
    });

    it("preserves both query and hash", () => {
      const result = buildNavigationUrl("/help?tab=basic#section", "fr");
      expect(result.fullHref).toBe("/help?tab=basic&lang=fr#section");
      expect(result.hash).toBe("#section");
    });

    it("does not duplicate lang param", () => {
      const result = buildNavigationUrl("/help?lang=de", "en");
      expect(result.fullHref).toBe("/help?lang=de");
    });

    it("handles empty path", () => {
      const result = buildNavigationUrl("", "en");
      expect(result.fullHref).toBe("?lang=en");
    });

    it("handles path with hash only", () => {
      const result = buildNavigationUrl("#top", "en");
      expect(result.fullHref).toBe("?lang=en#top");
      expect(result.hash).toBe("#top");
    });

    it("uses correct language code", () => {
      const result = buildNavigationUrl("/page", "ja");
      expect(result.fullHref).toContain("lang=ja");
    });
  });

  // ── parseTierFromUrl ───────────────────────────────────────────

  describe("parseTierFromUrl", () => {
    it("parses basic tier", () => {
      expect(parseTierFromUrl("/help?tab=basic")).toBe("basic");
    });

    it("parses advanced tier", () => {
      expect(parseTierFromUrl("/help?tab=advanced")).toBe("advanced");
    });

    it("parses professional tier", () => {
      expect(parseTierFromUrl("/help?tab=professional")).toBe("professional");
    });

    it("returns undefined for no tab param", () => {
      expect(parseTierFromUrl("/help")).toBeUndefined();
    });

    it("returns undefined for unknown tier", () => {
      expect(parseTierFromUrl("/help?tab=premium")).toBeUndefined();
    });

    it("parses tab from middle of query string", () => {
      expect(parseTierFromUrl("/help?lang=en&tab=advanced&debug=1")).toBe("advanced");
    });

    it("parses tab before hash", () => {
      expect(parseTierFromUrl("/help?tab=basic#section")).toBe("basic");
    });

    it("returns undefined for empty string", () => {
      expect(parseTierFromUrl("")).toBeUndefined();
    });

    it("returns undefined for tab with partial match", () => {
      expect(parseTierFromUrl("/help?tab=basics")).toBeUndefined();
    });

    it("returns undefined when tab value is missing", () => {
      expect(parseTierFromUrl("/help?tab=")).toBeUndefined();
    });
  });
});
