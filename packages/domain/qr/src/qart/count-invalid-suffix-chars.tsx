import { URL_SAFE_CHARS } from "./url-safe-chars";

export function countInvalidSuffixChars(suffix: string): number {
  let invalidCount = 0;
  for (let i = 0; i < suffix.length; i++) {
    const charCode = suffix.codePointAt(i)!;
    if (charCode < 32 || charCode > 126 || !URL_SAFE_CHARS.includes(suffix[i])) {
      invalidCount++;
    }
  }
  return invalidCount;
}
