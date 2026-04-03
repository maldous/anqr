import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("utils", () => {
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

    it("handles conditional classes when false", () => {
      const active = false;
      expect(cn("base", active && "active")).toBe("base");
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

    it("handles nested arrays", () => {
      expect(cn(["foo", ["bar", "baz"]])).toBe("foo bar baz");
    });

    it("handles object with boolean values", () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
    });

    it("merges complex combinations", () => {
      const result = cn(
        "base",
        { active: true, disabled: false },
        ["extra", "more"],
        null,
        "final",
      );
      expect(result).toContain("base");
      expect(result).toContain("active");
      expect(result).toContain("extra");
      expect(result).toContain("final");
      expect(result).not.toContain("disabled");
    });

    it("handles empty arrays", () => {
      expect(cn([])).toBe("");
    });

    it("handles empty objects", () => {
      expect(cn({})).toBe("");
    });

    it("preserves non-tailwind duplicate classes (twMerge only deduplicates tailwind utilities)", () => {
      const result = cn("foo", "foo");
      expect(result).toBe("foo foo");
    });

    it("handles undefined and null gracefully", () => {
      expect(cn(undefined, null, "valid")).toBe("valid");
    });

    it("handles zero as falsy value", () => {
      expect(cn("foo", 0, "bar")).toBe("foo bar");
    });

    it("handles empty string as falsy value", () => {
      expect(cn("foo", "", "bar")).toBe("foo bar");
    });

    it("merges conflicting background colors", () => {
      const result = cn("bg-white", "bg-black");
      expect(result).toBe("bg-black");
    });

    it("merges conflicting margin values", () => {
      const result = cn("m-2", "m-4");
      expect(result).toBe("m-4");
    });

    it("keeps specific directional margins when general margin exists", () => {
      const result = cn("m-4", "mx-2");
      expect(result).toContain("mx-2");
    });

    it("handles responsive prefixes", () => {
      const result = cn("p-4", "md:p-8");
      expect(result).toBe("p-4 md:p-8");
    });

    it("merges conflicting responsive values", () => {
      const result = cn("md:p-4", "md:p-8");
      expect(result).toBe("md:p-8");
    });
  });
});
