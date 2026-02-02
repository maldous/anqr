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

import { createLogger } from '../../lib/logger';

const _log = createLogger('SPEC');

export interface DarkModuleReader {
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
}

export interface QRVerifyResult {
  ok: boolean;
  version: number;
  issues: string[];
}

function isFinderCoreCorrect(
  isDark: (r: number, c: number) => boolean,
  baseRow: number,
  baseCol: number
): boolean {
  // Finder core is 7x7 with pattern:
  // - outer border dark
  // - inner border light
  // - center 3x3 dark
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const rr = baseRow + r;
      const cc = baseCol + c;
      const expectedDark =
        r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      if (isDark(rr, cc) !== expectedDark) return false;
    }
  }
  return true;
}

function isAlternatingLine(
  isDark: (r: number, c: number) => boolean,
  row: number,
  colStart: number,
  colEnd: number
): boolean {
  // Accept either phase, but require strict alternation.
  let prev = isDark(row, colStart);
  for (let c = colStart + 1; c <= colEnd; c++) {
    const cur = isDark(row, c);
    if (cur === prev) return false;
    prev = cur;
  }
  return true;
}

function isAlternatingCol(
  isDark: (r: number, c: number) => boolean,
  col: number,
  rowStart: number,
  rowEnd: number
): boolean {
  let prev = isDark(rowStart, col);
  for (let r = rowStart + 1; r <= rowEnd; r++) {
    const cur = isDark(r, col);
    if (cur === prev) return false;
    prev = cur;
  }
  return true;
}

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
  if (!tl) issues.push('top-left finder core mismatch');
  if (!tr) issues.push('top-right finder core mismatch');
  if (!bl) issues.push('bottom-left finder core mismatch');

  // Timing alternation (between finders)
  // Row 6, cols 8..(moduleCount-9)
  if (moduleCount >= 21) {
    const timingRowOk = isAlternatingLine(isDark, 6, 8, moduleCount - 9);
    const timingColOk = isAlternatingCol(isDark, 6, 8, moduleCount - 9);
    if (!timingRowOk) issues.push('timing row does not alternate');
    if (!timingColOk) issues.push('timing col does not alternate');
  }

  // Fixed dark module
  const dmRow = moduleCount - 8;
  const dmCol = 8;
  if (dmRow >= 0 && dmRow < moduleCount && dmCol >= 0 && dmCol < moduleCount) {
    if (!isDark(dmRow, dmCol)) issues.push('fixed dark module is not dark');
  }

  return { ok: issues.length === 0, version, issues };
}
