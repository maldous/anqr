import { describe, expect, it } from "vitest";
import type { EncodingMode } from "./encoding-mode.contract";

describe("EncodingMode", () => {
  it("should allow auto", () => {
    const mode: EncodingMode = "auto";
    expect(mode).toBe("auto");
  });

  it("should allow numeric", () => {
    const mode: EncodingMode = "numeric";
    expect(mode).toBe("numeric");
  });

  it("should allow alphanumeric", () => {
    const mode: EncodingMode = "alphanumeric";
    expect(mode).toBe("alphanumeric");
  });

  it("should allow byte", () => {
    const mode: EncodingMode = "byte";
    expect(mode).toBe("byte");
  });

  it("should allow kanji", () => {
    const mode: EncodingMode = "kanji";
    expect(mode).toBe("kanji");
  });
});
