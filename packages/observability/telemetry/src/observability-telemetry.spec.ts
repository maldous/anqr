import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DEFAULT_TTL_MINUTES } from "./default-ttl-minutes";
import { MAX_TTL_MINUTES } from "./max-ttl-minutes";
import { STORAGE_KEY } from "./storage-key";
import { trackZarazEvent } from "./track-zaraz-event";
import { trackEvent } from "./zaraz";
import { readState } from "./read-state";
import { isEnabled } from "./is-enabled";

describe("observability/telemetry", () => {
  // ── Constants ──────────────────────────────────────────────────

  describe("DEFAULT_TTL_MINUTES", () => {
    it("is 60", () => {
      expect(DEFAULT_TTL_MINUTES).toBe(60);
    });
  });

  describe("MAX_TTL_MINUTES", () => {
    it("is 120", () => {
      expect(MAX_TTL_MINUTES).toBe(120);
    });

    it("is at least DEFAULT_TTL_MINUTES", () => {
      expect(MAX_TTL_MINUTES).toBeGreaterThanOrEqual(DEFAULT_TTL_MINUTES);
    });
  });

  describe("STORAGE_KEY", () => {
    it("is anqr_diagnostics_state", () => {
      expect(STORAGE_KEY).toBe("anqr_diagnostics_state");
    });
  });

  // ── readState ──────────────────────────────────────────────────

  describe("readState", () => {
    it("returns null when localStorage is unavailable", () => {
      expect(readState()).toBeNull();
    });
  });

  // ── isEnabled ──────────────────────────────────────────────────

  describe("isEnabled", () => {
    it("returns false when no state exists", () => {
      expect(isEnabled()).toBe(false);
    });
  });

  // ── trackZarazEvent ────────────────────────────────────────────

  describe("trackZarazEvent", () => {
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
      originalWindow = globalThis.window;
    });

    afterEach(() => {
      if (originalWindow === undefined) {
        delete (globalThis as Record<string, unknown>).window;
      } else {
        (globalThis as Record<string, unknown>).window = originalWindow;
      }
    });

    it("does not throw when window is undefined", () => {
      delete (globalThis as Record<string, unknown>).window;
      expect(() => trackZarazEvent("test")).not.toThrow();
    });

    it("does not throw when window.zaraz is undefined", () => {
      (globalThis as Record<string, unknown>).window = {};
      expect(() => trackZarazEvent("test")).not.toThrow();
    });

    it("calls zaraz.track when available", () => {
      const mockTrack = vi.fn();
      (globalThis as Record<string, unknown>).window = {
        zaraz: { track: mockTrack },
      };
      trackZarazEvent("page_view", { page: "home" });
      expect(mockTrack).toHaveBeenCalledWith("page_view", { page: "home" });
    });

    it("passes event name without properties", () => {
      const mockTrack = vi.fn();
      (globalThis as Record<string, unknown>).window = {
        zaraz: { track: mockTrack },
      };
      trackZarazEvent("click");
      expect(mockTrack).toHaveBeenCalledWith("click", undefined);
    });

    it("does not throw when zaraz.track throws", () => {
      (globalThis as Record<string, unknown>).window = {
        zaraz: {
          track: () => {
            throw new Error("fail");
          },
        },
      };
      expect(() => trackZarazEvent("test")).not.toThrow();
    });
  });

  // ── trackEvent ─────────────────────────────────────────────────

  describe("trackEvent", () => {
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
      originalWindow = globalThis.window;
    });

    afterEach(() => {
      if (originalWindow === undefined) {
        delete (globalThis as Record<string, unknown>).window;
      } else {
        (globalThis as Record<string, unknown>).window = originalWindow;
      }
    });

    it("delegates to trackZarazEvent", () => {
      const mockTrack = vi.fn();
      (globalThis as Record<string, unknown>).window = {
        zaraz: { track: mockTrack },
      };
      trackEvent("generate", { format: "png" });
      expect(mockTrack).toHaveBeenCalledWith("generate", { format: "png" });
    });

    it("does not throw without zaraz", () => {
      delete (globalThis as Record<string, unknown>).window;
      expect(() => trackEvent("test")).not.toThrow();
    });
  });
});
