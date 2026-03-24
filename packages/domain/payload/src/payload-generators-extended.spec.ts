import { describe, it, expect } from "vitest";
import { generateCalendarSubscription } from "./generate-calendar-subscription";
import { generateSocialProfile } from "./generate-social-profile";
import { generateMessagingLink } from "./generate-messaging-link";
import { generateAppDeepLink } from "./generate-app-deep-link";
import { generateBizCard } from "./generate-biz-card";
import { generateEPCSepa } from "./generate-epc-sepa";
import { generateCashApp } from "./generate-cash-app";
import { generatePayPalMe } from "./generate-pay-pal-me";
import { generateLightning } from "./generate-lightning";
import { generateEthereumEIP681 } from "./generate-ethereum-eip681";
import { buildPlainEthURI } from "./build-plain-eth-uri";
import { buildTokenTransferURI } from "./build-token-transfer-uri";
import { appendGasParams } from "./append-gas-params";
import { generateUPI } from "./generate-upi";
import { generateSwissQRBill } from "./generate-swiss-qr-bill";
import { generateEvent } from "./generate-event";
import { appendVCardName } from "./append-v-card-name";
import { appendVCardOptionalFields } from "./append-v-card-optional-fields";
import { appendValidEmailLines } from "./append-valid-email-lines";
import { appendValidTelLines } from "./append-valid-tel-lines";
import type { VCardHelper } from "./payload-generators/types";

describe("domain/payload generators (extended)", () => {
  // ── generateCalendarSubscription ─────────────────────────────

  describe("generateCalendarSubscription", () => {
    it("converts http:// to webcal://", () => {
      expect(generateCalendarSubscription("http://example.com/cal.ics")).toBe(
        "webcal://example.com/cal.ics",
      );
    });

    it("converts https:// to webcal://", () => {
      expect(generateCalendarSubscription("https://example.com/cal.ics")).toBe(
        "webcal://example.com/cal.ics",
      );
    });

    it("prepends webcal:// when no scheme present", () => {
      expect(generateCalendarSubscription("example.com/cal.ics")).toBe(
        "webcal://example.com/cal.ics",
      );
    });
  });

  // ── generateSocialProfile ───────────────────────────────────

  describe("generateSocialProfile", () => {
    it("generates twitter URL", () => {
      expect(generateSocialProfile("twitter", "john")).toBe("https://twitter.com/john");
    });

    it("generates x URL", () => {
      expect(generateSocialProfile("x", "john")).toBe("https://x.com/john");
    });

    it("generates instagram URL", () => {
      expect(generateSocialProfile("instagram", "john")).toBe("https://instagram.com/john");
    });

    it("generates linkedin URL", () => {
      expect(generateSocialProfile("linkedin", "john")).toBe("https://linkedin.com/in/john");
    });

    it("generates github URL", () => {
      expect(generateSocialProfile("github", "john")).toBe("https://github.com/john");
    });

    it("generates youtube URL with @ prefix", () => {
      expect(generateSocialProfile("youtube", "john")).toBe("https://youtube.com/@john");
    });

    it("generates tiktok URL with @ prefix", () => {
      expect(generateSocialProfile("tiktok", "john")).toBe("https://tiktok.com/@john");
    });

    it("generates snapchat URL", () => {
      expect(generateSocialProfile("snapchat", "john")).toBe("https://snapchat.com/add/john");
    });

    it("generates reddit URL", () => {
      expect(generateSocialProfile("reddit", "john")).toBe("https://reddit.com/u/john");
    });

    it("generates twitch URL", () => {
      expect(generateSocialProfile("twitch", "john")).toBe("https://twitch.tv/john");
    });

    it("is case-insensitive", () => {
      expect(generateSocialProfile("Twitter", "john")).toBe("https://twitter.com/john");
    });

    it("falls back to generic URL for unknown platforms", () => {
      expect(generateSocialProfile("mastodon", "john")).toBe("https://mastodon.com/john");
    });
  });

  // ── generateMessagingLink ───────────────────────────────────

  describe("generateMessagingLink", () => {
    it("generates WhatsApp link with stripped non-digits", () => {
      expect(generateMessagingLink("whatsapp", "+1-555-123-4567")).toBe(
        "https://wa.me/15551234567",
      );
    });

    it("generates WhatsApp link with message", () => {
      const result = generateMessagingLink("whatsapp", "15551234567", "Hello!");
      expect(result).toContain("https://wa.me/15551234567?");
      expect(result).toContain("text=Hello!");
    });

    it("generates Telegram link", () => {
      expect(generateMessagingLink("telegram", "john")).toBe("https://t.me/john");
    });

    it("generates Telegram link with message", () => {
      const result = generateMessagingLink("telegram", "john", "Hi");
      expect(result).toContain("https://t.me/john?");
      expect(result).toContain("text=Hi");
    });

    it("generates Signal link", () => {
      expect(generateMessagingLink("signal", "+15551234567")).toBe(
        "https://signal.me/#p/+15551234567",
      );
    });

    it("generates Viber link with stripped non-digits", () => {
      expect(generateMessagingLink("viber", "+1-555-1234567")).toBe(
        "viber://chat?number=15551234567",
      );
    });

    it("generates Line link", () => {
      expect(generateMessagingLink("line", "john")).toBe("https://line.me/ti/p/john");
    });

    it("generates Skype link", () => {
      expect(generateMessagingLink("skype", "john.doe")).toBe("skype:john.doe?chat");
    });

    it("is case-insensitive", () => {
      expect(generateMessagingLink("WhatsApp", "15551234567")).toBe("https://wa.me/15551234567");
    });

    it("returns identifier as-is for unknown platform", () => {
      expect(generateMessagingLink("unknown", "john")).toBe("john");
    });
  });

  // ── generateAppDeepLink ────────────────────────────────────

  describe("generateAppDeepLink", () => {
    it("generates Android intent URI with package", () => {
      const result = generateAppDeepLink("android", {
        scheme: "myapp",
        host: "example.com",
        path: "/page",
        package: "com.example.app",
      });
      expect(result).toContain("intent://example.com/page#Intent;");
      expect(result).toContain("scheme=myapp;");
      expect(result).toContain("package=com.example.app;");
      expect(result).toContain("end");
    });

    it("includes fallback URL in Android intent", () => {
      const result = generateAppDeepLink("android", {
        host: "example.com",
        package: "com.example.app",
        fallbackUrl: "https://example.com",
      });
      expect(result).toContain("S.browser_fallback_url=");
    });

    it("generates iOS scheme link", () => {
      const result = generateAppDeepLink("ios", {
        scheme: "myapp",
        host: "example.com",
        path: "/page",
      });
      expect(result).toBe("myapp://example.com/page");
    });

    it("falls back to https when no scheme", () => {
      const result = generateAppDeepLink("universal", {
        host: "example.com",
        path: "/page",
      });
      expect(result).toBe("https://example.com/page");
    });

    it("handles missing host and path", () => {
      const result = generateAppDeepLink("ios", { scheme: "myapp" });
      expect(result).toBe("myapp://");
    });
  });

  // ── generateBizCard ────────────────────────────────────────

  describe("generateBizCard", () => {
    it("generates minimal BizCard", () => {
      const result = generateBizCard({ firstName: "John" });
      expect(result).toContain("BIZCARD:");
      expect(result).toContain("N:John");
    });

    it("generates full BizCard with all fields", () => {
      const result = generateBizCard({
        firstName: "John",
        lastName: "Doe",
        title: "Engineer",
        company: "ACME",
        phone: "+15551234567",
        email: "john@example.com",
        address: "123 Main St",
      });
      expect(result).toContain("N:John");
      expect(result).toContain("X:Doe");
      expect(result).toContain("T:Engineer");
      expect(result).toContain("C:ACME");
      expect(result).toContain("B:+15551234567");
      expect(result).toContain("E:john@example.com");
      expect(result).toContain("A:123 Main St");
    });

    it("omits undefined fields", () => {
      const result = generateBizCard({ firstName: "John", email: "j@e.com" });
      expect(result).not.toContain("X:");
      expect(result).not.toContain("T:");
      expect(result).not.toContain("C:");
      expect(result).toContain("N:John");
      expect(result).toContain("E:j@e.com");
    });
  });

  // ── generateEPCSepa ────────────────────────────────────────

  describe("generateEPCSepa", () => {
    it("generates minimal EPC/SEPA code", () => {
      const result = generateEPCSepa({
        name: "John Doe",
        iban: "DE89 3704 0044 0532 0130 00",
      });
      const lines = result.split("\n");
      expect(lines[0]).toBe("BCD");
      expect(lines[1]).toBe("002");
      expect(lines[2]).toBe("1");
      expect(lines[3]).toBe("SCT");
      expect(lines[4]).toBe("");
      expect(lines[5]).toBe("John Doe");
      expect(lines[6]).toBe("DE89370400440532013000");
    });

    it("includes BIC when provided", () => {
      const result = generateEPCSepa({
        name: "Jane",
        iban: "DE89370400440532013000",
        bic: "COBADEFFXXX",
      });
      expect(result).toContain("COBADEFFXXX");
    });

    it("includes amount when positive", () => {
      const result = generateEPCSepa({
        name: "Jane",
        iban: "DE89370400440532013000",
        amount: 42.5,
      });
      expect(result).toContain("EUR42.50");
    });

    it("omits amount when zero", () => {
      const result = generateEPCSepa({
        name: "Jane",
        iban: "DE89370400440532013000",
        amount: 0,
      });
      const lines = result.split("\n");
      expect(lines[7]).toBe("");
    });

    it("includes reference and text", () => {
      const result = generateEPCSepa({
        name: "Jane",
        iban: "DE89370400440532013000",
        reference: "INV-001",
        text: "Payment for services",
      });
      expect(result).toContain("INV-001");
      expect(result).toContain("Payment for services");
    });
  });

  // ── generateCashApp ────────────────────────────────────────

  describe("generateCashApp", () => {
    it("generates basic Cash App link", () => {
      expect(generateCashApp({ cashtag: "john" })).toBe("https://cash.app/$john");
    });

    it("strips leading $ from cashtag", () => {
      expect(generateCashApp({ cashtag: "$john" })).toBe("https://cash.app/$john");
    });

    it("includes amount when positive", () => {
      expect(generateCashApp({ cashtag: "john", amount: 25 })).toBe("https://cash.app/$john/25.00");
    });

    it("omits amount when zero", () => {
      expect(generateCashApp({ cashtag: "john", amount: 0 })).toBe("https://cash.app/$john");
    });
  });

  // ── generatePayPalMe ───────────────────────────────────────

  describe("generatePayPalMe", () => {
    it("generates basic PayPal.Me link", () => {
      expect(generatePayPalMe({ username: "john" })).toBe("https://paypal.me/john");
    });

    it("includes amount when positive", () => {
      expect(generatePayPalMe({ username: "john", amount: 10.5 })).toBe(
        "https://paypal.me/john/10.50",
      );
    });

    it("includes currency code with amount", () => {
      expect(generatePayPalMe({ username: "john", amount: 10, currencyCode: "eur" })).toBe(
        "https://paypal.me/john/10.00EUR",
      );
    });

    it("omits amount when zero", () => {
      expect(generatePayPalMe({ username: "john", amount: 0 })).toBe("https://paypal.me/john");
    });
  });

  // ── generateLightning ──────────────────────────────────────

  describe("generateLightning", () => {
    it("wraps invoice in lightning: scheme", () => {
      expect(generateLightning({ invoice: "lnbc1abc123" })).toBe("lightning:lnbc1abc123");
    });

    it("lowercases the invoice", () => {
      expect(generateLightning({ invoice: "LNBC1ABC123" })).toBe("lightning:lnbc1abc123");
    });

    it("strips existing lightning: prefix", () => {
      expect(generateLightning({ invoice: "lightning:lnbc1abc123" })).toBe("lightning:lnbc1abc123");
    });
  });

  // ── appendGasParams ────────────────────────────────────────

  describe("appendGasParams", () => {
    it("appends gas to URLSearchParams", () => {
      const params = new URLSearchParams();
      appendGasParams(params, { targetAddress: "0x1", gas: 21000 });
      expect(params.get("gas")).toBe("21000");
    });

    it("appends gasLimit to URLSearchParams", () => {
      const params = new URLSearchParams();
      appendGasParams(params, { targetAddress: "0x1", gasLimit: 50000 });
      expect(params.get("gasLimit")).toBe("50000");
    });

    it("appends gasPrice to URLSearchParams", () => {
      const params = new URLSearchParams();
      appendGasParams(params, { targetAddress: "0x1", gasPrice: "20000000000" });
      expect(params.get("gasPrice")).toBe("20000000000");
    });

    it("does nothing when no gas params", () => {
      const params = new URLSearchParams();
      appendGasParams(params, { targetAddress: "0x1" });
      expect(params.toString()).toBe("");
    });
  });

  // ── buildPlainEthURI ───────────────────────────────────────

  describe("buildPlainEthURI", () => {
    it("builds minimal ethereum URI", () => {
      expect(buildPlainEthURI({ targetAddress: "0xabc" })).toBe("ethereum:0xabc");
    });

    it("includes chainId when not 1", () => {
      expect(buildPlainEthURI({ targetAddress: "0xabc", chainId: 137 })).toBe("ethereum:0xabc@137");
    });

    it("omits chainId when 1 (mainnet)", () => {
      expect(buildPlainEthURI({ targetAddress: "0xabc", chainId: 1 })).toBe("ethereum:0xabc");
    });

    it("includes value as query param", () => {
      const result = buildPlainEthURI({ targetAddress: "0xabc", value: "1000000" });
      expect(result).toContain("?value=1000000");
    });

    it("includes function name", () => {
      const result = buildPlainEthURI({
        targetAddress: "0xabc",
        functionName: "transfer",
      });
      expect(result).toContain("ethereum:0xabc/transfer");
    });

    it("includes function params", () => {
      const result = buildPlainEthURI({
        targetAddress: "0xabc",
        functionParams: { foo: "bar" },
      });
      expect(result).toContain("foo=bar");
    });
  });

  // ── buildTokenTransferURI ──────────────────────────────────

  describe("buildTokenTransferURI", () => {
    it("builds token transfer URI with address", () => {
      const result = buildTokenTransferURI({
        targetAddress: "0xdead",
        tokenAddress: "0xbeef",
      });
      expect(result).toContain("ethereum:0xbeef/transfer");
      expect(result).toContain("address=0xdead");
    });

    it("includes chainId when not 1", () => {
      const result = buildTokenTransferURI({
        targetAddress: "0xdead",
        tokenAddress: "0xbeef",
        chainId: 56,
      });
      expect(result).toContain("ethereum:0xbeef@56/transfer");
    });

    it("includes tokenValue as uint256", () => {
      const result = buildTokenTransferURI({
        targetAddress: "0xdead",
        tokenAddress: "0xbeef",
        tokenValue: "1000000",
      });
      expect(result).toContain("uint256=1000000");
    });
  });

  // ── generateEthereumEIP681 ─────────────────────────────────

  describe("generateEthereumEIP681", () => {
    it("delegates to buildPlainEthURI without tokenAddress", () => {
      const result = generateEthereumEIP681({ targetAddress: "0xabc" });
      expect(result).toBe("ethereum:0xabc");
    });

    it("delegates to buildTokenTransferURI with tokenAddress", () => {
      const result = generateEthereumEIP681({
        targetAddress: "0xdead",
        tokenAddress: "0xbeef",
      });
      expect(result).toContain("/transfer");
      expect(result).toContain("address=0xdead");
    });
  });

  // ── generateUPI ────────────────────────────────────────────

  describe("generateUPI", () => {
    it("generates minimal UPI URI", () => {
      const result = generateUPI({ pa: "user@upi" });
      expect(result).toContain("upi://pay?");
      expect(result).toContain("pa=user%40upi");
      expect(result).toContain("cu=INR");
    });

    it("includes payee name", () => {
      const result = generateUPI({ pa: "user@upi", pn: "John" });
      expect(result).toContain("pn=John");
    });

    it("includes amount when positive", () => {
      const result = generateUPI({ pa: "user@upi", am: 100 });
      expect(result).toContain("am=100.00");
    });

    it("omits amount when zero", () => {
      const result = generateUPI({ pa: "user@upi", am: 0 });
      expect(result).not.toContain("am=");
    });

    it("uses custom currency", () => {
      const result = generateUPI({ pa: "user@upi", cu: "USD" });
      expect(result).toContain("cu=USD");
    });

    it("includes transaction note truncated to 50 chars", () => {
      const longNote = "A".repeat(60);
      const result = generateUPI({ pa: "user@upi", tn: longNote });
      expect(result).toContain(`tn=${"A".repeat(50)}`);
    });
  });

  // ── generateSwissQRBill ────────────────────────────────────

  describe("generateSwissQRBill", () => {
    it("generates minimal Swiss QR-bill", () => {
      const result = generateSwissQRBill({
        creditorIBAN: "CH93 0076 2011 6238 5295 7",
        creditorAddressType: "S" as const,
        creditorName: "John Doe",
        creditorCountry: "ch",
        currency: "CHF" as const,
        referenceType: "NON" as const,
      });
      const lines = result.split("\n");
      expect(lines[0]).toBe("SPC");
      expect(lines[1]).toBe("0200");
      expect(lines[2]).toBe("1");
      expect(lines[3]).toBe("CH9300762011623852957");
      expect(lines[4]).toBe("S");
      expect(lines[5]).toBe("John Doe");
    });

    it("upper-cases country code", () => {
      const result = generateSwissQRBill({
        creditorIBAN: "CH9300762011623852957",
        creditorAddressType: "S" as const,
        creditorName: "Jane",
        creditorCountry: "ch",
        currency: "CHF" as const,
        referenceType: "NON" as const,
      });
      expect(result).toContain("\nCH\n");
    });

    it("includes amount when positive", () => {
      const result = generateSwissQRBill({
        creditorIBAN: "CH9300762011623852957",
        creditorAddressType: "S" as const,
        creditorName: "Jane",
        creditorCountry: "CH",
        currency: "CHF" as const,
        referenceType: "NON" as const,
        amount: 199.95,
      });
      expect(result).toContain("199.95");
    });

    it("uses EPD trailer by default", () => {
      const result = generateSwissQRBill({
        creditorIBAN: "CH9300762011623852957",
        creditorAddressType: "S" as const,
        creditorName: "Jane",
        creditorCountry: "CH",
        currency: "CHF" as const,
        referenceType: "NON" as const,
      });
      expect(result).toContain("EPD");
    });

    it("includes custom version", () => {
      const result = generateSwissQRBill({
        version: "0201" as const,
        creditorIBAN: "CH9300762011623852957",
        creditorAddressType: "S" as const,
        creditorName: "Jane",
        creditorCountry: "CH",
        currency: "CHF" as const,
        referenceType: "NON" as const,
      });
      const lines = result.split("\n");
      expect(lines[1]).toBe("0201");
    });
  });

  // ── generateEvent ──────────────────────────────────────────

  describe("generateEvent", () => {
    it("generates valid iCalendar structure", () => {
      const result = generateEvent({ summary: "Meeting" });
      expect(result).toContain("BEGIN:VCALENDAR");
      expect(result).toContain("VERSION:2.0");
      expect(result).toContain("BEGIN:VEVENT");
      expect(result).toContain("END:VEVENT");
      expect(result).toContain("END:VCALENDAR");
    });

    it("includes summary", () => {
      const result = generateEvent({ summary: "Team standup" });
      expect(result).toContain("SUMMARY:Team standup");
    });

    it("truncates long summary to 50 chars", () => {
      const longSummary = "A".repeat(60);
      const result = generateEvent({ summary: longSummary });
      expect(result).toContain(`SUMMARY:${"A".repeat(47)}...`);
    });

    it("includes location", () => {
      const result = generateEvent({ location: "Room 42" });
      expect(result).toContain("LOCATION:Room 42");
    });

    it("includes description", () => {
      const result = generateEvent({ description: "Discuss Q4 plans" });
      expect(result).toContain("DESCRIPTION:Discuss Q4 plans");
    });

    it("includes start and end dates", () => {
      const result = generateEvent({
        start: "2025-06-15T10:00:00Z",
        end: "2025-06-15T11:00:00Z",
      });
      expect(result).toContain("DTSTART:");
      expect(result).toContain("DTEND:");
    });

    it("includes RRULE when provided", () => {
      const result = generateEvent({ rrule: "FREQ=WEEKLY;COUNT=10" });
      expect(result).toContain("RRULE:FREQ=WEEKLY;COUNT=10");
    });

    it("uses CRLF line endings", () => {
      const result = generateEvent({ summary: "Test" });
      expect(result).toContain("\r\n");
    });

    it("generates UID and DTSTAMP", () => {
      const result = generateEvent({});
      expect(result).toContain("UID:");
      expect(result).toContain("DTSTAMP:");
    });
  });

  // ── appendVCardName ────────────────────────────────────────

  describe("appendVCardName", () => {
    it("appends N and FN when fn has two parts", () => {
      const lines: string[] = [];
      appendVCardName(lines, { fn: "John Doe", version: "3.0" } as VCardHelper);
      expect(lines).toContain("FN:John Doe");
      expect(lines.some((l) => l.startsWith("N:"))).toBe(true);
    });

    it("appends N with single-name fn in Given Name position", () => {
      const lines: string[] = [];
      appendVCardName(lines, { fn: "John", version: "3.0" } as VCardHelper);
      expect(lines.some((l) => l === "N:;John;;;")).toBe(true);
    });

    it("uses explicit n field when provided", () => {
      const lines: string[] = [];
      appendVCardName(lines, {
        n: "Doe;John;;;",
        fn: "John Doe",
        version: "3.0",
      } as VCardHelper);
      expect(lines.some((l) => l === "N:Doe\\;John\\;\\;\\;")).toBe(true);
    });

    it("does nothing when neither n nor fn", () => {
      const lines: string[] = [];
      appendVCardName(lines, { version: "3.0" } as VCardHelper);
      expect(lines.length).toBe(0);
    });
  });

  // ── appendVCardOptionalFields ──────────────────────────────

  describe("appendVCardOptionalFields", () => {
    it("appends address lines", () => {
      const lines: string[] = [];
      appendVCardOptionalFields(lines, {
        adr: [";;123 Main St;City;State;12345;US"],
        version: "3.0",
      } as VCardHelper);
      expect(lines.some((l) => l.startsWith("ADR:"))).toBe(true);
    });

    it("appends birthday", () => {
      const lines: string[] = [];
      appendVCardOptionalFields(lines, {
        bday: "1990-01-15",
        version: "3.0",
      } as VCardHelper);
      expect(lines).toContain("BDAY:1990-01-15");
    });

    it("appends photo with VALUE=URI for v3.0", () => {
      const lines: string[] = [];
      appendVCardOptionalFields(lines, {
        photo: "https://example.com/photo.jpg",
        version: "3.0",
      } as VCardHelper);
      expect(lines).toContain("PHOTO;VALUE=URI:https://example.com/photo.jpg");
    });

    it("appends photo without VALUE=URI for v4.0", () => {
      const lines: string[] = [];
      appendVCardOptionalFields(lines, {
        photo: "https://example.com/photo.jpg",
        version: "4.0",
      } as VCardHelper);
      expect(lines).toContain("PHOTO:https://example.com/photo.jpg");
    });

    it("appends note", () => {
      const lines: string[] = [];
      appendVCardOptionalFields(lines, {
        note: "Nice person",
        version: "3.0",
      } as VCardHelper);
      expect(lines).toContain("NOTE:Nice person");
    });

    it("appends IMPP", () => {
      const lines: string[] = [];
      appendVCardOptionalFields(lines, {
        impp: "xmpp:john@example.com", // cspell:disable-line
        version: "3.0",
      } as VCardHelper);
      expect(lines).toContain("IMPP:xmpp:john@example.com"); // cspell:disable-line
    });

    it("appends UID", () => {
      const lines: string[] = [];
      appendVCardOptionalFields(lines, {
        uid: "urn:uuid:12345",
        version: "3.0",
      } as VCardHelper);
      expect(lines).toContain("UID:urn:uuid:12345");
    });

    it("does nothing when no optional fields", () => {
      const lines: string[] = [];
      appendVCardOptionalFields(lines, { version: "3.0" } as VCardHelper);
      expect(lines.length).toBe(0);
    });
  });

  // ── appendValidEmailLines ──────────────────────────────────

  describe("appendValidEmailLines", () => {
    it("appends valid email addresses", () => {
      const lines: string[] = [];
      appendValidEmailLines(lines, ["john@example.com"], "3.0");
      expect(lines.length).toBe(1);
      expect(lines[0]).toContain("john@example.com");
    });

    it("skips invalid email addresses", () => {
      const lines: string[] = [];
      appendValidEmailLines(lines, ["not-an-email"], "3.0");
      expect(lines.length).toBe(0);
    });

    it("processes multiple emails", () => {
      const lines: string[] = [];
      appendValidEmailLines(lines, ["john@example.com", "invalid", "jane@example.com"], "3.0");
      expect(lines.length).toBe(2);
    });
  });

  // ── appendValidTelLines ────────────────────────────────────

  describe("appendValidTelLines", () => {
    it("appends valid phone numbers", () => {
      const lines: string[] = [];
      appendValidTelLines(lines, ["+15551234567"], "3.0");
      expect(lines.length).toBe(1);
      expect(lines[0]).toContain("+15551234567");
    });

    it("skips invalid phone numbers", () => {
      const lines: string[] = [];
      appendValidTelLines(lines, ["abc"], "3.0");
      expect(lines.length).toBe(0);
    });

    it("processes multiple phone numbers", () => {
      const lines: string[] = [];
      appendValidTelLines(lines, ["+15551234567", "x", "+15559876543"], "3.0");
      expect(lines.length).toBe(2);
    });
  });
});
