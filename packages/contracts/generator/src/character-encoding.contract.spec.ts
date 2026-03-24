import { describe, expect, it } from "vitest";
import type { CharacterEncoding } from "./character-encoding.contract";

describe("CharacterEncoding", () => {
  it("should allow default", () => {
    const encoding: CharacterEncoding = "default";
    expect(encoding).toBe("default");
  });

  it("should allow utf8", () => {
    const encoding: CharacterEncoding = "utf8";
    expect(encoding).toBe("utf8");
  });

  it("should allow iso-8859-1", () => {
    const encoding: CharacterEncoding = "iso-8859-1";
    expect(encoding).toBe("iso-8859-1");
  });

  it("should allow shift-jis", () => {
    const encoding: CharacterEncoding = "shift-jis";
    expect(encoding).toBe("shift-jis");
  });
});
