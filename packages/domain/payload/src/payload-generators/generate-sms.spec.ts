import { describe, it, expect } from "vitest";
import { generateSms } from "./generate-sms";

describe("generateSms", () => {
  it("should generate basic SMS URI", () => {
    const result = generateSms({ number: "+1234567890" });
    expect(result).toBe("sms:+1234567890");
  });

  it("should include body when provided", () => {
    const result = generateSms({ number: "+1234567890", body: "Hello" });
    expect(result).toBe("sms:+1234567890?body=Hello");
  });

  it("should encode special characters in body", () => {
    const result = generateSms({ number: "+1234567890", body: "Hello & Welcome!" });
    expect(result).toBe("sms:+1234567890?body=Hello%20%26%20Welcome!");
  });

  it("should handle number without country code", () => {
    const result = generateSms({ number: "1234567890" });
    expect(result).toBe("sms:1234567890");
  });

  it("should handle empty body", () => {
    const result = generateSms({ number: "+1234567890", body: "" });
    expect(result).toBe("sms:+1234567890");
  });

  it("should encode newlines in body", () => {
    const result = generateSms({ number: "+1234567890", body: "Line1\nLine2" });
    expect(result).toContain("Line1%0ALine2");
  });
});
