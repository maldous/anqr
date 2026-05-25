// L1 step 1 — first spec in the apps/web/ unit-test substrate.
//
// applyPayloadTransforms is the cleanest test target: pure function,
// two flags (trim, normalizeNewlines), no external dependencies.
// Verifies both transforms run in order and that the no-op path returns
// the input unchanged.
import { describe, expect, it } from "vitest";
import { applyPayloadTransforms } from "./apply-payload-transforms";
import type { PayloadData } from "./payload-data";

function payload(over: Partial<PayloadData> = {}): PayloadData {
  // Shape just enough to satisfy applyPayloadTransforms, which only reads
  // .trim and .normalizeNewlines. Cast keeps the spec free of the full
  // PayloadData shape (which is large).
  return {
    trim: false,
    normalizeNewlines: false,
    ...over,
  } as PayloadData;
}

describe("applyPayloadTransforms", () => {
  it("returns the input unchanged when both flags are off", () => {
    expect(applyPayloadTransforms("  hello  ", payload())).toBe("  hello  ");
    expect(applyPayloadTransforms("a\r\nb\rc\nd", payload())).toBe("a\r\nb\rc\nd");
  });

  it("trims surrounding whitespace when payload.trim is true", () => {
    expect(applyPayloadTransforms("  hello  ", payload({ trim: true }))).toBe("hello");
    expect(applyPayloadTransforms("\n\nx\n\n", payload({ trim: true }))).toBe("x");
  });

  it("normalizes \\r\\n and \\r to \\n when normalizeNewlines is true", () => {
    expect(
      applyPayloadTransforms("a\r\nb\rc\nd", payload({ normalizeNewlines: true })),
    ).toBe("a\nb\nc\nd");
  });

  it("applies trim before normalization (newlines around the edges go away too)", () => {
    expect(
      applyPayloadTransforms("\r\nhello\r\n", payload({ trim: true, normalizeNewlines: true })),
    ).toBe("hello");
  });

  it("does not modify interior runs of newlines beyond normalization", () => {
    // Two interior newlines should remain two newlines after normalization,
    // not collapsed.
    expect(
      applyPayloadTransforms("a\r\n\r\nb", payload({ normalizeNewlines: true })),
    ).toBe("a\n\nb");
  });

  it("is idempotent when applied twice with both flags on", () => {
    const input = "  a\r\nb  ";
    const opts = payload({ trim: true, normalizeNewlines: true });
    const once = applyPayloadTransforms(input, opts);
    const twice = applyPayloadTransforms(once, opts);
    expect(twice).toBe(once);
    expect(once).toBe("a\nb");
  });

  it("preserves the empty string under both transforms", () => {
    expect(applyPayloadTransforms("", payload({ trim: true, normalizeNewlines: true }))).toBe("");
  });
});
