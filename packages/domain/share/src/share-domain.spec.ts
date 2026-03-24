import { describe, it, expect } from "vitest";
import { checkShareUrlLength } from "./check-share-url-length";
import { convertToImageApiUrl } from "./convert-to-image-api-url";
import { generateBBCodeEmbed } from "./generate-bb-code-embed";
import { generateMarkdownEmbed } from "./generate-markdown-embed";
import { MAX_SHARE_URL_LENGTH } from "./share-links/types";
import { getSocialShareUrls } from "./social";
import {
  URL_PARAMS_API,
  EMBED_API,
  SOCIAL_API,
  CONSTANTS,
  TYPES,
  PUBLIC_API,
} from "./share-links/api";

describe("domain/share", () => {
  describe("MAX_SHARE_URL_LENGTH", () => {
    it("is 2048", () => {
      expect(MAX_SHARE_URL_LENGTH).toBe(2048);
    });
  });

  describe("checkShareUrlLength", () => {
    it("returns null for URLs within the limit", () => {
      expect(checkShareUrlLength("https://example.com/qr")).toBeNull();
    });

    it("returns null for URLs exactly at the limit", () => {
      const url = "a".repeat(2048);
      expect(checkShareUrlLength(url)).toBeNull();
    });

    it("returns warning for URLs exceeding the limit", () => {
      const url = "a".repeat(2049);
      const result = checkShareUrlLength(url);
      expect(result).not.toBeNull();
      expect(result).toContain("2049");
      expect(result).toContain(String(MAX_SHARE_URL_LENGTH));
    });

    it("warning mentions URL shortener", () => {
      const url = "a".repeat(3000);
      const result = checkShareUrlLength(url);
      expect(result).toContain("URL shortener");
    });

    it("returns null for empty string", () => {
      expect(checkShareUrlLength("")).toBeNull();
    });
  });

  describe("convertToImageApiUrl", () => {
    it("converts a basic share URL to API URL", () => {
      const result = convertToImageApiUrl("https://anqr.link/?data=hello");
      expect(result).toContain("/api/qr?");
      expect(result).toContain("data=hello");
    });

    it("uses default size of 200", () => {
      const result = convertToImageApiUrl("https://anqr.link/?data=test");
      expect(result).toContain("size=200");
    });

    it("uses custom size", () => {
      const result = convertToImageApiUrl("https://anqr.link/?data=test", 400);
      expect(result).toContain("size=400");
    });

    it("uses width and height when provided", () => {
      const result = convertToImageApiUrl("https://anqr.link/?data=test", 200, 300, 400);
      expect(result).toContain("w=300");
      expect(result).toContain("h=400");
    });

    it("passes through styling params from the share URL", () => {
      const result = convertToImageApiUrl("https://anqr.link/?data=test&fg=ff0000&bg=ffffff");
      expect(result).toContain("fg=ff0000");
      expect(result).toContain("bg=ffffff");
    });

    it("converts client size param to modulePx", () => {
      const result = convertToImageApiUrl("https://anqr.link/?data=test&size=10");
      expect(result).toContain("modulePx=10");
    });

    it("preserves overlay URL param", () => {
      const result = convertToImageApiUrl(
        "https://anqr.link/?data=test&img=https%3A%2F%2Fexample.com%2Flogo.png",
      );
      expect(result).toContain("img=");
    });

    it("preserves format param", () => {
      const result = convertToImageApiUrl("https://anqr.link/?data=test&format=svg");
      expect(result).toContain("format=svg");
    });

    it("returns fallback URL for invalid input", () => {
      const result = convertToImageApiUrl("not-a-url");
      expect(result).toContain("/api/qr?");
      expect(result).toContain("data=");
    });

    it("uses URL width/height from share URL when custom not provided", () => {
      const result = convertToImageApiUrl("https://anqr.link/?data=test&w=500&h=300");
      expect(result).toContain("w=500");
      expect(result).toContain("h=300");
    });
  });

  describe("generateBBCodeEmbed", () => {
    it("generates img-only BBCode without link", () => {
      const result = generateBBCodeEmbed("https://example.com/qr.png");
      expect(result).toBe("[img]https://example.com/qr.png[/img]");
    });

    it("wraps in url tags when linkUrl is provided", () => {
      const result = generateBBCodeEmbed(
        "https://example.com/qr.png",
        "https://example.com",
      );
      expect(result).toBe(
        "[url=https://example.com][img]https://example.com/qr.png[/img][/url]",
      );
    });
  });

  describe("getSocialShareUrls", () => {
    it("returns all expected social platform keys", () => {
      const urls = getSocialShareUrls("https://example.com");
      expect(Object.keys(urls)).toEqual(
        expect.arrayContaining([
          "twitter",
          "facebook",
          "linkedin",
          "reddit",
          "email",
          "whatsapp",
          "telegram",
        ]),
      );
    });

    it("encodes URL in all share links", () => {
      const urls = getSocialShareUrls("https://example.com/qr?id=1");
      const encoded = encodeURIComponent("https://example.com/qr?id=1");
      expect(urls.twitter).toContain(encoded);
      expect(urls.facebook).toContain(encoded);
      expect(urls.linkedin).toContain(encoded);
    });

    it("uses default title when not provided", () => {
      const urls = getSocialShareUrls("https://example.com");
      expect(urls.twitter).toContain(encodeURIComponent("Check out this QR code!"));
    });

    it("uses custom title", () => {
      const urls = getSocialShareUrls("https://example.com", "My QR");
      expect(urls.twitter).toContain(encodeURIComponent("My QR"));
    });

    it("generates valid twitter intent URL", () => {
      const urls = getSocialShareUrls("https://example.com");
      expect(urls.twitter).toMatch(/^https:\/\/twitter\.com\/intent\/tweet\?/);
    });

    it("generates valid facebook sharer URL", () => {
      const urls = getSocialShareUrls("https://example.com");
      expect(urls.facebook).toMatch(/^https:\/\/www\.facebook\.com\/sharer\//);
    });

    it("generates valid mailto URL", () => {
      const urls = getSocialShareUrls("https://example.com");
      expect(urls.email).toMatch(/^mailto:\?subject=/);
    });

    it("generates valid whatsapp URL", () => {
      const urls = getSocialShareUrls("https://example.com");
      expect(urls.whatsapp).toMatch(/^https:\/\/wa\.me\//);
    });

    it("generates valid telegram URL", () => {
      const urls = getSocialShareUrls("https://example.com");
      expect(urls.telegram).toMatch(/^https:\/\/t\.me\/share\//);
    });
  });

  describe("API manifest constants", () => {
    it("URL_PARAMS_API has expected entries", () => {
      expect(URL_PARAMS_API).toContain("buildUrlParams");
      expect(URL_PARAMS_API).toContain("parseUrlParams");
      expect(URL_PARAMS_API).toContain("checkShareUrlLength");
    });

    it("EMBED_API has expected entries", () => {
      expect(EMBED_API).toContain("generateMarkdownEmbed");
      expect(EMBED_API).toContain("generateBBCodeEmbed");
      expect(EMBED_API).toContain("convertToImageApiUrl");
    });

    it("SOCIAL_API contains getSocialShareUrls", () => {
      expect(SOCIAL_API).toContain("getSocialShareUrls");
    });

    it("CONSTANTS contains MAX_SHARE_URL_LENGTH", () => {
      expect(CONSTANTS).toContain("MAX_SHARE_URL_LENGTH");
    });

    it("TYPES lists EmbedOptions and ShareConfig", () => {
      expect(TYPES).toContain("EmbedOptions");
      expect(TYPES).toContain("ShareConfig");
    });

    it("PUBLIC_API is union of all non-type APIs", () => {
      for (const entry of URL_PARAMS_API) {
        expect(PUBLIC_API).toContain(entry);
      }
      for (const entry of EMBED_API) {
        expect(PUBLIC_API).toContain(entry);
      }
      for (const entry of SOCIAL_API) {
        expect(PUBLIC_API).toContain(entry);
      }
      for (const entry of CONSTANTS) {
        expect(PUBLIC_API).toContain(entry);
      }
    });
  });

  describe("generateMarkdownEmbed", () => {
    it("generates markdown image with default alt text", () => {
      const result = generateMarkdownEmbed("https://anqr.link/?data=hello");
      expect(result).toMatch(/^!\[QR Code\]\(/);
      expect(result).toContain("/api/qr?");
    });

    it("uses custom alt text", () => {
      const result = generateMarkdownEmbed("https://anqr.link/?data=hello", "My QR");
      expect(result).toMatch(/^!\[My QR\]\(/);
    });

    it("passes size to convertToImageApiUrl", () => {
      const result = generateMarkdownEmbed("https://anqr.link/?data=hello", "QR", 500);
      expect(result).toContain("size=500");
    });

    it("passes width and height to convertToImageApiUrl", () => {
      const result = generateMarkdownEmbed(
        "https://anqr.link/?data=hello",
        "QR",
        200,
        300,
        400,
      );
      expect(result).toContain("w=300");
      expect(result).toContain("h=400");
    });

    it("wraps API URL in markdown image syntax", () => {
      const result = generateMarkdownEmbed("https://anqr.link/?data=test");
      expect(result).toMatch(/^!\[.+\]\(.+\)$/);
    });
  });
});
