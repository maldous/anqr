/**
 * Lightweight QR structural verification.
 *
 * Purpose
 * - Catch obvious wiring or matrix corruption issues early.
 * - Keep this cheap and deterministic.
 *
 * Notes
 * - This does NOT fully validate ISO/IEC 18004.
 * - It checks only a few scan-critical invariants.
 */

import { createLogger } from "../../../infra/logging/logger";
import { isAlternatingCol } from "./is-alternating-col";
import { isAlternatingLine } from "./is-alternating-line";
import { isFinderCoreCorrect } from "./is-finder-core-correct";

const _log = createLogger("SPEC");

export type { DarkModuleReader, QRVerifyResult } from "./verify.types";
import type { DarkModuleReader, QRVerifyResult } from "./verify.types";

export function verifyQRStructure(qr: DarkModuleReader, explicitVersion?: number): QRVerifyResult {
  const issues: string[] = [];
  const moduleCount = qr.getModuleCount();
  const rawV = (moduleCount - 17) / 4;
  const version = explicitVersion ?? Math.floor(rawV);

  if (!Number.isFinite(rawV) || rawV < 1 || rawV > 40 || Math.floor(rawV) !== rawV) {
    issues.push(`moduleCount ${moduleCount} does not map to an integer QR version`);
  }
  if (version < 1 || version > 40) {
    issues.push(`version ${version} out of range`);
  }

  const isDark = (r: number, c: number) => qr.isDark(r, c);

  // Finder cores
  const tl = isFinderCoreCorrect(isDark, 0, 0);
  const tr = isFinderCoreCorrect(isDark, 0, moduleCount - 7);
  const bl = isFinderCoreCorrect(isDark, moduleCount - 7, 0);
  if (!tl) issues.push("top-left finder core mismatch");
  if (!tr) issues.push("top-right finder core mismatch");
  if (!bl) issues.push("bottom-left finder core mismatch");

  // Timing alternation (between finders)
  // Row 6, cols 8..(moduleCount-9)
  if (moduleCount >= 21) {
    const timingRowOk = isAlternatingLine(isDark, 6, 8, moduleCount - 9);
    const timingColOk = isAlternatingCol(isDark, 6, 8, moduleCount - 9);
    if (!timingRowOk) issues.push("timing row does not alternate");
    if (!timingColOk) issues.push("timing col does not alternate");
  }

  // Fixed dark module
  const dmRow = moduleCount - 8;
  const dmCol = 8;
  if (dmRow >= 0 && dmRow < moduleCount && dmCol >= 0 && dmCol < moduleCount) {
    if (!isDark(dmRow, dmCol)) issues.push("fixed dark module is not dark");
  }

  return { ok: issues.length === 0, version, issues };
}
