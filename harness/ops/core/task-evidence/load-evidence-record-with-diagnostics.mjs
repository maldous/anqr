import fs from "node:fs";
import { getEvidencePath } from "./get-evidence-path.mjs";

/**
 * Load an evidence record with diagnostic status.
 *
 * Unlike `loadEvidenceRecord` (which returns null for any error), this
 * function distinguishes three states:
 * - `ok`        — file exists and contains valid JSON
 * - `missing`   — file does not exist (ENOENT)
 * - `corrupted` — file exists but cannot be read or parsed
 *
 * The closure gate (G Phase 2) uses this to distinguish "no evidence"
 * from "corrupted evidence" and decide whether to retry or override.
 *
 * @param {string} correlationId
 * @returns {{ status: 'ok', record: object } | { status: 'missing' } | { status: 'corrupted', error: string }}
 */
export function loadEvidenceRecordWithDiagnostics(correlationId) {
  const filePath = getEvidencePath(correlationId);
  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    if (err.code === "ENOENT") return { status: "missing" };
    return { status: "corrupted", error: `read error: ${err.message}` };
  }
  try {
    return { status: "ok", record: JSON.parse(raw) };
  } catch (err) {
    return { status: "corrupted", error: `parse error: ${err.message}` };
  }
}
