import { describe, it, expect } from "vitest";

const { detectCodebuffMode } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/detect-codebuff-mode.mjs"
);

describe("detectCodebuffMode", () => {
  it("returns null for null/undefined response", () => {
    expect(detectCodebuffMode(null)).toBeNull();
    expect(detectCodebuffMode(undefined)).toBeNull();
  });

  it("returns null for empty object", () => {
    expect(detectCodebuffMode({})).toBeNull();
  });

  it("returns null when no mode indicators are present", () => {
    expect(detectCodebuffMode({ headers: {} })).toBeNull();
    expect(detectCodebuffMode({ error: "something else" })).toBeNull();
  });

  describe("X-Codebuff-Mode header", () => {
    it("returns the header value when present", () => {
      expect(
        detectCodebuffMode({ headers: { "x-codebuff-mode": "free" } })
      ).toBe("free");
    });

    it("returns paid mode from header", () => {
      expect(
        detectCodebuffMode({ headers: { "x-codebuff-mode": "paid" } })
      ).toBe("paid");
    });

    it("header takes precedence over error message detection", () => {
      expect(
        detectCodebuffMode({
          headers: { "x-codebuff-mode": "paid" },
          error: "free credits exhausted",
        })
      ).toBe("paid");
    });
  });

  describe("error message detection", () => {
    it('detects "free" from error containing "free mode"', () => {
      expect(detectCodebuffMode({ error: "Running in free mode" })).toBe(
        "free"
      );
    });

    it('detects "free" from error containing "free credits"', () => {
      expect(
        detectCodebuffMode({ error: "You have free credits remaining" })
      ).toBe("free");
    });

    it('detects "paid" from error containing "paid mode"', () => {
      expect(detectCodebuffMode({ error: "Switched to paid mode" })).toBe(
        "paid"
      );
    });

    it('detects "paid" from error containing "out of credits"', () => {
      expect(detectCodebuffMode({ error: "You are out of credits" })).toBe(
        "paid"
      );
    });

    it("detects from message field (not just error)", () => {
      expect(detectCodebuffMode({ message: "free mode active" })).toBe(
        "free"
      );
    });

    it("prefers error over message when both present", () => {
      expect(
        detectCodebuffMode({
          error: "out of credits",
          message: "free mode active",
        })
      ).toBe("paid");
    });

    it("is case-insensitive for error/message detection", () => {
      expect(detectCodebuffMode({ error: "FREE MODE" })).toBe("free");
      expect(detectCodebuffMode({ error: "Out Of Credits" })).toBe("paid");
    });

    it("returns null for unrelated error messages", () => {
      expect(detectCodebuffMode({ error: "network timeout" })).toBeNull();
      expect(detectCodebuffMode({ message: "rate limited" })).toBeNull();
    });
  });
});
