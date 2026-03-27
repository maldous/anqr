import { describe, it, expect } from "vitest";
import { formatTelLine } from "./format-tel-line";

describe("formatTelLine", () => {
  it("should format telephone for vCard 4.0", () => {
    const result = formatTelLine("+1234567890", "4.0");
    expect(result).toBe("TEL;TYPE=voice:+1234567890");
  });

  it("should format telephone for vCard 2.1", () => {
    const result = formatTelLine("+1234567890", "2.1");
    expect(result).toBe("TEL;CELL:+1234567890");
  });

  it("should format telephone for vCard 3.0 (default)", () => {
    const result = formatTelLine("+1234567890", "3.0");
    expect(result).toBe("TEL:+1234567890");
  });

  it("should handle any other version with plain TEL", () => {
    const result = formatTelLine("+1234567890", "5.0");
    expect(result).toBe("TEL:+1234567890");
  });

  it("should preserve telephone number exactly", () => {
    const tel = "+1-555-123-4567";
    const result = formatTelLine(tel, "4.0");
    expect(result).toContain(tel);
  });
});
