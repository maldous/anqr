import { describe, it, expect } from "vitest";
import { generateUrl } from "./generate-url.js";

describe("generateUrl", () => {
  it("should generate basic URL", () => {
    const result = generateUrl({ href: "https://example.com", forceHttps: false });
    expect(result).toBe("https://example.com");
  });

  it("should force HTTPS when specified", () => {
    const result = generateUrl({ href: "http://example.com", forceHttps: true });
    expect(result).toBe("https://example.com");
  });

  it("should not modify HTTPS URLs when forceHttps is true", () => {
    const result = generateUrl({ href: "https://example.com", forceHttps: true });
    expect(result).toBe("https://example.com");
  });

  it("should append UTM source parameter", () => {
    const result = generateUrl({ href: "https://example.com", forceHttps: false, utmSource: "qrcode" });
    expect(result).toContain("utm_source=qrcode");
  });

  it("should append UTM medium parameter", () => {
    const result = generateUrl({ href: "https://example.com", forceHttps: false, utmMedium: "print" });
    expect(result).toContain("utm_medium=print");
  });

  it("should append UTM campaign parameter", () => {
    const result = generateUrl({ href: "https://example.com", forceHttps: false, utmCampaign: "summer2024" });
    expect(result).toContain("utm_campaign=summer2024");
  });

  it("should append UTM term parameter", () => {
    const result = generateUrl({ href: "https://example.com", forceHttps: false, utmTerm: "keywords" });
    expect(result).toContain("utm_term=keywords");
  });

  it("should append UTM content parameter", () => {
    const result = generateUrl({ href: "https://example.com", forceHttps: false, utmContent: "banner" });
    expect(result).toContain("utm_content=banner");
  });

  it("should append multiple UTM parameters", () => {
    const result = generateUrl({ href: "https://example.com", forceHttps: false, utmSource: "qrcode", utmMedium: "print", utmCampaign: "summer2024" });
    expect(result).toContain("utm_source=qrcode");
    expect(result).toContain("utm_medium=print");
    expect(result).toContain("utm_campaign=summer2024");
  });

  it("should handle URL with existing query parameters", () => {
    const result = generateUrl({ href: "https://example.com?foo=bar", forceHttps: false, utmSource: "qrcode" });
    expect(result).toContain("foo=bar");
    expect(result).toContain("utm_source=qrcode");
  });

  it("should preserve URL fragments", () => {
    const result = generateUrl({ href: "https://example.com#section", forceHttps: false });
    expect(result).toContain("#section");
  });

  it("should append all UTM parameters", () => {
    const result = generateUrl({
      href: "https://example.com",
      forceHttps: false,
      utmSource: "qrcode",
      utmMedium: "print",
      utmCampaign: "summer2024",
      utmTerm: "keywords",
      utmContent: "banner"
    });
    expect(result).toContain("utm_source=qrcode");
    expect(result).toContain("utm_medium=print");
    expect(result).toContain("utm_campaign=summer2024");
    expect(result).toContain("utm_term=keywords");
    expect(result).toContain("utm_content=banner");
  });

  it("should handle empty UTM parameters by omitting them", () => {
    const result = generateUrl({ href: "https://example.com", forceHttps: false, utmSource: "" });
    expect(result).toBe("https://example.com");
  });
});
