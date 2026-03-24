import { describe, it, expect } from "vitest";
import type { ContentTypeDetails } from "./content-type-details.contract";

describe("contracts/analyze/content-type-details", () => {
  describe("ContentTypeDetails", () => {
    it("accepts URL content type details", () => {
      const details: ContentTypeDetails = {
        type: "url",
        label: "Website URL",
        url: "https://example.com",
        protocol: "https",
      };
      expect(details.type).toBe("url");
      expect(details.url).toBe("https://example.com");
    });

    it("accepts WiFi content type details", () => {
      const details: ContentTypeDetails = {
        type: "wifi",
        label: "WiFi Network",
        wifiSsid: "MyNetwork",
        wifiAuth: "WPA",
      };
      expect(details.wifiSsid).toBe("MyNetwork");
    });

    it("accepts contact content type details", () => {
      const details: ContentTypeDetails = {
        type: "vcard",
        label: "Contact Card",
        contactName: "John Doe",
      };
      expect(details.contactName).toBe("John Doe");
    });

    it("accepts phone content type details", () => {
      const details: ContentTypeDetails = {
        type: "tel",
        label: "Phone Number",
        phoneNumber: "+1234567890",
      };
      expect(details.phoneNumber).toBe("+1234567890");
    });

    it("accepts email content type details", () => {
      const details: ContentTypeDetails = {
        type: "email",
        label: "Email Address",
        emailAddress: "test@example.com",
      };
      expect(details.emailAddress).toBe("test@example.com");
    });

    it("accepts crypto content type details", () => {
      const details: ContentTypeDetails = {
        type: "crypto_bitcoin",
        label: "Bitcoin Address",
        cryptoCurrency: "BTC",
        cryptoAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", // cspell:disable-line
        amount: "0.001",
      };
      expect(details.cryptoCurrency).toBe("BTC");
    });

    it("accepts URL with UTM parameters", () => {
      const details: ContentTypeDetails = {
        type: "url",
        label: "Marketing URL",
        url: "https://example.com?utm_source=qr&utm_medium=print&utm_campaign=spring2024",
        protocol: "https",
        hasUtmParams: true,
        utmSource: "qr",
        utmMedium: "print",
        utmCampaign: "spring2024",
      };
      expect(details.hasUtmParams).toBe(true);
      expect(details.utmSource).toBe("qr");
    });

    it("accepts plain text content type", () => {
      const details: ContentTypeDetails = {
        type: "plain_text",
        label: "Plain Text",
      };
      expect(details.type).toBe("plain_text");
    });
  });
});
