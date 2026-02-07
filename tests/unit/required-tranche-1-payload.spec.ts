import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const TARGET_SECTIONS = ["Payload Section"] as const;

const TRANCHE_IDS = [
  "payload-applink-fallback-input",
  "payload-applink-host-input",
  "payload-applink-package-input",
  "payload-applink-path-input",
  "payload-applink-platform-select",
  "payload-applink-scheme-input",
  "payload-applink-url-input",
  "payload-bizcard-address-input",
  "payload-bizcard-company-input",
  "payload-bizcard-email-input",
  "payload-bizcard-firstname-input",
  "payload-bizcard-lastname-input",
  "payload-bizcard-phone-input",
  "payload-bizcard-title-input",
  "payload-calsub-name-input",
  "payload-calsub-url-input",
  "payload-content-type-select",
  "payload-crypto-address-input",
  "payload-crypto-amount-input",
  "payload-crypto-label-input",
  "payload-crypto-type-select",
  "payload-email-body-textarea",
  "payload-email-subject-input",
  "payload-email-to-input",
  "payload-epc-amount-input",
  "payload-epc-bic-input",
  "payload-epc-iban-input",
  "payload-epc-name-input",
  "payload-epc-reference-input",
  "payload-event-description-textarea",
  "payload-event-end-input",
  "payload-event-location-input",
  "payload-event-start-input",
  "payload-event-summary-input",
  "payload-geo-lat-input",
  "payload-geo-lon-input",
  "payload-geo-query-input",
  "payload-gs1-batch-input",
  "payload-gs1-expiry-input",
  "payload-gs1-gtin-input",
  "payload-gs1-resolver-input",
  "payload-gs1-serial-input",
  "payload-max-len-guard-switch",
  "payload-mecard-adr-input",
  "payload-mecard-bday-input",
  "payload-mecard-email-input",
  "payload-mecard-n-input",
  "payload-mecard-nickname-input",
  "payload-mecard-org-input",
  "payload-mecard-tel-input",
  "payload-messaging-identifier-input",
  "payload-messaging-message-textarea",
  "payload-messaging-platform-select",
  "payload-normalize-newlines-switch",
  "payload-paynow-amount-input",
  "payload-paynow-reference-input",
  "payload-paynow-type-select",
  "payload-paynow-value-input",
  "payload-pix-amount-input",
  "payload-pix-city-input",
  "payload-pix-key-input",
  "payload-pix-name-input",
  "payload-promptpay-amount-input",
  "payload-promptpay-type-select",
  "payload-promptpay-value-input",
  "payload-rsvp-description-textarea",
  "payload-rsvp-end-input",
  "payload-rsvp-location-input",
  "payload-rsvp-start-input",
  "payload-rsvp-summary-input",
  "payload-rsvp-url-input",
  "payload-shortlink-input",
  "payload-shortlink-long-input",
  "payload-sms-body-textarea",
  "payload-sms-number-input",
  "payload-social-platform-select",
  "payload-social-username-input",
  "payload-tel-input",
  "payload-text-textarea",
  "payload-trim-switch",
  "payload-upi-amount-input",
  "payload-upi-note-input",
  "payload-upi-payee-name-input",
  "payload-upi-vpa-input",
  "payload-url-force-https-switch",
  "payload-url-input",
  "payload-validate-switch",
  "payload-vcard-email-input",
  "payload-vcard-fn-input",
  "payload-vcard-org-input",
  "payload-vcard-tel-input",
  "payload-vcard-title-input",
  "payload-vcard-url-input",
  "payload-wifi-auth-select",
  "payload-wifi-hidden-switch",
  "payload-wifi-password-input",
  "payload-wifi-ssid-input",
] as const;

function parseSectionIds(): string[] {
  const lines = fs.readFileSync(path.join(process.cwd(), 'tests/ids.txt'), 'utf8').split('\n');
  let section = '';
  let sectionNo = 0;
  const out: string[] = [];

  for (const line of lines) {
    const s = line.match(/^(\d+)\)\s+(.*)$/);
    if (s) {
      sectionNo = Number(s[1]);
      section = s[2].trim();
      continue;
    }
    if (sectionNo < 2) continue;
    if (!TARGET_SECTIONS.includes(section as (typeof TARGET_SECTIONS)[number])) continue;
    if (!line.startsWith('- ')) continue;

    const id = line.slice(2).trim();
    if (!id) continue;
    if (id.startsWith('Total managed IDs:')) continue;
    if (id.startsWith('Source:')) continue;
    if (id.startsWith('Rule:')) continue;
    if (id.startsWith('This file is')) continue;
    if (id.startsWith('Every test selector')) continue;
    out.push(id);
  }

  return [...new Set(out)].sort();
}

describe("Required Mapping Tranche 1: Payload explicit IDs", () => {
  it('contains non-empty, unique explicit IDs', () => {
    expect(TRANCHE_IDS.length).toBeGreaterThan(0);
    expect(new Set(TRANCHE_IDS).size).toBe(TRANCHE_IDS.length);
  });

  it('stays exactly synchronized with tests/ids.txt target sections', () => {
    expect([...TRANCHE_IDS].sort()).toEqual(parseSectionIds());
  });
});
