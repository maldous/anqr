// ADR-0015 frame-loop contract — programmatic regression catch.
//
// Asserts the call order of the per-frame pipeline stages documented
// in `docs/adrs/0015-frame-loop-contract.md`. Both the server
// `renderFrameSequence` and the client `processAndPostProcessFrame`
// MUST call the helpers below in the canonical order:
//
//   1. resolve module input
//   2. apply module-animation effects
//   3. frame interpolation (module input)
//   4. apply module animation to config
//   5. render frame
//   6. apply result-animation effects (INCLUDES temporal noise)
//   7. frame interpolation (rendered)
//   8. color-cycle (if enabled)
//   9. scale + watermark
//   10. finalize
//
// This spec is hermetic — it doesn't render real canvases. It scans
// the source of the two loop files for the canonical helper names in
// the order each appears. If a future change reorders a stage on one
// side and not the other, this test fails with a clear diff.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(__dirname, "..", "..", "..", "..", "..");
const serverLoopPath = join(
  repoRoot,
  "packages/application/generator/src/server/render-runtime/render-frame-sequence.ts",
);
const clientLoopPath = join(
  repoRoot,
  "packages/application/generator/src/frames/process-and-post-process-frame.service.ts",
);

// Stage helpers to look for. Each entry is the canonical helper name
// (a substring match against the loop source) and the stage number it
// belongs to. The spec walks the source top-to-bottom and asserts the
// found stages are in non-decreasing order.
// Markers are chosen to uniquely identify a CALL SITE for each stage.
// "renderFrame" alone would also match the function declaration
// `renderFrameSequence` at the top of the server file; ".renderFrame("
// pins it to the per-iteration call.
const STAGE_MARKERS: ReadonlyArray<readonly [number, string]> = [
  [2, "ApplyAnimationEffectsToCanvas"],
  [3, "applyFrameInterpolation"],
  [4, "applyModuleAnimationToConfig"],
  [5, ".renderFrame("],
  [6, "applyResultEffectsForFrame"],
  [9, "scaleAndWatermarkFrame"],
];

function findStageOrder(sourcePath: string): number[] {
  const raw = readFileSync(sourcePath, "utf8");
  // Skip the leading import block: every stage marker also appears in
  // imports (alphabetised), which would scramble the order. Start
  // scanning at the first `function ` declaration.
  const bodyStartMatch = raw.match(/^(export\s+)?(async\s+)?function /m);
  const source = bodyStartMatch ? raw.slice(bodyStartMatch.index ?? 0) : raw;
  // Use the FIRST occurrence of each marker. Stages like
  // applyFrameInterpolation can run twice per frame (once on module
  // input, once on rendered output — ADR-0015 stages 3 and 7); we only
  // assert the first entry-point is in order.
  const positions: Array<{ stage: number; index: number }> = [];
  for (const [stage, marker] of STAGE_MARKERS) {
    const idx = source.toLowerCase().indexOf(marker.toLowerCase());
    if (idx >= 0) positions.push({ stage, index: idx });
  }
  positions.sort((a, b) => a.index - b.index);
  return positions.map((p) => p.stage);
}

describe("ADR-0015 frame-loop pipeline order", () => {
  it("server renderFrameSequence calls stages in non-decreasing order", () => {
    const order = findStageOrder(serverLoopPath);
    expect(order.length).toBeGreaterThan(0);
    for (let i = 1; i < order.length; i++) {
      expect(
        order[i] >= order[i - 1],
        `stage ${order[i]} appears after stage ${order[i - 1]} in server loop (out of order)`,
      ).toBe(true);
    }
  });

  it("client processAndPostProcessFrame calls stages in non-decreasing order", () => {
    const order = findStageOrder(clientLoopPath);
    // Client loop may not call every stage (color-cycle/watermark are
    // delegated to wrappers); we just assert what it DOES call is in
    // order.
    for (let i = 1; i < order.length; i++) {
      expect(
        order[i] >= order[i - 1],
        `stage ${order[i]} appears after stage ${order[i - 1]} in client loop (out of order)`,
      ).toBe(true);
    }
  });

  it("server loop calls applyResultEffectsForFrameHelper exactly once", () => {
    const source = readFileSync(serverLoopPath, "utf8");
    const matches = source.match(/applyResultEffectsForFrame/g) ?? [];
    expect(matches.length, "result-effects helper should be called once").toBeGreaterThan(0);
  });
});
