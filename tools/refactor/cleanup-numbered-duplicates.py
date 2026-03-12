#!/usr/bin/env python3
"""
cleanup-numbered-duplicates.py

Removes all numbered artifact files (-2, -3, -4 suffixes) created by the decomposition,
updating importers to point to the correct base files.

Usage:
    python tools/refactor/cleanup-numbered-duplicates.py --dry-run   # Preview changes
    python tools/refactor/cleanup-numbered-duplicates.py             # Apply changes
"""

import os
import re
import sys
import glob

ROOT = "src"
DRY_RUN = "--dry-run" in sys.argv

# ─── Counters ──────────────────────────────────────────────────────────────────
files_deleted = 0
files_modified = 0
files_replaced = 0
files_renamed = 0


def log_action(action: str, detail: str):
    prefix = "[DRY RUN] " if DRY_RUN else ""
    print(f"  {prefix}{action}: {detail}")


# ─── Helpers ───────────────────────────────────────────────────────────────────

def read_file(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def write_file(path: str, content: str):
    global files_modified
    if not DRY_RUN:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
    files_modified += 1


def delete_file(path: str):
    global files_deleted
    log_action("DELETE", path)
    if not DRY_RUN:
        os.remove(path)
    files_deleted += 1


def replace_file_content(path: str, new_content: str):
    global files_replaced
    log_action("REPLACE", f"{path} (with new content)")
    if not DRY_RUN:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
    files_replaced += 1


def rename_file(old_path: str, new_path: str):
    global files_renamed
    log_action("RENAME", f"{old_path} -> {new_path}")
    if not DRY_RUN:
        os.rename(old_path, new_path)
    files_renamed += 1


def find_all_source_files() -> list[str]:
    """Find all .ts and .tsx files under ROOT."""
    results = []
    for root, dirs, files in os.walk(ROOT):
        for f in files:
            if f.endswith((".ts", ".tsx")):
                results.append(os.path.join(root, f))
    return results


def rewrite_imports_in_file(file_path: str, old_module: str, new_module: str) -> bool:
    """
    Replace import specifiers in file_path.
    old_module and new_module are the relative import strings (e.g., './log-2' -> './log').
    Returns True if the file was modified.
    """
    if not os.path.exists(file_path):
        return False
    content = read_file(file_path)
    new_content = content.replace(f"'{old_module}'", f"'{new_module}'")
    new_content = new_content.replace(f'"{old_module}"', f'"{new_module}"')
    if new_content != content:
        log_action("REWRITE IMPORT", f"{file_path}: '{old_module}' -> '{new_module}'")
        write_file(file_path, new_content)
        return True
    return False


def resolve_import_path(importer_path: str, import_specifier: str) -> str:
    """Resolve a relative import specifier to an absolute path (without extension)."""
    importer_dir = os.path.dirname(importer_path)
    return os.path.normpath(os.path.join(importer_dir, import_specifier))


def find_importers_of(target_path: str, all_files: list[str]) -> list[tuple[str, str]]:
    """
    Find all source files that import from target_path.
    Returns list of (importer_path, import_specifier) tuples.
    """
    target_no_ext = os.path.splitext(target_path)[0]
    # Handle .d.ts
    if target_no_ext.endswith(".d"):
        target_no_ext = target_no_ext[:-2]

    importers = []
    for fpath in all_files:
        if fpath == target_path:
            continue
        try:
            content = read_file(fpath)
        except Exception:
            continue
        for m in re.finditer(r"""from\s+['"]([^'"]+)['"]""", content):
            specifier = m.group(1)
            if specifier.startswith("."):
                resolved = resolve_import_path(fpath, specifier)
                if resolved == target_no_ext:
                    importers.append((fpath, specifier))
                    break  # Only count each file once
    return importers


def compute_new_specifier(importer_path: str, new_target_no_ext: str) -> str:
    """Compute the relative import specifier from importer to new target (no extension)."""
    importer_dir = os.path.dirname(importer_path)
    rel = os.path.relpath(new_target_no_ext, importer_dir)
    # Ensure it starts with ./
    if not rel.startswith("."):
        rel = "./" + rel
    return rel


def redirect_importers(target_path: str, new_base_path: str, all_files: list[str]):
    """
    Find all importers of target_path and rewrite their imports to point to new_base_path.
    """
    importers = find_importers_of(target_path, all_files)
    new_base_no_ext = os.path.splitext(new_base_path)[0]
    if new_base_no_ext.endswith(".d"):
        new_base_no_ext = new_base_no_ext[:-2]

    for importer_path, old_specifier in importers:
        new_specifier = compute_new_specifier(importer_path, new_base_no_ext)
        rewrite_imports_in_file(importer_path, old_specifier, new_specifier)


# ─── Category 1: Barrel re-exports ────────────────────────────────────────────

def fix_barrel_reexports(all_files: list[str]):
    """
    For files where base is a barrel that re-exports from -2 file:
    Move -2 file content into the base file, update importers.
    """
    print("\n=== Category 1: Barrel re-exports ===")

    # --- error-diffusion ---
    print("\n  -- error-diffusion --")
    ed_base = "src/domain/render/dither/error-diffusion.ts"
    ed_2 = "src/domain/render/dither/error-diffusion-2.ts"
    if os.path.exists(ed_2):
        # Read -2 content and fix its internal imports to remove -2 suffixes
        content = read_file(ed_2)
        content = content.replace("'./copy-image-to-pixels-2'", "'./copy-image-to-pixels'")
        content = content.replace("'./get-scan-params-2'", "'./get-scan-params'")
        content = content.replace("'./init-dither-results-2'", "'./init-dither-results'")
        # The base also exports distributeErrorWithKernel; keep that and add the impl
        base_content = read_file(ed_base)
        # Build new content: keep the distributeErrorWithKernel re-export, plus the real impl
        new_content = "export { distributeErrorWithKernel } from './distribute-error-with-kernel';\n"
        # Extract everything from error-diffusion-2 except its own distributeErrorWithKernel import
        # (it imports distributeErrorWithKernel for internal use, which is fine)
        new_content += "\n" + content
        replace_file_content(ed_base, new_content)
        delete_file(ed_2)

    # Delete the helper -2 files (exact duplicates of base)
    for f2 in [
        "src/domain/render/dither/copy-image-to-pixels-2.ts",
        "src/domain/render/dither/get-scan-params-2.ts",
        "src/domain/render/dither/init-dither-results-2.ts",
    ]:
        if os.path.exists(f2):
            # These were only imported by error-diffusion-2.ts which we've already fixed
            delete_file(f2)

    # --- bit-matrix ---
    print("\n  -- bit-matrix --")
    bm_base = "src/domain/qr/decode/bit-matrix.ts"
    bm_2 = "src/domain/qr/decode/bit-matrix-2.ts"
    if os.path.exists(bm_2):
        bm2_content = read_file(bm_2)
        # Base also re-exports BitArray; keep that
        new_content = "export { BitArray } from './bit-array';\n\n" + bm2_content
        replace_file_content(bm_base, new_content)
        delete_file(bm_2)

    # --- reader ---
    print("\n  -- reader --")
    rd_base = "src/domain/qr/decode/reader.ts"
    rd_2 = "src/domain/qr/decode/reader-2.ts"
    if os.path.exists(rd_2):
        rd2_content = read_file(rd_2)
        # Base also re-exports QRCodeDecoderMetaData; keep that
        # But reader-2 already imports QRCodeDecoderMetaData, so just add the re-export
        new_content = rd2_content + "\nexport { QRCodeDecoderMetaData } from './qr-code-decoder-meta-data';\n"
        replace_file_content(rd_base, new_content)
        delete_file(rd_2)

    # --- binarizer ---
    print("\n  -- binarizer (rename binarizer-2 -> abstract-binarizer) --")
    bn_2 = "src/domain/qr/decode/binarizer-2.ts"
    bn_new = "src/domain/qr/decode/abstract-binarizer.ts"
    if os.path.exists(bn_2):
        rename_file(bn_2, bn_new)
        # Update importers of binarizer-2 to use abstract-binarizer
        # Known importers: binary-bitmap.ts, luminance.ts
        for fpath in all_files:
            if not os.path.exists(fpath):
                continue
            try:
                content = read_file(fpath)
            except Exception:
                continue
            for old_spec in ["'./binarizer-2'", '"./binarizer-2"']:
                if old_spec in content:
                    new_spec = old_spec.replace("binarizer-2", "abstract-binarizer")
                    content = content.replace(old_spec, new_spec)
                    log_action("REWRITE IMPORT", f"{fpath}: binarizer-2 -> abstract-binarizer")
                    write_file(fpath, content)
                    break

    # --- watermark ---
    print("\n  -- watermark --")
    wm_base = "src/domain/render/overlay/watermark.ts"
    wm_2 = "src/domain/render/overlay/watermark-2.ts"
    if os.path.exists(wm_2):
        wm2_content = read_file(wm_2)
        base_content = read_file(wm_base)
        # Remove the `export { Watermark } from './watermark-2';` line from base
        new_base = base_content.replace("export { Watermark } from './watermark-2';\n", "")
        # Append the Watermark object definition inline (without imports since base already exports them)
        new_base += "\n// Namespace export\nexport const Watermark = {\n"
        new_base += "  applyWatermark,\n"
        new_base += "  applyWatermarkCenterLogo,\n"
        new_base += "  renderTextWatermark,\n"
        new_base += "  renderPatternWatermark,\n"
        new_base += "  calculateWatermarkPositions,\n"
        new_base += "  applyWatermarkBlendMode,\n"
        new_base += "};\n"
        # Need to convert type-only re-exports to value imports for the namespace object
        # The base already has the named re-exports, so we just need to import locally
        # Actually, the base already does `export { applyWatermark } from './apply-watermark'`
        # which makes `applyWatermark` available as an export but NOT as a local binding.
        # We need to import them locally for the namespace object.
        # Let's restructure: import all functions, then export them AND the namespace.
        new_base = """export type {
  WatermarkKind,
  WatermarkPosition,
  WatermarkBlend,
  WatermarkOptions,
  WatermarkResult,
} from './watermark.types';
export { applyWatermarkBlendMode } from './apply-watermark-blend-mode';
export { calculateWatermarkPositions } from './calculate-watermark-positions';
export { renderTextWatermark } from './render-text-watermark';
export { renderPatternWatermark } from './render-pattern-watermark';
export { applyWatermark } from './apply-watermark';
export { applyWatermarkCenterLogo } from './apply-watermark-center-logo';

import { applyWatermark } from './apply-watermark';
import { applyWatermarkCenterLogo } from './apply-watermark-center-logo';
import { renderTextWatermark } from './render-text-watermark';
import { renderPatternWatermark } from './render-pattern-watermark';
import { calculateWatermarkPositions } from './calculate-watermark-positions';
import { applyWatermarkBlendMode } from './apply-watermark-blend-mode';

// Namespace export
export const Watermark = {
  applyWatermark,
  applyWatermarkCenterLogo,
  renderTextWatermark,
  renderPatternWatermark,
  calculateWatermarkPositions,
  applyWatermarkBlendMode,
};
"""
        replace_file_content(wm_base, new_base)
        delete_file(wm_2)


# ─── Category 2: Exact duplicate log files ────────────────────────────────────

def fix_duplicate_logs(all_files: list[str]):
    """
    For exact duplicate log files, redirect all importers to the base file and delete the duplicate.
    """
    print("\n=== Category 2: Exact duplicate log files ===")

    # Define all duplicate log files and their base
    # Format: (numbered_file, base_stem_to_use)
    # For log files, the base stem is the same name without the -N suffix
    duplicate_logs = [
        # qr/decode/qr-decoder-log-N
        ("src/domain/qr/decode/qr-decoder-log-2.ts", "qr-decoder-log"),
        ("src/domain/qr/decode/qr-decoder-log-3.ts", "qr-decoder-log"),
        ("src/domain/qr/decode/qr-decoder-log-4.ts", "qr-decoder-log"),
        # qr/qart/log-N (.ts and .tsx variants)
        ("src/domain/qr/qart/log-2.ts", "log"),
        ("src/domain/qr/qart/log-2.tsx", "log"),
        ("src/domain/qr/qart/log-3.ts", "log"),
        ("src/domain/qr/qart/log-3.tsx", "log"),
        ("src/domain/qr/qart/log-4.tsx", "log"),
        # render/export/log-N
        ("src/domain/render/export/log-2.ts", "log"),
        ("src/domain/render/export/log-3.ts", "log"),
        # features/generator/application/url-import/log-N
        ("src/features/generator/application/url-import/log-2.ts", "log"),
    ]

    for dup_path, base_stem in duplicate_logs:
        if not os.path.exists(dup_path):
            continue

        dup_dir = os.path.dirname(dup_path)
        dup_stem = os.path.splitext(os.path.basename(dup_path))[0]

        print(f"\n  -- {dup_path} --")

        # Find all importers of this numbered file
        importers = find_importers_of(dup_path, all_files)

        for importer_path, old_specifier in importers:
            # Compute what the new specifier should be
            # The base file is in the same directory as the duplicate
            new_specifier = old_specifier.replace(dup_stem, base_stem)
            rewrite_imports_in_file(importer_path, old_specifier, new_specifier)

        delete_file(dup_path)


# ─── Category 3: Different logger tags (overlay log-2, log-3) ─────────────────

def fix_overlay_logs(all_files: list[str]):
    """
    overlay/log-2.ts and log-3.ts use createLogger('GENERATE') instead of 'OVERLAY'.
    Since these files are in the overlay directory, redirect importers to use ./log (OVERLAY tag).
    """
    print("\n=== Category 3: Different logger tags (overlay) ===")

    overlay_logs = [
        "src/domain/render/overlay/log-2.ts",
        "src/domain/render/overlay/log-3.ts",
    ]

    for dup_path in overlay_logs:
        if not os.path.exists(dup_path):
            continue

        dup_stem = os.path.splitext(os.path.basename(dup_path))[0]
        print(f"\n  -- {dup_path} --")

        importers = find_importers_of(dup_path, all_files)
        for importer_path, old_specifier in importers:
            new_specifier = old_specifier.replace(dup_stem, "log")
            rewrite_imports_in_file(importer_path, old_specifier, new_specifier)

        delete_file(dup_path)


# ─── Category 4: Meaningful renames ───────────────────────────────────────────

def fix_meaningful_renames(all_files: list[str]):
    """
    Handle search-context-2.tsx and default-export-2.ts which have unique content
    that should be given meaningful names.
    """
    print("\n=== Category 4: Meaningful renames ===")

    # --- search-context-2.tsx -> search-context-instance.tsx ---
    print("\n  -- search-context-2.tsx -> search-context-instance.tsx --")
    sc_2 = "src/app/search/search-context-2.tsx"
    sc_new = "src/app/search/search-context-instance.tsx"
    if os.path.exists(sc_2):
        rename_file(sc_2, sc_new)
        # Update importers: search-provider.tsx and use-search.ts
        for fpath in all_files:
            if not os.path.exists(fpath):
                continue
            try:
                content = read_file(fpath)
            except Exception:
                continue
            modified = False
            for q in ["'./search-context-2'", '"./search-context-2"']:
                if q in content:
                    new_q = q.replace("search-context-2", "search-context-instance")
                    content = content.replace(q, new_q)
                    modified = True
            if modified:
                log_action("REWRITE IMPORT", f"{fpath}: search-context-2 -> search-context-instance")
                write_file(fpath, content)

    # --- default-export-2.ts -> scanner-default-export.ts ---
    print("\n  -- default-export-2.ts -> scanner-default-export.ts --")
    de_2 = "src/domain/qr/analyze/default-export-2.ts"
    de_new = "src/domain/qr/analyze/scanner-default-export.ts"
    if os.path.exists(de_2):
        rename_file(de_2, de_new)
        # Update importers: scanner.ts
        for fpath in all_files:
            if not os.path.exists(fpath):
                continue
            try:
                content = read_file(fpath)
            except Exception:
                continue
            modified = False
            for q in ["'./default-export-2'", '"./default-export-2"']:
                if q in content:
                    new_q = q.replace("default-export-2", "scanner-default-export")
                    content = content.replace(q, new_q)
                    modified = True
            if modified:
                log_action("REWRITE IMPORT", f"{fpath}: default-export-2 -> scanner-default-export")
                write_file(fpath, content)


# ─── Category 6: Unused files ─────────────────────────────────────────────────

def delete_unused_files(all_files: list[str]):
    """Delete numbered files with zero importers."""
    print("\n=== Category 6: Unused files ===")

    unused = [
        "src/hooks/use-qr-generator-2.tsx",
    ]

    for fpath in unused:
        if os.path.exists(fpath):
            # Verify it truly has no importers
            importers = find_importers_of(fpath, all_files)
            if importers:
                print(f"  WARNING: {fpath} has {len(importers)} importers, skipping deletion!")
                for imp, spec in importers:
                    print(f"    - {imp} (via {spec})")
            else:
                print(f"\n  -- {fpath} (0 importers) --")
                delete_file(fpath)


# ─── Verification ─────────────────────────────────────────────────────────────

def verify_no_numbered_files_remain():
    """Check that no numbered artifact files remain (except bayer-*)."""
    print("\n=== Verification: checking for remaining numbered files ===")

    if DRY_RUN:
        print("  (Skipping filesystem verification in dry-run mode — files haven't been deleted)")
        print(f"  Based on the plan above, {files_deleted} numbered files would be deleted.")
        return []

    # Pattern: files ending in -N.ts or -N.tsx where N is a digit
    remaining = []
    for root, dirs, files in os.walk(ROOT):
        for f in files:
            if not f.endswith((".ts", ".tsx")):
                continue
            stem = os.path.splitext(f)[0]
            if stem.endswith(".d"):
                stem = stem[:-2]
            # Check if stem ends with -N where N is a number
            m = re.match(r"^(.+)-(\d+)$", stem)
            if m:
                base_name = m.group(1)
                # Skip legitimate files (bayer-2, bayer-4, bayer-8)
                if base_name == "bayer":
                    continue
                fpath = os.path.join(root, f)
                remaining.append(fpath)

    if remaining:
        print(f"  WARNING: {len(remaining)} numbered file(s) still remain:")
        for r in sorted(remaining):
            print(f"    - {r}")
    else:
        print("  ✓ All numbered artifact files have been cleaned up!")

    return remaining


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    if DRY_RUN:
        print("=" * 60)
        print("  DRY RUN MODE - No files will be modified")
        print("=" * 60)
    else:
        print("=" * 60)
        print("  APPLYING CHANGES")
        print("=" * 60)

    print("\nScanning source files...")
    all_files = find_all_source_files()
    print(f"Found {len(all_files)} source files.")

    # Apply fixes in order
    fix_barrel_reexports(all_files)

    # Refresh file list after barrel fixes (some files were deleted)
    all_files = find_all_source_files()

    fix_duplicate_logs(all_files)

    # Refresh file list
    all_files = find_all_source_files()

    fix_overlay_logs(all_files)

    # Refresh file list
    all_files = find_all_source_files()

    fix_meaningful_renames(all_files)

    # Refresh file list
    all_files = find_all_source_files()

    delete_unused_files(all_files)

    # Verify
    remaining = verify_no_numbered_files_remain()

    # Summary
    print("\n" + "=" * 60)
    print("  SUMMARY")
    print("=" * 60)
    print(f"  Files deleted:   {files_deleted}")
    print(f"  Files replaced:  {files_replaced}")
    print(f"  Files renamed:   {files_renamed}")
    print(f"  Files modified:  {files_modified} (import rewrites)")
    if remaining:
        print(f"  REMAINING:       {len(remaining)} numbered file(s) still present")
    else:
        print("  All numbered artifacts cleaned up successfully!")
    print()

    if DRY_RUN:
        print("Run without --dry-run to apply these changes.")


if __name__ == "__main__":
    main()
