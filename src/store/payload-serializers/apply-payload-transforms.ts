import type { PayloadData } from "./payload-data";

export function applyPayloadTransforms(text: string, payload: PayloadData): string {
  let result = text;
  if (payload.trim) {
    result = result.trim();
  }
  if (payload.normalizeNewlines) {
    result = result.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  }
  return result;
}
