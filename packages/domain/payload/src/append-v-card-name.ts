import type { VCardHelper } from "@/modules/payload-generators/types";
import { escapeValue } from "@/modules/payload-generators/utils";

// N: must come BEFORE FN: for better parser compatibility
// Many real-world parsers are order-dependent and ignore N if FN comes first
export function appendVCardName(lines: string[], params: VCardHelper): void {
  if (params.n) {
    lines.push(`N:${escapeValue(params.n)}`);
  } else if (params.fn) {
    const parts = params.fn.split(" ");
    if (parts.length >= 2) {
      const lastName = parts.pop() || "";
      const firstName = parts.join(" ");
      lines.push(`N:${escapeValue(lastName)};${escapeValue(firstName)};;;`);
    } else {
      // Single name goes in Given Name position (2nd field), not Family Name
      // N structure: Family;Given;Additional;Prefix;Suffix
      lines.push(`N:;${escapeValue(params.fn)};;;`);
    }
  }

  if (params.fn) {
    lines.push(`FN:${escapeValue(params.fn)}`);
  }
}
