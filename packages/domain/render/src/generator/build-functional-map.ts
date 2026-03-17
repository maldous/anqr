import { markAlignmentPatterns } from "./mark-alignment-patterns";
import { markFinderPatterns } from "./mark-finder-patterns";
import { markFixedDark } from "./mark-fixed-dark";
import { markFormatInfo } from "./mark-format-info";
import { markTimingPatterns } from "./mark-timing-patterns";
import { markVersionInfo } from "./mark-version-info";

export function buildFunctionalMap(moduleCount: number, version: number): Uint8Array {
  const mc = moduleCount;
  const map = new Uint8Array(mc * mc);
  markFinderPatterns(map, mc);
  markTimingPatterns(map, mc);
  markAlignmentPatterns(map, mc, version);
  markFormatInfo(map, mc);
  markVersionInfo(map, mc, version);
  markFixedDark(map, mc);
  return map;
}
