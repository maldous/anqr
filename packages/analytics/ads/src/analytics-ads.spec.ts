import { describe, it, expect } from "vitest";
import { AD_CLIENT } from "./components/ad-client";
import { isNumericSlot } from "./components/numeric-slot";
import { resolveSlotId } from "./components/ad-slot-resolver";
import { SLOT_IDS } from "./components/ad-unit-slots";

describe("analytics/ads", () => {
  // ── AD_CLIENT ──────────────────────────────────────────────────

  describe("AD_CLIENT", () => {
    it("is a string", () => {
      expect(typeof AD_CLIENT).toBe("string");
    });

    it("starts with ca-pub-", () => {
      expect(AD_CLIENT.startsWith("ca-pub-")).toBe(true);
    });
  });

  // ── isNumericSlot ──────────────────────────────────────────────

  describe("isNumericSlot", () => {
    it("returns true for numeric string", () => {
      expect(isNumericSlot("12345")).toBe(true);
    });

    it("returns true for single digit", () => {
      expect(isNumericSlot("0")).toBe(true);
    });

    it("returns true for long numeric string", () => {
      expect(isNumericSlot("9876543210")).toBe(true);
    });

    it("returns false for empty string", () => {
      expect(isNumericSlot("")).toBe(false);
    });

    it("returns false for null", () => {
      expect(isNumericSlot(null)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isNumericSlot(undefined)).toBe(false);
    });

    it("returns false for non-numeric string", () => {
      expect(isNumericSlot("abc")).toBe(false);
    });

    it("returns false for mixed alphanumeric", () => {
      expect(isNumericSlot("123abc")).toBe(false);
    });

    it("returns false for string with spaces", () => {
      expect(isNumericSlot("123 456")).toBe(false);
    });

    it("returns false for string with dots", () => {
      expect(isNumericSlot("12.34")).toBe(false);
    });

    it("returns false for negative number string", () => {
      expect(isNumericSlot("-1")).toBe(false);
    });
  });

  // ── SLOT_IDS ───────────────────────────────────────────────────

  describe("SLOT_IDS", () => {
    it("is an object", () => {
      expect(typeof SLOT_IDS).toBe("object");
    });

    it("has left-skyscraper key", () => {
      expect("left-skyscraper" in SLOT_IDS).toBe(true);
    });

    it("has right-skyscraper key", () => {
      expect("right-skyscraper" in SLOT_IDS).toBe(true);
    });

    it("has gallery-top key", () => {
      expect("gallery-top" in SLOT_IDS).toBe(true);
    });

    it("has gallery-bottom key", () => {
      expect("gallery-bottom" in SLOT_IDS).toBe(true);
    });
  });

  // ── resolveSlotId ──────────────────────────────────────────────

  describe("resolveSlotId", () => {
    it("returns numeric slot directly", () => {
      expect(resolveSlotId("12345")).toBe("12345");
    });

    it("returns numeric slot for single digit", () => {
      expect(resolveSlotId("0")).toBe("0");
    });

    it("returns null for unknown named slot", () => {
      expect(resolveSlotId("nonexistent-slot")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(resolveSlotId("")).toBeNull();
    });

    it("returns null for named slot without env config", () => {
      expect(resolveSlotId("left-skyscraper")).toBeNull();
    });

    it("returns null for non-numeric, non-mapped value", () => {
      expect(resolveSlotId("abc")).toBeNull();
    });
  });
});
