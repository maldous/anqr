import { describe, it, expect } from "vitest";
import { generateUrl } from "./payload-generators/generate-url";
import { generateEmail } from "./payload-generators/generate-email";
import { generateSms } from "./payload-generators/generate-sms";
import { generateTel } from "./payload-generators/generate-tel";
import { generateGeo } from "./payload-generators/generate-geo";
import { generateWifi } from "./payload-generators/generate-wifi";
import { crc16CCITT } from "./payload-generators/crc16-ccitt";
import { escapeValue } from "./payload-generators/escape-value";
import { formatICalDate } from "./payload-generators/format-i-cal-date";
import { utf8ByteLength } from "./payload-generators/utf8-byte-length";
import { isNonEmpty } from "./payload-generators/is-non-empty";
import { generateVCard } from "./generate-v-card";
import { generateMeCard } from "./generate-me-card";
import { generateCrypto } from "./generate-crypto";
import { generateOTPAuth } from "./generate-otp-auth";
import { resolveTipValue } from "./resolve-tip-value";
import { validateEMVQRCRC } from "./validate-emvqrcrc";
import { buildEMVAdditionalData } from "./build-emv-additional-data";
import { formatEmailLine } from "./format-email-line";
import { formatTelLine } from "./format-tel-line";

describe("domain/payload generators", () => {
  // ── generateUrl ────────────────────────────────────────────────

  describe("generateUrl", () => {
    it("returns URL as-is when no extras", () => {
      expect(generateUrl({ href: "https://example.com", forceHttps: false })).toBe(
        "https://example.com",
      );
    });

    it("forces HTTPS when flag is set", () => {
      expect(generateUrl({ href: "http://example.com", forceHttps: true })).toBe(
        "https://example.com",
      );
    });

    it("does not change HTTPS when forceHttps is set", () => {
      expect(generateUrl({ href: "https://example.com", forceHttps: true })).toBe(
        "https://example.com",
      );
    });

    it("appends UTM parameters", () => {
      const result = generateUrl({
        href: "https://example.com",
        forceHttps: false,
        utmSource: "qr",
        utmMedium: "print",
      });
      expect(result).toContain("utm_source=qr");
      expect(result).toContain("utm_medium=print");
    });

    it("appends with & when URL already has query params", () => {
      const result = generateUrl({
        href: "https://example.com?page=1",
        forceHttps: false,
        utmSource: "qr",
      });
      expect(result).toContain("?page=1&");
      expect(result).toContain("utm_source=qr");
    });
  });

  // ── generateEmail ──────────────────────────────────────────────

  describe("generateEmail", () => {
    it("generates basic mailto URI", () => {
      expect(generateEmail({ to: "test@example.com" })).toBe("mailto:test@example.com");
    });

    it("includes subject and body", () => {
      const result = generateEmail({
        to: "test@example.com",
        subject: "Hello",
        body: "World",
      });
      expect(result).toContain("mailto:test@example.com?");
      expect(result).toContain("subject=Hello");
      expect(result).toContain("body=World");
    });

    it("includes only subject when no body", () => {
      const result = generateEmail({ to: "test@example.com", subject: "Hi" });
      expect(result).toContain("subject=Hi");
      expect(result).not.toContain("body");
    });
  });

  // ── generateSms ────────────────────────────────────────────────

  describe("generateSms", () => {
    it("generates basic SMS URI", () => {
      expect(generateSms({ number: "+15551234567" })).toBe("sms:+15551234567");
    });

    it("includes body when provided", () => {
      const result = generateSms({ number: "+15551234567", body: "Hello World" });
      expect(result).toContain("sms:+15551234567?");
      expect(result).toContain("body=");
    });

    it("encodes body content", () => {
      const result = generateSms({ number: "+1555", body: "Hello World" });
      expect(result).toContain("Hello%20World");
    });
  });

  // ── generateTel ────────────────────────────────────────────────

  describe("generateTel", () => {
    it("generates tel URI", () => {
      expect(generateTel({ number: "+15551234567" })).toBe("tel:+15551234567");
    });

    it("strips whitespace from number", () => {
      expect(generateTel({ number: "+1 555 123 4567" })).toBe("tel:+15551234567");
    });

    it("preserves + prefix", () => {
      const result = generateTel({ number: "+61400000000" });
      expect(result).toBe("tel:+61400000000");
    });
  });

  // ── generateGeo ────────────────────────────────────────────────

  describe("generateGeo", () => {
    it("generates geo URI", () => {
      expect(generateGeo({ lat: 40.7128, lon: -74.006 })).toBe("geo:40.7128,-74.006");
    });

    it("handles zero coordinates", () => {
      expect(generateGeo({ lat: 0, lon: 0 })).toBe("geo:0,0");
    });

    it("handles negative coordinates", () => {
      expect(generateGeo({ lat: -33.8688, lon: 151.2093 })).toBe("geo:-33.8688,151.2093");
    });
  });

  // ── generateWifi ───────────────────────────────────────────────

  describe("generateWifi", () => {
    it("generates WPA WiFi string", () => {
      const result = generateWifi({
        ssid: "MyNetwork",
        auth: "WPA",
        password: "secret123",
        hidden: false,
      });
      expect(result).toContain("WIFI:");
      expect(result).toContain("T:WPA;");
      expect(result).toContain("S:MyNetwork;");
      expect(result).toContain("P:secret123;");
    });

    it("omits password for nopass", () => {
      const result = generateWifi({ ssid: "OpenNet", auth: "nopass", hidden: false });
      expect(result).toContain("T:nopass;");
      expect(result).not.toContain("P:");
    });

    it("includes hidden flag when set", () => {
      const result = generateWifi({ ssid: "Hidden", auth: "WPA", password: "pw", hidden: true });
      expect(result).toContain("H:true;");
    });

    it("escapes special characters in SSID", () => {
      const result = generateWifi({
        ssid: "My;Network",
        auth: "WPA",
        password: "p",
        hidden: false,
      });
      expect(result).toContain("S:My\\;Network;");
    });

    it("ends with double semicolon", () => {
      const result = generateWifi({ ssid: "Net", auth: "WPA", password: "p", hidden: false });
      expect(result).toMatch(/;;$/);
    });
  });

  // ── generateMeCard ─────────────────────────────────────────────

  describe("generateMeCard", () => {
    it("generates basic MeCard with name", () => {
      const result = generateMeCard({ n: "Doe,John" });
      expect(result).toContain("MECARD:");
      expect(result).toContain("N:Doe\\,John;");
    });

    it("includes email and tel", () => {
      const result = generateMeCard({
        n: "Smith",
        email: "j@example.com",
        tel: "+15551234567",
      });
      expect(result).toContain("EMAIL:j@example.com;");
      expect(result).toContain("TEL:+15551234567;");
    });

    it("strips dashes from birthday", () => {
      const result = generateMeCard({ bday: "1990-05-15" });
      expect(result).toContain("BDAY:19900515;");
    });

    it("ends with double semicolon", () => {
      const result = generateMeCard({ n: "Test" });
      expect(result).toMatch(/;;$/);
    });
  });

  // ── generateVCard ──────────────────────────────────────────────

  describe("generateVCard", () => {
    it("wraps content in BEGIN/END VCARD markers", () => {
      const result = generateVCard({ version: "3.0" } as Parameters<typeof generateVCard>[0]);
      expect(result).toMatch(/^BEGIN:VCARD/);
      expect(result).toContain("END:VCARD");
    });

    it("includes VERSION line", () => {
      const result = generateVCard({ version: "4.0" } as Parameters<typeof generateVCard>[0]);
      expect(result).toContain("VERSION:4.0");
    });

    it("uses CRLF line endings", () => {
      const result = generateVCard({ version: "3.0" } as Parameters<typeof generateVCard>[0]);
      expect(result).toContain("\r\n");
      expect(result).toMatch(/\r\n$/);
    });
  });

  // ── generateCrypto ─────────────────────────────────────────────

  describe("generateCrypto", () => {
    it("generates bitcoin URI", () => {
      const result = generateCrypto({
        type: "bitcoin",
        address: "1abc123def456",
      });
      expect(result).toBe("bitcoin:1abc123def456");
    });

    it("includes amount and label", () => {
      const result = generateCrypto({
        type: "bitcoin",
        address: "1abc",
        amount: 0.5,
        label: "Donation",
      });
      expect(result).toContain("amount=0.5");
      expect(result).toContain("label=Donation");
    });

    it("lowercases scheme", () => {
      const result = generateCrypto({ type: "Ethereum", address: "0xabc" });
      expect(result).toMatch(/^ethereum:/);
    });

    it("omits amount when zero or undefined", () => {
      const result = generateCrypto({ type: "bitcoin", address: "1abc", amount: 0 });
      expect(result).not.toContain("amount");
    });
  });

  // ── generateOTPAuth ────────────────────────────────────────────

  describe("generateOTPAuth", () => {
    it("generates basic TOTP URI", () => {
      const result = generateOTPAuth({ type: "totp", secret: "JBSWY3DPEHPK3PXP" });
      expect(result).toContain("otpauth://totp/");
      expect(result).toContain("secret=JBSWY3DPEHPK3PXP");
    });

    it("generates HOTP URI", () => {
      const result = generateOTPAuth({
        type: "hotp",
        secret: "ABC",
        counter: 5,
      });
      expect(result).toContain("otpauth://hotp/");
      expect(result).toContain("counter=5");
    });

    it("includes issuer in label and params", () => {
      const result = generateOTPAuth({
        type: "totp",
        secret: "ABC",
        issuer: "GitHub",
        account: "user@example.com",
      });
      expect(result).toContain("issuer=GitHub");
      expect(result).toContain("GitHub");
    });

    it("omits default algorithm SHA1", () => {
      const result = generateOTPAuth({ type: "totp", secret: "ABC", algorithm: "SHA1" });
      expect(result).not.toContain("algorithm=");
    });

    it("includes non-default algorithm", () => {
      const result = generateOTPAuth({ type: "totp", secret: "ABC", algorithm: "SHA256" });
      expect(result).toContain("algorithm=SHA256");
    });
  });

  // ── crc16CCITT ─────────────────────────────────────────────────

  describe("crc16CCITT", () => {
    it("computes known CRC for standard test string", () => {
      expect(crc16CCITT("123456789")).toBe("29B1");
    });

    it("returns 4-char hex string", () => {
      const result = crc16CCITT("hello");
      expect(result).toMatch(/^[0-9A-F]{4}$/);
    });

    it("returns consistent results", () => {
      expect(crc16CCITT("test")).toBe(crc16CCITT("test"));
    });
  });

  // ── escapeValue ────────────────────────────────────────────────

  describe("escapeValue", () => {
    it("escapes backslashes", () => {
      expect(escapeValue("a\\b")).toBe("a\\\\b");
    });

    it("escapes semicolons", () => {
      expect(escapeValue("a;b")).toBe("a\\;b");
    });

    it("escapes commas", () => {
      expect(escapeValue("a,b")).toBe("a\\,b");
    });

    it("escapes newlines", () => {
      expect(escapeValue("a\nb")).toBe("a\\nb");
    });

    it("leaves normal text unchanged", () => {
      expect(escapeValue("Hello World")).toBe("Hello World");
    });
  });

  // ── formatICalDate ─────────────────────────────────────────────

  describe("formatICalDate", () => {
    it("formats UTC datetime with Z suffix", () => {
      const result = formatICalDate("2024-06-15T10:30:00Z", true, true);
      expect(result).toMatch(/^\d{8}T\d{6}Z$/);
      expect(result).toContain("20240615");
    });

    it("formats date-only", () => {
      const result = formatICalDate("2024-06-15T10:30:00Z", false, true);
      expect(result).toMatch(/^\d{8}$/);
      expect(result).toContain("20240615");
    });

    it("formats local time without Z suffix", () => {
      const result = formatICalDate("2024-06-15T10:30:00", true, false);
      expect(result).toMatch(/^\d{8}T\d{6}$/);
      expect(result).not.toContain("Z");
    });

    it("returns original string for invalid date", () => {
      expect(formatICalDate("not-a-date")).toBe("not-a-date");
    });

    it("handles date-only without time (local)", () => {
      const result = formatICalDate("2024-01-01T00:00:00", false, false);
      expect(result).toMatch(/^\d{8}$/);
    });
  });

  // ── utf8ByteLength ─────────────────────────────────────────────

  describe("utf8ByteLength", () => {
    it("returns correct length for ASCII", () => {
      expect(utf8ByteLength("hello")).toBe(5);
    });

    it("returns correct length for emoji", () => {
      expect(utf8ByteLength("\u{1F600}")).toBe(4);
    });

    it("returns correct length for multi-byte characters", () => {
      expect(utf8ByteLength("\u00E9")).toBe(2);
    });

    it("returns 0 for empty string", () => {
      expect(utf8ByteLength("")).toBe(0);
    });
  });

  // ── isNonEmpty ─────────────────────────────────────────────────

  describe("isNonEmpty", () => {
    it("returns true for non-empty string", () => {
      expect(isNonEmpty("hello")).toBe(true);
    });

    it("returns false for empty string", () => {
      expect(isNonEmpty("")).toBe(false);
    });

    it("returns false for whitespace-only string", () => {
      expect(isNonEmpty("   ")).toBe(false);
    });
  });

  // ── resolveTipValue ────────────────────────────────────────────

  describe("resolveTipValue", () => {
    it("returns tipFixed for indicator 02", () => {
      expect(
        resolveTipValue({ tipIndicator: "02", tipFixed: 5.0 } as Parameters<
          typeof resolveTipValue
        >[0]),
      ).toBe(5.0);
    });

    it("returns tipPercentage for indicator 03", () => {
      expect(
        resolveTipValue({ tipIndicator: "03", tipPercentage: 10 } as Parameters<
          typeof resolveTipValue
        >[0]),
      ).toBe(10);
    });

    it("returns undefined for no indicator", () => {
      expect(resolveTipValue({} as Parameters<typeof resolveTipValue>[0])).toBeUndefined();
    });
  });

  // ── validateEMVQRCRC ───────────────────────────────────────────

  describe("validateEMVQRCRC", () => {
    it("validates correct CRC", () => {
      const payload = "00020101021126160004test";
      const crc = crc16CCITT(payload);
      expect(validateEMVQRCRC(payload + crc)).toBe(true);
    });

    it("rejects incorrect CRC", () => {
      expect(validateEMVQRCRC("00020101021126160004testAAAA")).toBe(false);
    });

    it("rejects too-short payload", () => {
      expect(validateEMVQRCRC("short")).toBe(false);
    });
  });

  // ── buildEMVAdditionalData ─────────────────────────────────────

  describe("buildEMVAdditionalData", () => {
    it("builds data from all fields", () => {
      const result = buildEMVAdditionalData({
        billNumber: "B123",
        mobileNumber: "+1555",
        storeLabel: "Store1",
      } as Parameters<typeof buildEMVAdditionalData>[0]);
      expect(result.billNumber).toBe("B123");
      expect(result.mobileNumber).toBe("+1555");
      expect(result.storeLabel).toBe("Store1");
    });

    it("omits undefined fields", () => {
      const result = buildEMVAdditionalData({ billNumber: "B123" } as Parameters<
        typeof buildEMVAdditionalData
      >[0]);
      expect(Object.keys(result)).toEqual(["billNumber"]);
    });

    it("returns empty object when no fields set", () => {
      const result = buildEMVAdditionalData({} as Parameters<typeof buildEMVAdditionalData>[0]);
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  // ── formatEmailLine ────────────────────────────────────────────

  describe("formatEmailLine", () => {
    it("formats vCard 4.0 email line", () => {
      expect(formatEmailLine("j@example.com", "4.0")).toBe("EMAIL:j@example.com");
    });

    it("formats vCard 2.1 email line with INTERNET", () => {
      expect(formatEmailLine("j@example.com", "2.1")).toBe("EMAIL;INTERNET:j@example.com");
    });

    it("formats vCard 3.0 email line with TYPE=INTERNET", () => {
      expect(formatEmailLine("j@example.com", "3.0")).toBe("EMAIL;TYPE=INTERNET:j@example.com");
    });
  });

  // ── formatTelLine ──────────────────────────────────────────────

  describe("formatTelLine", () => {
    it("formats vCard 4.0 tel line with TYPE=voice", () => {
      expect(formatTelLine("+1555", "4.0")).toBe("TEL;TYPE=voice:+1555");
    });

    it("formats vCard 2.1 tel line with CELL", () => {
      expect(formatTelLine("+1555", "2.1")).toBe("TEL;CELL:+1555");
    });

    it("formats vCard 3.0 tel line", () => {
      expect(formatTelLine("+1555", "3.0")).toBe("TEL:+1555");
    });
  });
});
