import { describe, expect, it } from "vitest";
import { serializeUrlWithUtm } from "./serialize-url-with-utm";
import type { PayloadData } from "./payload-data";

function payload(over: Partial<PayloadData["url"]> = {}): PayloadData {
  return {
    url: { href: "https://anqr.link", forceHttps: false, ...over },
  } as PayloadData;
}

describe("serializeUrlWithUtm", () => {
  it("returns the URL unchanged when no UTM params and no forceHttps", () => {
    expect(serializeUrlWithUtm(payload())).toBe("https://anqr.link");
  });

  it("rewrites http: to https: when forceHttps is true", () => {
    expect(
      serializeUrlWithUtm(payload({ href: "http://example.com", forceHttps: true })),
    ).toBe("https://example.com");
  });

  it("does not rewrite when forceHttps is false", () => {
    expect(
      serializeUrlWithUtm(payload({ href: "http://example.com", forceHttps: false })),
    ).toBe("http://example.com");
  });

  it("appends UTM parameters with `?` when URL has none", () => {
    const result = serializeUrlWithUtm(
      payload({
        href: "https://anqr.link",
        utmSource: "qr",
        utmMedium: "print",
        utmCampaign: "spring",
      }),
    );
    expect(result).toContain("https://anqr.link?");
    expect(result).toContain("utm_source=qr");
    expect(result).toContain("utm_medium=print");
    expect(result).toContain("utm_campaign=spring");
  });

  it("uses `&` joiner when URL already has a query string", () => {
    const result = serializeUrlWithUtm(
      payload({ href: "https://anqr.link?x=1", utmSource: "qr" }),
    );
    expect(result).toBe("https://anqr.link?x=1&utm_source=qr");
  });

  it("emits utm_term and utm_content when present", () => {
    const result = serializeUrlWithUtm(
      payload({
        href: "https://anqr.link",
        utmTerm: "keyword",
        utmContent: "banner",
      }),
    );
    expect(result).toContain("utm_term=keyword");
    expect(result).toContain("utm_content=banner");
  });

  it("skips UTM params that are empty strings or undefined", () => {
    const result = serializeUrlWithUtm(
      payload({
        href: "https://anqr.link",
        utmSource: "qr",
        utmMedium: "",
      }),
    );
    expect(result).toContain("utm_source=qr");
    expect(result).not.toContain("utm_medium");
  });
});
