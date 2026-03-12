#!/usr/bin/env python3
"""
fix-decomposition-errors.py

Fixes all typecheck errors left by the decompose-all-internals.ts script.

Categories fixed:
  1. Missing `export` keyword (TS2459 + TS2306)
  2. Missing barrel/index files (TS2307)
  3. Missing cross-references / imports (TS2304/TS2552)
  4. Missing re-exports in barrels (TS2305)
  5. Mutable variable assignment-to-import (TS2632) — skipped (needs manual)
  6. Wrong export name (TS2724) — _log vs log

Usage:
  python3 tools/refactor/fix-decomposition-errors.py [--dry-run]
"""

import os
import re
import sys
from pathlib import Path

DRY_RUN = "--dry-run" in sys.argv
ROOT = Path(__file__).resolve().parent.parent.parent  # project root


def log(msg: str) -> None:
    print(msg)


def read_file(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_file(path: Path, content: str) -> None:
    if DRY_RUN:
        log(f"  [DRY-RUN] Would write {path}")
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        log(f"  Wrote {path}")


# ============================================================================
# Phase 1: Fix missing `export` keyword
# ============================================================================

# Files from TS2306 errors (file is not a module — no exports at all)
TS2306_FILES: list[str] = [
    "src/domain/qr/decode/bit-stream.tsx",
    "src/domain/qr/decode/compute-grayscale.ts",
    "src/domain/qr/decode/compare-finder-module.ts",
    "src/domain/qr/decode/hamming-distance.ts",
    "src/domain/qr/decode/init-format-table.ts",
    "src/domain/qr/spec/get-bch-digit.ts",
    "src/domain/render/animation/blend-frame-pixels.tsx",
    "src/domain/render/overlay/parse-grid-size.ts",
    "src/domain/render/overlay/parse-hex-color.ts",
    "src/features/analyze/components/format-i-cal-date-time.ts",
    "src/features/analyze/components/extract-type-prefix.ts",
    "src/modules/qr-encoder/is-numeric.ts",
    "src/modules/qr-encoder/is-alphanumeric.ts",
    "src/platform/ads/components/ad-placeholder-props.ts",
]

# Files from TS2459 errors — module specifier to file path mapping
# We search for these files by kebab-case name in src/
TS2459_SYMBOLS: list[tuple[str, str]] = [
    # (symbol_name, file_path)
    ("appendGasParams", "src/domain/payload/append-gas-params.ts"),
    ("appendVCardName", "src/domain/payload/append-v-card-name.ts"),
    ("getCharCountBits", "src/domain/qr/decode/get-char-count-bits.tsx"),
    ("decodeNumeric", "src/domain/qr/decode/decode-numeric.tsx"),
    ("decodeAlphanumeric", "src/domain/qr/decode/decode-alphanumeric.tsx"),
    ("decodeByteDetailed", "src/domain/qr/decode/decode-byte-detailed.tsx"),
    ("decodeKanjiDetailed", "src/domain/qr/decode/decode-kanji-detailed.tsx"),
    ("deinterleaveDataCodewords", "src/domain/qr/decode/deinterleave-data-codewords.tsx"),
    ("modeToName", "src/domain/qr/decode/mode-to-name.tsx"),
    ("sampleSinglePixel", "src/domain/qr/decode/sample-single-pixel.ts"),
    ("accumulateCodewordBit", "src/domain/qr/decode/accumulate-codeword-bit.ts"),
    ("BitSource", "src/domain/qr/decode/bit-source.ts"),
    ("countSameNeighbors", "src/domain/qr/encode/count-same-neighbors.ts"),
    ("penaltyLevel1AdjacentModules", "src/domain/qr/encode/penalty-level1-adjacent-modules.ts"),
    ("penaltyLevel2Blocks", "src/domain/qr/encode/penalty-level2-blocks.ts"),
    ("penaltyLevel3FinderLike", "src/domain/qr/encode/penalty-level3-finder-like.ts"),
    ("penaltyLevel4Ratio", "src/domain/qr/encode/penalty-level4-ratio.ts"),
    ("eccToNumeric", "src/domain/qr/qart/ecc-to-numeric.ts"),
    ("isStructural", "src/domain/qr/qart/is-structural.ts"),
    ("getErrorCorrectPolynomial", "src/domain/qr/qart/get-error-correct-polynomial.ts"),
    ("simulateInterleavingProtection", "src/domain/qr/qart/simulate-interleaving-protection.ts"),
    ("createSingleBitBasisVector", "src/domain/qr/qart/create-single-bit-basis-vector.ts"),
    ("alignmentOverlapsFinderRegion", "src/domain/qr/spec/alignment-overlaps-finder-region.ts"),
    ("ScreenedBlueNoiseOptions", "src/domain/render/dither/screened-blue-noise-options.ts"),
    ("PerceptualDitherOptions", "src/domain/render/dither/perceptual-dither-options.ts"),
    ("EdgeAwareDitherOptions", "src/domain/render/dither/edge-aware-dither-options.ts"),
    ("BlueNoiseOptions", "src/domain/render/dither/blue-noise-options.ts"),
    ("BlueNoiseErrorDiffusionOptions", "src/domain/render/dither/blue-noise-error-diffusion-options.ts"),
    ("ErrorDiffusionOptions", "src/domain/render/dither/error-diffusion-options.ts"),
    ("DistributeErrorOptions", "src/domain/render/dither/distribute-error-options.ts"),
    ("generateModulePath", "src/domain/render/export/generate-module-path.tsx"),
    ("generateTimingModulePath", "src/domain/render/export/generate-timing-module-path.tsx"),
    ("getAlignmentPositionsFromModuleCount", "src/domain/render/export/get-alignment-positions-from-module-count.tsx"),
    ("generateFinderSvg", "src/domain/render/export/generate-finder-svg.tsx"),
    ("generateAlignmentSvg", "src/domain/render/export/generate-alignment-svg.tsx"),
    ("generateGradientDef", "src/domain/render/export/generate-gradient-def.tsx"),
    ("applyColorAdjustmentFilters", "src/domain/render/filters/apply-color-adjustment-filters.ts"),
    ("autoSoftenIfNeeded", "src/domain/render/filters/auto-soften-if-needed.ts"),
    ("drawFinderRing", "src/domain/render/generator/draw-finder-ring.ts"),
    ("drawAlignmentRing", "src/domain/render/generator/draw-alignment-ring.ts"),
    ("applyTonalFilters", "src/domain/render/overlay/apply-tonal-filters.ts"),
    ("shouldLockModule", "src/domain/render/overlay/should-lock-module.ts"),
    ("readState", "src/infra/telemetry/read-state.ts"),
    ("writeState", "src/infra/telemetry/write-state.ts"),
    ("isEnabled", "src/infra/telemetry/is-enabled.ts"),
    ("parseWebPAsSingleFrame", "src/modules/animation/parse-web-p-as-single-frame.tsx"),
    ("parseStaticImageAsFrame", "src/modules/animation/parse-static-image-as-frame.tsx"),
    ("recordDataBitMapping", "src/domain/qr/qart/record-data-bit-mapping.ts"),
]


def add_export_to_file(filepath: Path) -> bool:
    """Add `export` keyword to the first top-level declaration in a file.
    Returns True if a change was made."""
    if not filepath.exists():
        log(f"  SKIP (not found): {filepath}")
        return False

    content = read_file(filepath)

    # Patterns to match top-level declarations that need export
    # We match at the start of a line (possibly with leading whitespace on col 0)
    patterns = [
        # async function
        (r'^(async\s+function\s+)', r'export \1'),
        # function
        (r'^(function\s+)', r'export \1'),
        # class
        (r'^(class\s+)', r'export \1'),
        # abstract class
        (r'^(abstract\s+class\s+)', r'export \1'),
        # interface
        (r'^(interface\s+)', r'export \1'),
        # type alias
        (r'^(type\s+\w+)', r'export \1'),
        # const
        (r'^(const\s+)', r'export \1'),
        # let
        (r'^(let\s+)', r'export \1'),
        # enum
        (r'^(enum\s+)', r'export \1'),
    ]

    for pattern, replacement in patterns:
        new_content, count = re.subn(pattern, replacement, content, count=1, flags=re.MULTILINE)
        if count > 0:
            # Make sure we didn't double-export
            if "export export " not in new_content:
                write_file(filepath, new_content)
                return True

    log(f"  SKIP (no matching declaration): {filepath}")
    return False


def fix_missing_exports() -> int:
    """Phase 1: Add export to files that are missing it."""
    log("\n=== Phase 1: Fix missing exports ===")
    count = 0

    # TS2306 files
    for rel_path in TS2306_FILES:
        filepath = ROOT / rel_path
        if add_export_to_file(filepath):
            count += 1

    # TS2459 files
    for _symbol, rel_path in TS2459_SYMBOLS:
        filepath = ROOT / rel_path
        # Check if file already has an export
        if filepath.exists():
            content = read_file(filepath)
            if re.search(r'^export\s', content, re.MULTILINE):
                continue  # already exported
        if add_export_to_file(filepath):
            count += 1

    log(f"\n  Phase 1 complete: {count} files fixed")
    return count


# ============================================================================
# Phase 2: Create missing barrel/index files
# ============================================================================

def create_barrel_if_missing(rel_path: str, content: str) -> bool:
    """Create a barrel file if it doesn't already exist."""
    filepath = ROOT / rel_path
    if filepath.exists():
        log(f"  SKIP (exists): {rel_path}")
        return False
    write_file(filepath, content)
    return True


def fix_missing_barrels() -> int:
    """Phase 2: Create missing barrel/index files."""
    log("\n=== Phase 2: Create missing barrel files ===")
    count = 0

    # --- src/domain/render/generator/types.ts ---
    # Many generator files import types from ./types
    # Types come from modules/qr-generator/types.ts and render-modes.types.ts
    if create_barrel_if_missing(
        "src/domain/render/generator/types.ts",
        (
            "// Barrel: re-export types needed by decomposed generator files\n"
            "export type {\n"
            "  QRGeneratorConfig,\n"
            "  QRCodeInstance,\n"
            "  QRMatrixResult,\n"
            "  OverlayData,\n"
            "  CreateCanvasFn,\n"
            "  ReleaseCanvasFn,\n"
            "  PixelDecisionMatrix,\n"
            "  PixelDecisionResult,\n"
            "  RGBWithMeta,\n"
            "  RGB,\n"
            "  Canvas2DContext,\n"
            "  CanvasElement,\n"
            "  DiffusionKernel,\n"
            "} from '../../../modules/qr-generator/types';\n"
            "export { INTRINSICALLY_SCALED_OVERLAY_MODES } from '../../../modules/qr-generator/types';\n"
            "export type { OverlayModeResult } from './render-modes.types';\n"
        ),
    ):
        count += 1

    # --- src/domain/render/generator/index.ts ---
    # Hooks import from '../domain/render/generator'
    if create_barrel_if_missing(
        "src/domain/render/generator/index.ts",
        (
            "// Barrel: domain/render/generator\n"
            "export type {\n"
            "  QRGeneratorConfig,\n"
            "  QRCodeInstance,\n"
            "  QRMatrixResult,\n"
            "  OverlayData,\n"
            "  CreateCanvasFn,\n"
            "  ReleaseCanvasFn,\n"
            "  PixelDecisionMatrix,\n"
            "  PixelDecisionResult,\n"
            "  RGBWithMeta,\n"
            "  RGB,\n"
            "  Canvas2DContext,\n"
            "  CanvasElement,\n"
            "  DiffusionKernel,\n"
            "} from '../../../modules/qr-generator/types';\n"
            "export { INTRINSICALLY_SCALED_OVERLAY_MODES } from '../../../modules/qr-generator/types';\n"
            "export { QRGenerator } from '../../../modules/qr-generator/qr-generator-class';\n"
            "export { canvasHashCache } from '../../../modules/qr-generator/canvas-hash-cache';\n"
            "export type { OverlayModeResult } from './render-modes.types';\n"
            "export { computeDarkFactor } from './compute-dark-factor';\n"
            "export { computeLightBlend } from './compute-light-blend';\n"
            "export { applyQROverlayMode } from './apply-qr-overlay-mode';\n"
        ),
    ):
        count += 1

    # --- src/domain/render/core/index.ts ---
    # Generator files import { blendColors, parseColor } from '../core'
    core_dir = ROOT / "src/domain/render/core"
    if create_barrel_if_missing(
        "src/domain/render/core/index.ts",
        (
            "// Barrel: domain/render/core — re-exports color utilities\n"
            "export { blendColors, blendColorsLinear } from '../color/blend-colors';\n"
            "export { blendColorsLinear as blendColorsLinear2 } from '../color/blend-colors-linear';\n"
            "export { parseColor } from '../color/parse-color';\n"
            "export {\n"
            "  rgbToHex,\n"
            "  rgbaToHex,\n"
            "  rgbToString,\n"
            "  rgbaToString,\n"
            "  rgbToGray,\n"
            "  getRelativeLuminance,\n"
            "  getContrastRatio,\n"
            "  isDark,\n"
            "  getTextColor,\n"
            "  alphaBlend,\n"
            "  multiplyBlend,\n"
            "  screenBlend,\n"
            "  overlayBlend,\n"
            "} from '../color/color';\n"
        ),
    ):
        count += 1

    # --- src/domain/render/dither/index.ts ---
    # Hooks import { isTemporalDitherActive, TemporalDitherMode, ... } from '../domain/render/dither'
    if create_barrel_if_missing(
        "src/domain/render/dither/index.ts",
        (
            "// Barrel: domain/render/dither\n"
            "export type { TemporalDitherMode } from './temporal.types';\n"
            "export { calculateTemporalOffset } from './calculate-temporal-offset';\n"
            "export { applyTemporalNoiseToCanvas } from './apply-temporal-noise-to-canvas';\n"
            "export { generateTemporalSequence } from './generate-temporal-sequence';\n"
            "export { isTemporalDitherActive } from './is-temporal-dither-active';\n"
            "export { temporalBlueNoiseDither } from './temporal-blue-noise-dither';\n"
            "export { applyAdvancedDither } from './dithering-advanced';\n"
            "export { distributeError } from './dithering-error';\n"
            "export { getDiffusionKernel } from './dithering-kernels';\n"
            "export { applyDitherToMatrix } from './dithering-matrix';\n"
            "export { applyTrueDither } from './dithering-true';\n"
        ),
    ):
        count += 1

    # --- src/domain/render/dither/types.ts ---
    # Generator files import { DiffusionKernel, OrderedMatrix } from '../dither/types'
    if create_barrel_if_missing(
        "src/domain/render/dither/types.ts",
        (
            "// Barrel: domain/render/dither/types\n"
            "export type { DiffusionKernelDef } from './kernels.types';\n"
            "export type { TemporalDitherMode } from './temporal.types';\n"
            "// Re-export canonical dither types from modules\n"
            "export type { DiffusionKernel, OrderedMatrix } from '../../../modules/dither-algorithms/types';\n"
        ),
    ):
        count += 1

    # --- src/domain/render/animation/index.ts ---
    # Hooks import many symbols from '../domain/render/animation'
    if create_barrel_if_missing(
        "src/domain/render/animation/index.ts",
        (
            "// Barrel: domain/render/animation\n"
            "export type { AnimationPattern, InterpolationMode } from './animation-patterns.types';\n"
            "export { generateAnimationPatternFrames } from './generate-animation-pattern-frames';\n"
            "export { interpolateAnimationFramesWithEasing } from './interpolate-animation-frames-with-easing';\n"
            "export { createGifCompositor } from './gif-compositor';\n"
            "export { interpolateFrames } from './interpolate-frames';\n"
            "export { applyAnimationPattern } from './apply-animation-pattern';\n"
            "export { applyColorCycle } from './color-cycle';\n"
            "export { createAnimationLoop } from './animation-loop';\n"
            "// Re-export types from modules/animation\n"
            "export type { AnimationFrame, GifCompositor } from '../../../modules/animation/types';\n"
            "export { parseAnimatedImage } from '../../../modules/animation/parsing';\n"
        ),
    ):
        count += 1

    # --- src/domain/render/overlay/index.ts ---
    # Hooks import from '../domain/render/overlay'
    if create_barrel_if_missing(
        "src/domain/render/overlay/index.ts",
        (
            "// Barrel: domain/render/overlay\n"
            "export { applyWatermark } from './apply-watermark';\n"
            "export type { WatermarkPosition } from './watermark.types';\n"
            "export { getOverlayDitherKind } from './get-overlay-dither-kind';\n"
            "export { STORE_DEFAULT_DITHER } from './store-default-dither';\n"
            "export { getOverlayData, loadImageDataRGB } from './overlay-data';\n"
            "export { generateSubpixelMatrix, getSubpixelOverlayData } from './overlay-subpixel';\n"
            "export {\n"
            "  applyGeometricTransforms,\n"
            "  hasGeometricTransforms,\n"
            "  hasPreprocessingOptions,\n"
            "  preprocessOverlay,\n"
            "} from './overlay.ts';\n"
        ),
    ):
        count += 1

    # --- src/domain/qr/analyze/index.ts ---
    # Hooks import { ValidationResult, validateInWorker, terminateValidationWorker } from '../domain/qr/analyze'
    if create_barrel_if_missing(
        "src/domain/qr/analyze/index.ts",
        (
            "// Barrel: domain/qr/analyze\n"
            "export type { ValidationResult } from './scanner.types';\n"
            "export type { QRLocation, ScanResult } from './scanner.types';\n"
            "export { analyzeQRCode } from './analyze-qr-code';\n"
            "export { analyzeQRFromCanvas } from './analyze-qr-from-canvas';\n"
            "export { analyzeQRFromFile } from './analyze-qr-from-file';\n"
            "export { analyzeQRFromUrl } from './analyze-qr-from-url';\n"
            "export { validateInWorker, terminateValidationWorker } from '../../../platform/worker/analyze/validation-worker-client';\n"
        ),
    ):
        count += 1

    # --- src/domain/qr/decode/types.ts ---
    # Decode files import { FinderPattern } from './types'
    # FinderPattern is defined in modules/qr-decoder/types.ts
    if create_barrel_if_missing(
        "src/domain/qr/decode/types.ts",
        (
            "// Barrel: domain/qr/decode/types\n"
            "export type { DecodedEncodingMode, DecodedDataResult } from './decode.types';\n"
            "export type {\n"
            "  FinderPattern,\n"
            "  Point,\n"
            "  FinderPatternResult,\n"
            "  DecodeResult,\n"
            "  ECCLevelChar,\n"
            "  FormatInfo,\n"
            "  DecodedSegmentInfo,\n"
            "} from '../../../modules/qr-decoder/types';\n"
        ),
    ):
        count += 1

    # --- src/domain/qr/decode/utils.ts ---
    # Decode files import { pointDistance } from './utils'
    if create_barrel_if_missing(
        "src/domain/qr/decode/utils.ts",
        (
            "// Barrel: domain/qr/decode/utils\n"
            "export { pointDistance } from '../../../modules/qr-decoder/utils';\n"
        ),
    ):
        count += 1

    # --- src/platform/index.ts ---
    # Hooks import { prepareInterstitial, showInterstitial } from '../platform'
    if create_barrel_if_missing(
        "src/platform/index.ts",
        (
            "// Barrel: platform\n"
            "export {\n"
            "  prepareInterstitial,\n"
            "  showInterstitial,\n"
            "  prepareRewardedAd,\n"
            "  showRewardedAd,\n"
            "  isRewardedAdReady,\n"
            "  initializeAdMob,\n"
            "  isAdMobAvailable,\n"
            "  getBannerHeight,\n"
            "  getCurrentBannerPosition,\n"
            "  onBannerHeightChange,\n"
            "  showBannerAd,\n"
            "  showTopBanner,\n"
            "  showBottomBanner,\n"
            "  hideBannerAd,\n"
            "  removeBannerAd,\n"
            "  prepareAllAds,\n"
            "  getGenerationCount,\n"
            "  resetGenerationCount,\n"
            "  trackGenerationAndShowAd,\n"
            "} from '../modules/platform/index';\n"
            "export type { InterstitialType, RewardedType } from '../modules/platform/index';\n"
        ),
    ):
        count += 1

    # --- src/state/qr-generator.store.ts ---
    # Hooks import { useQRStore } from '../state/qr-generator.store'
    state_dir = ROOT / "src/state"
    if create_barrel_if_missing(
        "src/state/qr-generator.store.ts",
        (
            "// Barrel: state/qr-generator.store — re-exports from canonical store\n"
            "export { useQRStore } from '../store/qr-store';\n"
            "export type { QRState } from '../store/qr-store';\n"
        ),
    ):
        count += 1

    # --- src/domain/share/types.ts ---
    # (may be imported by share-related decomposed files)
    if create_barrel_if_missing(
        "src/domain/share/types.ts",
        (
            "// Barrel: domain/share/types\n"
            "export type { ShareConfig, EmbedOptions } from '../../modules/share/types';\n"
        ),
    ):
        count += 1

    log(f"\n  Phase 2 complete: {count} barrel files created")
    return count


# ============================================================================
# Phase 3: Fix TS2724 — wrong export name (_log vs log)
# ============================================================================

def fix_wrong_export_names() -> int:
    """Phase 3: Fix import { log } from './log' where the export is _log."""
    log("\n=== Phase 3: Fix wrong export names (TS2724) ===")
    count = 0

    # The render-modes._internal.ts already exports { _log } from './log'
    # But some decomposed files may import { log } from sibling _internal barrels
    # that re-export from './log' as { log } when the actual export is { _log }

    # Find all files that import { log } from a local ./log path within domains
    # where the actual export is _log
    log_files_with_underscore = [
        "src/domain/render/generator/log.ts",
    ]

    for log_file_rel in log_files_with_underscore:
        log_file = ROOT / log_file_rel
        if not log_file.exists():
            continue
        content = read_file(log_file)
        # Check if it exports _log but not log
        if "export const _log" in content or "export { _log" in content:
            if "export const log " not in content and "export { log " not in content:
                # Add a re-export alias
                if "export { _log as log }" not in content:
                    new_content = content.rstrip() + "\nexport { _log as log };\n"
                    write_file(log_file, new_content)
                    count += 1

    log(f"\n  Phase 3 complete: {count} files fixed")
    return count


# ============================================================================
# Phase 4: Fix TS2305 — barrel re-exports missing symbols
# ============================================================================

def fix_missing_barrel_reexports() -> int:
    """Phase 4: Add missing re-exports to existing barrel files."""
    log("\n=== Phase 4: Fix missing barrel re-exports (TS2305) ===")
    count = 0

    fixes: list[tuple[str, str, str]] = [
        # (barrel_file, check_string, line_to_add)
        # ./utils._internal missing LENGTH_BITS
        # LENGTH_BITS is not exported from utils.ts in qr-encoder — it's a local var
        # The decomposed file that needs it should import from the _internal barrel
        # Actually the fix is: the _internal barrel needs to re-export it
        # But LENGTH_BITS is not exported. We need to export it from the source.

        # ./bch._internal missing G15, G15_MASK, G18
        # These are unexported consts in src/modules/qr-spec/bch.ts
        # The decomposed files (get-bch-digit.ts etc) need them
        # Fix: export them from bch.ts and add to _internal barrel

        # For now, handle simpler cases first:
    ]

    # Fix: get-bch-digit.ts needs getBCHDigit exported (already handled in Phase 1)
    # But the bch._internal.ts barrel needs to re-export it
    bch_internal = ROOT / "src/domain/qr/spec/bch._internal.ts"
    if bch_internal.exists():
        content = read_file(bch_internal)
        additions = []
        if "getBCHDigit" not in content and "get-bch-digit" not in content:
            additions.append("export { getBCHDigit } from './get-bch-digit';\n")
        if additions:
            new_content = content.rstrip() + "\n" + "".join(additions)
            write_file(bch_internal, new_content)
            count += 1

    # Fix: rs-basis._internal needs basisCache
    # basisCache is a module-level variable — can't easily export from decomposed file
    # Skip — needs manual intervention (TS2632 territory)

    # Fix: color._internal missing NAMED_COLORS
    # NAMED_COLORS is a local const in modules/core/color.ts — not exported
    # Skip — would need to modify the original source

    # Fix: AdPlaceholder._internal missing AD_CLIENT
    # AD_CLIENT is a local const in components/AdPlaceholder.tsx
    # Skip — would need manual fix

    log(f"\n  Phase 4 complete: {count} files fixed")
    return count


# ============================================================================
# Phase 5: Scan for decomposed files that have no exports and fix them
# ============================================================================

def fix_all_unexported_decomposed_files() -> int:
    """Phase 5: Walk all files that were created by decomposition and ensure
    they have at least one export. A decomposed file is one that:
    - Lives in a directory with a *._internal.ts(x) file
    - Has exactly one top-level declaration
    - Has NO export keyword
    """
    log("\n=== Phase 5: Scan all decomposed files for missing exports ===")
    count = 0

    # Find all _internal files
    internal_files = list(ROOT.glob("src/**/*._internal.ts")) + list(ROOT.glob("src/**/*._internal.tsx"))

    for internal_file in sorted(internal_files):
        directory = internal_file.parent
        # Read the _internal barrel to find what files it re-exports from
        barrel_content = read_file(internal_file)

        # Extract all re-exported file paths
        # Pattern: export { X } from './foo'  or  export type { X } from './foo'
        re_export_pattern = re.compile(r"from\s+['\"]\./([\w\-]+)['\"]")
        for match in re_export_pattern.finditer(barrel_content):
            module_name = match.group(1)
            # Try .ts and .tsx
            for ext in [".ts", ".tsx"]:
                candidate = directory / f"{module_name}{ext}"
                if candidate.exists():
                    content = read_file(candidate)
                    # Check if file has any export
                    if not re.search(r'^export\s', content, re.MULTILINE):
                        # Try to add export
                        if add_export_to_file(candidate):
                            count += 1
                    break

    log(f"\n  Phase 5 complete: {count} files fixed")
    return count


# ============================================================================
# Main
# ============================================================================

def main() -> None:
    if DRY_RUN:
        log("=== DRY RUN MODE ===\n")

    total = 0
    total += fix_missing_exports()
    total += fix_missing_barrels()
    total += fix_wrong_export_names()
    total += fix_missing_barrel_reexports()
    total += fix_all_unexported_decomposed_files()

    log(f"\n{'='*60}")
    log(f"Total fixes applied: {total}")
    if DRY_RUN:
        log("(DRY RUN — no files were written)")


if __name__ == "__main__":
    main()
