import { drawPreservedAlignmentPatterns } from "./draw-preserved-alignment-patterns";
import { drawPreservedFinderPatterns } from "./draw-preserved-finder-patterns";
import { preserveFormatVersionModules } from "./preserve-format-version-modules";
import { preserveTimingModules } from "./preserve-timing-modules";
import type { StructuralPreservationCtx } from "../scaled-render-types";

export function drawPreservedStructuralPatterns(spctx: StructuralPreservationCtx): void {
  drawPreservedFinderPatterns(spctx);
  drawPreservedAlignmentPatterns(spctx);
  if (!spctx.forceBinaryFunctionPatterns && spctx.preserveTiming) {
    preserveTimingModules(spctx);
  }
  preserveFormatVersionModules(spctx);
}
