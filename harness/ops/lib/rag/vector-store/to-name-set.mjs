import { basename } from "node:path";

export function toNameSet(filenames) {
  return new Set((filenames || []).map((value) => basename(String(value))));
}
