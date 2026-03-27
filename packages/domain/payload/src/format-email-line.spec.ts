import { describe, it, expect } from "vitest";
import { formatEmailLine } from "./format-email-line";

describe("formatEmailLine", () => {
  it("should format email for vCard 4.0", () => {
    const result = formatEmailLine("test@example.com", "4.0");
    expect(result).toBe("EMAIL:test@example.com");
  });

  it("should format email for vCard 2.1", () => {
    const result = formatEmailLine("test@example.com", "2.1");
    expect(result).toBe("EMAIL;INTERNET:test@example.com");
  });

  it("should format email for vCard 3.0 (default)", () => {
    const result = formatEmailLine("test@example.com", "3.0");
    expect(result).toBe("EMAIL;TYPE=INTERNET:test@example.com");
  });

  it("should handle any other version with TYPE=INTERNET", () => {
    const result = formatEmailLine("test@example.com", "5.0");
    expect(result).toBe("EMAIL;TYPE=INTERNET:test@example.com");
  });

  it("should preserve email address exactly", () => {
    const email = "user+tag@subdomain.example.com";
    const result = formatEmailLine(email, "4.0");
    expect(result).toContain(email);
  });
});
