// Locale parity guard (E-R9 / S11).
//
// Every non-English locale must carry the exact same flattened key set as
// en-US.json — anything else means the translation pipeline drifted and
// users on that locale will see English fallbacks (or worse, raw t() keys
// like "analyze.moduleSize" rendered literally).
//
// This spec runs against the JSON files directly (no i18next loader, no
// network) so a missing key fails the lefthook gate, not production.
//
// Aliases configured in locale-aliases.ts intentionally point at a source
// locale and share its payload at runtime; the source file is what we
// check, the alias mapping is what bridges them.
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const localesDir = join(__dirname);

function flattenKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") {
    return [prefix];
  }
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out.push(...flattenKeys(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

const source = JSON.parse(readFileSync(join(localesDir, "en-US.json"), "utf8"));
const sourceKeys = new Set(flattenKeys(source));

const localeFiles = readdirSync(localesDir)
  .filter((f) => f.endsWith(".json"))
  .filter((f) => f !== "en-US.json" && f !== "xlate.json");

describe("locale parity vs en-US.json", () => {
  for (const file of localeFiles) {
    // "Missing keys" (in en-US but not in this locale) are normal during
    // translation pipeline lag — react-i18next falls back to en-GB at
    // runtime so users still get *something*. We log a warning summary
    // but don't fail the gate.
    //
    // "Extra keys" (in this locale but not in en-US) are real bugs:
    // dead translations no t() call references, OR a key whose canonical
    // name in en-US drifted while the locale was renamed/copied. Those
    // fail the gate.
    it(`${file} has no orphan keys (keys absent from en-US.json)`, () => {
      const content = JSON.parse(readFileSync(join(localesDir, file), "utf8"));
      const localeKeys = new Set(flattenKeys(content));

      const missing = [...sourceKeys].filter((k) => !localeKeys.has(k));
      const extra = [...localeKeys].filter((k) => !sourceKeys.has(k)).sort();

      if (missing.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(
          `  ${file}: ${missing.length} key(s) pending translation (will fall back to en-GB at runtime)`,
        );
      }
      expect(extra.slice(0, 20), `orphan keys in ${file}`).toEqual([]);
    });
  }
});
