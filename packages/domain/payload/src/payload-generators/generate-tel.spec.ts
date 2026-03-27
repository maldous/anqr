import { describe, it, expect } from "vitest";
import { generateTel } from "./generate-tel";

describe("generateTel", () => {
  it("should generate basic tel URI", () => {
    const result = generateTel({ number: "+1234567890" });
    expect(result).toBe("tel:+1234567890");
  });

  it("should remove spaces from number", () => {
    const result = generateTel({ number: "+1 234 567 890" });
    expect(result).toBe("tel:+1234567890");
  });

  it("should handle number without country code", () => {
    const result = generateTel({ number: "1234567890" });
    expect(result).toBe("tel:1234567890");
  });

  it("should remove multiple spaces", () => {
    const result = generateTel({ number: "+1  234  567  890" });
    expect(result).toBe("tel:+1234567890");
  });

  it("should handle number with dashes", () => {
    const result = generateTel({ number: "+1-234-567-890" });
    expect(result).toBe("tel:+1-234-567-890");
  });

  it("should handle empty spaces only", () => {
    const result = generateTel({ number: "   " });
    expect(result).toBe("tel:");
  });
});
