import { describe, it, expect } from "vitest";
import { isNonEmpty } from "./is-non-empty";
import { isValidEmail } from "./is-valid-email";
import { isValidPhone } from "./is-valid-phone";
import { isValidUrl } from "./is-valid-url";
import { isValidUrlWithScheme } from "./is-valid-url-with-scheme";
import { isValidIBAN } from "./is-valid-iban";
import { isValidAmount } from "./is-valid-amount";
import { isValidCountryCode } from "./is-valid-country-code";
import { isValidCurrencyCode } from "./is-valid-currency-code";
import { isValidLatitude } from "./is-valid-latitude";
import { isValidLongitude } from "./is-valid-longitude";
import { isValidSSID } from "./is-valid-ssid";
import { isValidEthereumAddress } from "./is-valid-ethereum-address";
import { isValidCryptoAddress } from "./is-valid-crypto-address";
import { isValidLightningInvoice } from "./is-valid-lightning-invoice";
import { isValidUpiVpa } from "./is-valid-upi-vpa";
import { isValidCashtag } from "./is-valid-cashtag";
import { isValidPayPalUsername } from "./is-valid-pay-pal-username";
import { isValidABN } from "./is-valid-abn";
import { isValidBSB } from "./is-valid-bsb";
import { isValidAccountNumber } from "./is-valid-account-number";
import { isValidBankBin } from "./is-valid-bank-bin";
import { isValidFpsId } from "./is-valid-fps-id";
import { isValidGTIN } from "./is-valid-gtin";
import { isValidMerchantId } from "./is-valid-merchant-id";
import { isValidStoreId } from "./is-valid-store-id";
import { isValidProxyValue } from "./is-valid-proxy-value";
import { crc16CCITT } from "./crc16-ccitt";
import { escapeValue } from "./escape-value";
import { utf8ByteLength } from "./utf8-byte-length";
import { formatICalDate } from "./format-i-cal-date";

describe("domain/payload/validators", () => {
  describe("isNonEmpty", () => {
    it("returns true for non-empty strings", () => {
      expect(isNonEmpty("hello")).toBe(true);
      expect(isNonEmpty("a")).toBe(true);
    });

    it("returns false for empty or whitespace-only strings", () => {
      expect(isNonEmpty("")).toBe(false);
      expect(isNonEmpty("   ")).toBe(false);
      expect(isNonEmpty("\t\n")).toBe(false);
    });
  });

  describe("isValidEmail", () => {
    it("accepts valid emails", () => {
      expect(isValidEmail("a@b")).toBe(true);
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("test+tag@domain.co.uk")).toBe(true);
    });

    it("rejects strings without @", () => {
      expect(isValidEmail("invalid")).toBe(false);
    });

    it("rejects strings shorter than 3 characters", () => {
      expect(isValidEmail("a@")).toBe(false);
      expect(isValidEmail("@b")).toBe(false);
    });
  });

  describe("isValidPhone", () => {
    it("accepts valid phone numbers", () => {
      expect(isValidPhone("+1-555-123-4567")).toBe(true);
      expect(isValidPhone("123")).toBe(true);
      expect(isValidPhone("(02) 1234 5678")).toBe(true);
    });

    it("rejects numbers with fewer than 3 digits", () => {
      expect(isValidPhone("12")).toBe(false);
      expect(isValidPhone("+")).toBe(false);
      expect(isValidPhone("")).toBe(false);
    });
  });

  describe("isValidUrl", () => {
    it("accepts http and https URLs", () => {
      expect(isValidUrl("http://example.com")).toBe(true);
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("HTTP://EXAMPLE.COM")).toBe(true);
    });

    it("rejects non-http URLs", () => {
      expect(isValidUrl("ftp://example.com")).toBe(false);
      expect(isValidUrl("example.com")).toBe(false);
      expect(isValidUrl("")).toBe(false);
    });
  });

  describe("isValidUrlWithScheme", () => {
    it("accepts URLs with any scheme", () => {
      expect(isValidUrlWithScheme("http://example.com")).toBe(true);
      expect(isValidUrlWithScheme("webcal://example.com/feed")).toBe(true);
      expect(isValidUrlWithScheme("myapp://deep/link")).toBe(true);
    });

    it("rejects strings without a scheme", () => {
      expect(isValidUrlWithScheme("example.com")).toBe(false);
      expect(isValidUrlWithScheme("://missing")).toBe(false);
    });
  });

  describe("isValidIBAN", () => {
    it("accepts valid IBAN formats", () => {
      expect(isValidIBAN("DE89370400440532013000")).toBe(true);
      // cspell:disable-next-line
      expect(isValidIBAN("GB29 NWBK 6016 1331 9268 19")).toBe(true);
    });

    it("rejects too short IBANs", () => {
      expect(isValidIBAN("DE12345")).toBe(false);
    });

    it("rejects IBANs that don't start with 2 letters", () => {
      expect(isValidIBAN("1234567890123456")).toBe(false);
    });
  });

  describe("isValidAmount", () => {
    it("accepts empty string (optional)", () => {
      expect(isValidAmount("")).toBe(true);
    });

    it("accepts valid positive numbers", () => {
      expect(isValidAmount("0")).toBe(true);
      expect(isValidAmount("10.50")).toBe(true);
      expect(isValidAmount("1000000")).toBe(true);
    });

    it("rejects negative numbers", () => {
      expect(isValidAmount("-1")).toBe(false);
    });

    it("rejects non-numeric strings", () => {
      expect(isValidAmount("abc")).toBe(false);
    });
  });

  describe("isValidCountryCode", () => {
    it("accepts 2-letter country codes", () => {
      expect(isValidCountryCode("US")).toBe(true);
      expect(isValidCountryCode("au")).toBe(true);
      expect(isValidCountryCode("GB")).toBe(true);
    });

    it("rejects codes that aren't 2 letters", () => {
      expect(isValidCountryCode("USA")).toBe(false);
      expect(isValidCountryCode("U")).toBe(false);
      expect(isValidCountryCode("12")).toBe(false);
    });
  });

  describe("isValidCurrencyCode", () => {
    it("accepts 3-digit ISO 4217 codes", () => {
      expect(isValidCurrencyCode("840")).toBe(true);
      expect(isValidCurrencyCode("036")).toBe(true);
    });

    it("rejects non-3-digit codes", () => {
      expect(isValidCurrencyCode("USD")).toBe(false);
      expect(isValidCurrencyCode("12")).toBe(false);
      expect(isValidCurrencyCode("1234")).toBe(false);
    });
  });

  describe("isValidLatitude", () => {
    it("accepts latitudes in [-90, 90]", () => {
      expect(isValidLatitude(0)).toBe(true);
      expect(isValidLatitude(90)).toBe(true);
      expect(isValidLatitude(-90)).toBe(true);
      expect(isValidLatitude(45.5)).toBe(true);
    });

    it("rejects latitudes outside [-90, 90]", () => {
      expect(isValidLatitude(91)).toBe(false);
      expect(isValidLatitude(-91)).toBe(false);
    });

    it("rejects NaN", () => {
      expect(isValidLatitude(NaN)).toBe(false);
    });
  });

  describe("isValidLongitude", () => {
    it("accepts longitudes in [-180, 180]", () => {
      expect(isValidLongitude(0)).toBe(true);
      expect(isValidLongitude(180)).toBe(true);
      expect(isValidLongitude(-180)).toBe(true);
      expect(isValidLongitude(151.2093)).toBe(true);
    });

    it("rejects longitudes outside [-180, 180]", () => {
      expect(isValidLongitude(181)).toBe(false);
      expect(isValidLongitude(-181)).toBe(false);
    });

    it("rejects NaN", () => {
      expect(isValidLongitude(NaN)).toBe(false);
    });
  });

  describe("isValidSSID", () => {
    it("accepts SSIDs 1-32 characters", () => {
      expect(isValidSSID("a")).toBe(true);
      expect(isValidSSID("My WiFi Network")).toBe(true);
      expect(isValidSSID("a".repeat(32))).toBe(true);
    });

    it("rejects empty strings", () => {
      expect(isValidSSID("")).toBe(false);
    });

    it("rejects SSIDs longer than 32 characters", () => {
      expect(isValidSSID("a".repeat(33))).toBe(false);
    });
  });

  describe("isValidEthereumAddress", () => {
    it("accepts valid Ethereum addresses", () => {
      expect(isValidEthereumAddress("0x" + "a".repeat(40))).toBe(true);
      expect(isValidEthereumAddress("0x" + "1234567890abcdefABCD".repeat(2))).toBe(true);
    });

    it("rejects addresses without 0x prefix", () => {
      expect(isValidEthereumAddress("a".repeat(40))).toBe(false);
    });

    it("rejects addresses with wrong length", () => {
      expect(isValidEthereumAddress("0x" + "a".repeat(39))).toBe(false);
      expect(isValidEthereumAddress("0x" + "a".repeat(41))).toBe(false);
    });
  });

  describe("isValidCryptoAddress", () => {
    it("validates Bitcoin legacy addresses", () => {
      // cspell:disable-next-line
      expect(isValidCryptoAddress("1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2", "bitcoin")).toBe(true);
    });

    it("validates Bitcoin bech32 addresses", () => {
      // cspell:disable-next-line
      expect(isValidCryptoAddress("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4", "bitcoin")).toBe(
        true,
      );
    });

    it("validates Ethereum addresses", () => {
      expect(isValidCryptoAddress("0x" + "a".repeat(40), "ethereum")).toBe(true);
    });

    it("validates Litecoin addresses", () => {
      expect(isValidCryptoAddress("L" + "a".repeat(33), "litecoin")).toBe(true);
    });

    it("uses generic validation for unknown types", () => {
      expect(isValidCryptoAddress("a".repeat(20), "unknown")).toBe(true);
      expect(isValidCryptoAddress("short", "unknown")).toBe(false);
    });

    it("rejects empty or very short addresses", () => {
      expect(isValidCryptoAddress("", "bitcoin")).toBe(false);
      expect(isValidCryptoAddress("abc", "bitcoin")).toBe(false);
    });
  });

  describe("isValidLightningInvoice", () => {
    it("accepts mainnet invoices (lnbc)", () => {
      // cspell:disable-next-line
      expect(isValidLightningInvoice("lnbc1pvjluezpp5qqqsyq")).toBe(true);
    });

    it("accepts testnet invoices (lntb)", () => {
      // cspell:disable-next-line
      expect(isValidLightningInvoice("lntb1pvjluezpp5qqqsyq")).toBe(true);
    });

    // cspell:disable-next-line
    it("accepts regtest invoices (lnbcrt)", () => {
      // cspell:disable-next-line
      expect(isValidLightningInvoice("lnbcrt1pvjluezpp5qqqsyq")).toBe(true);
    });

    it("rejects non-lightning strings", () => {
      expect(isValidLightningInvoice("not_an_invoice")).toBe(false);
      expect(isValidLightningInvoice("")).toBe(false);
    });
  });

  describe("isValidUpiVpa", () => {
    it("accepts valid VPA format", () => {
      expect(isValidUpiVpa("user@bank")).toBe(true);
      // cspell:disable-next-line
      expect(isValidUpiVpa("john.doe@examplebank")).toBe(true);
      expect(isValidUpiVpa("test-123@upi")).toBe(true);
    });

    it("rejects VPA without @", () => {
      expect(isValidUpiVpa("invalid")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(isValidUpiVpa("")).toBe(false);
    });
  });

  describe("isValidCashtag", () => {
    it("accepts valid cash tags", () => {
      expect(isValidCashtag("$JohnDoe")).toBe(true);
      expect(isValidCashtag("Cash123")).toBe(true);
      expect(isValidCashtag("A")).toBe(true);
    });

    it("strips $ prefix before validation", () => {
      expect(isValidCashtag("$Test")).toBe(true);
    });

    it("rejects tags starting with a digit", () => {
      expect(isValidCashtag("123abc")).toBe(false);
    });

    it("rejects tags longer than 20 characters", () => {
      expect(isValidCashtag("A" + "b".repeat(20))).toBe(false);
    });
  });

  describe("isValidPayPalUsername", () => {
    it("accepts 4-20 alphanumeric characters", () => {
      expect(isValidPayPalUsername("John")).toBe(true);
      expect(isValidPayPalUsername("test1234")).toBe(true);
      expect(isValidPayPalUsername("a".repeat(20))).toBe(true);
    });

    it("rejects usernames shorter than 4 characters", () => {
      expect(isValidPayPalUsername("abc")).toBe(false);
    });

    it("rejects usernames longer than 20 characters", () => {
      expect(isValidPayPalUsername("a".repeat(21))).toBe(false);
    });

    it("rejects special characters", () => {
      expect(isValidPayPalUsername("user@name")).toBe(false);
      expect(isValidPayPalUsername("user-name")).toBe(false);
    });
  });

  describe("isValidABN", () => {
    it("accepts 11-digit ABNs", () => {
      expect(isValidABN("12345678901")).toBe(true);
      expect(isValidABN("123 456 789 01")).toBe(true);
      expect(isValidABN("12-345-678-901")).toBe(true);
    });

    it("rejects ABNs that aren't 11 digits", () => {
      expect(isValidABN("1234567890")).toBe(false);
      expect(isValidABN("123456789012")).toBe(false);
    });
  });

  describe("isValidBSB", () => {
    it("accepts 6-digit BSBs", () => {
      expect(isValidBSB("123456")).toBe(true);
      expect(isValidBSB("123-456")).toBe(true);
    });

    it("rejects BSBs that aren't 6 digits", () => {
      expect(isValidBSB("12345")).toBe(false);
      expect(isValidBSB("1234567")).toBe(false);
    });
  });

  describe("isValidAccountNumber", () => {
    it("accepts account numbers with at least 4 digits", () => {
      expect(isValidAccountNumber("1234")).toBe(true);
      expect(isValidAccountNumber("1234567890")).toBe(true);
    });

    it("rejects account numbers with fewer than 4 digits", () => {
      expect(isValidAccountNumber("123")).toBe(false);
      expect(isValidAccountNumber("")).toBe(false);
    });
  });

  describe("isValidBankBin", () => {
    it("accepts 6-8 digit BINs", () => {
      expect(isValidBankBin("123456")).toBe(true);
      expect(isValidBankBin("12345678")).toBe(true);
    });

    it("rejects BINs outside 6-8 digit range", () => {
      expect(isValidBankBin("12345")).toBe(false);
      expect(isValidBankBin("123456789")).toBe(false);
    });
  });

  describe("isValidFpsId", () => {
    it("accepts 7-9 digit FPS IDs", () => {
      expect(isValidFpsId("1234567")).toBe(true);
      expect(isValidFpsId("123456789")).toBe(true);
    });

    it("rejects FPS IDs outside 7-9 digit range", () => {
      expect(isValidFpsId("123456")).toBe(false);
      expect(isValidFpsId("1234567890")).toBe(false);
    });
  });

  describe("isValidGTIN", () => {
    it("accepts 8-digit GTINs (GTIN-8)", () => {
      expect(isValidGTIN("12345678")).toBe(true);
    });

    it("accepts 12-digit GTINs (UPC-A)", () => {
      expect(isValidGTIN("123456789012")).toBe(true);
    });

    it("accepts 13-digit GTINs (EAN-13)", () => {
      expect(isValidGTIN("1234567890123")).toBe(true);
    });

    it("accepts 14-digit GTINs (GTIN-14)", () => {
      expect(isValidGTIN("12345678901234")).toBe(true);
    });

    it("rejects invalid lengths", () => {
      expect(isValidGTIN("123456789")).toBe(false);
      expect(isValidGTIN("12345678901")).toBe(false);
      expect(isValidGTIN("123456789012345")).toBe(false);
    });
  });

  describe("isValidMerchantId", () => {
    it("accepts non-empty merchant IDs", () => {
      expect(isValidMerchantId("ABC123")).toBe(true);
      expect(isValidMerchantId("x")).toBe(true);
    });

    it("rejects empty or whitespace-only IDs", () => {
      expect(isValidMerchantId("")).toBe(false);
      expect(isValidMerchantId("   ")).toBe(false);
    });
  });

  describe("isValidStoreId", () => {
    it("accepts non-empty store IDs", () => {
      expect(isValidStoreId("STORE-001")).toBe(true);
      expect(isValidStoreId("x")).toBe(true);
    });

    it("rejects empty or whitespace-only IDs", () => {
      expect(isValidStoreId("")).toBe(false);
      expect(isValidStoreId("   ")).toBe(false);
    });
  });

  describe("isValidProxyValue", () => {
    it("validates MOBILE proxy as phone number", () => {
      expect(isValidProxyValue("+60123456789", "MOBILE")).toBe(true);
      expect(isValidProxyValue("12", "MOBILE")).toBe(false);
    });

    it("validates NRIC as 12 digits", () => {
      expect(isValidProxyValue("123456789012", "NRIC")).toBe(true);
      expect(isValidProxyValue("123456-78-9012", "NRIC")).toBe(true);
      expect(isValidProxyValue("12345", "NRIC")).toBe(false);
    });

    it("accepts any non-empty string for other proxy types", () => {
      expect(isValidProxyValue("ABC123", "PASSPORT")).toBe(true);
      expect(isValidProxyValue("xyz", "ARMY")).toBe(true);
      expect(isValidProxyValue("biz", "BUSINESS")).toBe(true);
    });

    it("rejects empty or whitespace-only values", () => {
      expect(isValidProxyValue("", "MOBILE")).toBe(false);
      expect(isValidProxyValue("   ", "PASSPORT")).toBe(false);
    });
  });
});

describe("domain/payload/utilities", () => {
  describe("crc16CCITT", () => {
    it("returns a 4-character uppercase hex string", () => {
      const result = crc16CCITT("test");
      expect(result).toMatch(/^[0-9A-F]{4}$/);
    });

    it("returns FFFF for empty string", () => {
      expect(crc16CCITT("")).toBe("FFFF");
    });

    it("computes known test vector for '123456789'", () => {
      expect(crc16CCITT("123456789")).toBe("29B1");
    });

    it("is deterministic", () => {
      expect(crc16CCITT("hello")).toBe(crc16CCITT("hello"));
    });

    it("produces different CRCs for different inputs", () => {
      const a = crc16CCITT("abc");
      const b = crc16CCITT("def");
      expect(a).not.toBe(b);
    });
  });

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

    it("leaves plain text unchanged", () => {
      expect(escapeValue("hello world")).toBe("hello world");
    });

    it("handles multiple special characters", () => {
      expect(escapeValue("a;b,c\nd")).toBe("a\\;b\\,c\\nd");
    });

    it("returns empty string for empty input", () => {
      expect(escapeValue("")).toBe("");
    });
  });

  describe("utf8ByteLength", () => {
    it("returns length for ASCII strings", () => {
      expect(utf8ByteLength("hello")).toBe(5);
      expect(utf8ByteLength("")).toBe(0);
    });

    it("counts multi-byte characters correctly", () => {
      expect(utf8ByteLength("\u00e9")).toBe(2);
      expect(utf8ByteLength("\u4e16")).toBe(3);
    });

    it("counts emoji as 4 bytes", () => {
      expect(utf8ByteLength("\ud83d\ude00")).toBe(4);
    });

    it("handles mixed ASCII and multi-byte", () => {
      expect(utf8ByteLength("a\u00e9b")).toBe(4);
    });
  });

  describe("formatICalDate", () => {
    it("formats UTC datetime with Z suffix", () => {
      expect(formatICalDate("2024-01-15T12:30:00Z", true, true)).toBe("20240115T123000Z");
    });

    it("formats date-only in UTC mode", () => {
      expect(formatICalDate("2024-01-15T12:30:00Z", false, true)).toBe("20240115");
    });

    it("formats local datetime without Z suffix when useUtc is false", () => {
      const result = formatICalDate("2024-06-15T10:00:00Z", true, false);
      expect(result).toMatch(/^\d{8}T\d{6}$/);
      expect(result).not.toContain("Z");
    });

    it("formats date-only in local mode", () => {
      const result = formatICalDate("2024-06-15T10:00:00Z", false, false);
      expect(result).toMatch(/^\d{8}$/);
    });

    it("returns original string for invalid dates", () => {
      expect(formatICalDate("not-a-date")).toBe("not-a-date");
      expect(formatICalDate("invalid")).toBe("invalid");
    });

    it("defaults to includeTime=true and useUtc=true", () => {
      const result = formatICalDate("2024-01-15T00:00:00Z");
      expect(result).toBe("20240115T000000Z");
    });

    it("pads single-digit months and days with zeros", () => {
      expect(formatICalDate("2024-03-05T09:05:03Z", true, true)).toBe("20240305T090503Z");
    });
  });
});
