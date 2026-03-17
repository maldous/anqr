import type { VCardHelper } from "@/modules/payload-generators/types";
import { appendVCardContactInfo } from "./append-v-card-contact-info";
import { appendVCardName } from "./append-v-card-name";
import { appendVCardOptionalFields } from "./append-v-card-optional-fields";

/** Generate vCard string (2.1, 3.0, or 4.0) */
export function generateVCard(params: VCardHelper): string {
  const lines: string[] = [];

  lines.push("BEGIN:VCARD", `VERSION:${params.version}`);

  appendVCardName(lines, params);
  appendVCardContactInfo(lines, params);
  appendVCardOptionalFields(lines, params);

  lines.push("END:VCARD");

  // Use CRLF line endings for Android compatibility
  // Also add trailing CRLF as required by some parsers
  return `${lines.join("\r\n")}\r\n`;
}
