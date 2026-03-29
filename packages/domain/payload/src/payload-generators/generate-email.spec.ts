import { describe, it, expect } from "vitest";
import { generateEmail } from "./generate-email";

describe("generateEmail", () => {
  it("should generate basic mailto link", () => {
    const result = generateEmail({ to: "test@example.com" });
    expect(result).toBe("mailto:test@example.com");
  });

  it("should include subject when provided", () => {
    const result = generateEmail({
      to: "test@example.com",
      subject: "Hello",
    });
    expect(result).toBe("mailto:test@example.com?subject=Hello");
  });

  it("should include body when provided", () => {
    const result = generateEmail({
      to: "test@example.com",
      body: "Test message",
    });
    expect(result).toBe("mailto:test@example.com?body=Test+message");
  });

  it("should include both subject and body", () => {
    const result = generateEmail({
      to: "test@example.com",
      subject: "Hello",
      body: "Test message",
    });
    expect(result).toContain("mailto:test@example.com?");
    expect(result).toContain("subject=Hello");
    expect(result).toContain("body=Test+message");
  });

  it("should handle special characters in subject", () => {
    const result = generateEmail({
      to: "test@example.com",
      subject: "Hello & Welcome!",
    });
    expect(result).toContain("subject=Hello+%26+Welcome%21");
  });

  it("should handle special characters in body", () => {
    const result = generateEmail({
      to: "test@example.com",
      body: "Line 1\nLine 2",
    });
    expect(result).toContain("body=Line+1%0ALine+2");
  });

  it("should handle multiple recipients", () => {
    const result = generateEmail({ to: "test1@example.com,test2@example.com" });
    expect(result).toBe("mailto:test1@example.com,test2@example.com");
  });

  it("should handle empty subject and body", () => {
    const result = generateEmail({ to: "test@example.com", subject: "", body: "" });
    expect(result).toBe("mailto:test@example.com");
  });
});
