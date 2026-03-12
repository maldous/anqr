#!/usr/bin/env python3
"""
Reconstruct corrupted _internal files from original git HEAD sources.

Each _internal file is the original source with:
1. Import paths transformed (old module paths → new architecture paths)
2. Exported/split-out functions REMOVED (they live in their own files now)
3. All remaining top-level symbols marked `export`

Usage:
    python3 tools/refactor/reconstruct-internals.py
    python3 tools/refactor/reconstruct-internals.py --dry-run
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Optional

# ─── Configuration ───────────────────────────────────────────────────────────

# Map: _internal file path → original git HEAD path
INTERNAL_MAP = {
    "src/domain/qr/qart/generate._internal.tsx": "src/modules/qr-art/generate.ts",
    "src/hooks/useQRGenerator._internal.tsx": "src/hooks/useQRGenerator.ts",
    "src/features/analyze/components/content-type-renderers._internal.tsx": "src/components/analyze/content-type-renderers.tsx",
    "src/domain/render/generator/pixel-matrix-dithered._internal.tsx": "src/modules/qr-generator/pixel-matrix-dithered.ts",
    "src/domain/qr/decode/locate._internal.ts": "src/modules/qr-decoder/locate.ts",
    "src/domain/qr/decode/rs-decoder._internal.ts": "src/modules/qr-decoder/rs-decoder.ts",
    "src/domain/qr/encode/shift-jis._internal.ts": "src/modules/qr-encoder/shift-jis.ts",
    "src/domain/share/url-params._internal.tsx": "src/modules/share-links/url-params.ts",
    "src/domain/render/generator/render-modes._internal.ts": "src/modules/qr-generator/render-modes.ts",
    "src/domain/qr/qart/elimination._internal.tsx": "src/modules/qr-art/elimination.ts",
    "src/domain/qr/qart/scan-fallback._internal.tsx": "src/modules/qr-art/scan-fallback.ts",
}

# ─── Globals loaded at startup ───────────────────────────────────────────────

file_move_manifest: dict[str, str] = {}  # old_path → new_path
ast_symbols: dict[str, list[dict]] = {}  # file → [symbol_records]


# ─── Helpers ─────────────────────────────────────────────────────────────────


def git_show(path: str) -> str:
    """Get file content from git HEAD."""
    result = subprocess.run(
        ["git", "show", f"HEAD:{path}"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"git show HEAD:{path} failed: {result.stderr.strip()}")
    return result.stdout


def load_file_move_manifest() -> dict[str, str]:
    """Load manifests/file-move-manifest.json into a dict: source → target."""
    manifest_path = Path("manifests/file-move-manifest.json")
    if not manifest_path.exists():
        print(f"ERROR: {manifest_path} not found", file=sys.stderr)
        sys.exit(1)
    with open(manifest_path) as f:
        entries = json.load(f)
    mapping = {}
    for entry in entries:
        src = entry.get("source", "")
        tgt = entry.get("target")
        if src and tgt:
            mapping[src] = tgt
    return mapping


def load_ast_inventory() -> dict[str, list[dict]]:
    """Load out/ast-inventory/symbols.jsonl, grouped by file."""
    inventory_path = Path("out/ast-inventory/symbols.jsonl")
    if not inventory_path.exists():
        print(f"ERROR: {inventory_path} not found", file=sys.stderr)
        sys.exit(1)
    symbols: dict[str, list[dict]] = {}
    with open(inventory_path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            file_path = rec.get("file", "")
            if file_path:
                symbols.setdefault(file_path, []).append(rec)
    return symbols


def read_barrel_file(barrel_path: str) -> list[str]:
    """Read a barrel file and extract names of re-exported symbols."""
    path = Path(barrel_path)
    if not path.exists():
        return []
    content = path.read_text()
    names: list[str] = []
    # Match: export { Name } from './file'
    # Match: export { Name1, Name2 } from './file'
    # Match: export type { Name } from './file'
    for m in re.finditer(
        r"export\s+(?:type\s+)?{\s*([^}]+)\s*}\s*from\s*['\"]",
        content,
    ):
        block = m.group(1)
        for item in block.split(","):
            item = item.strip()
            # Handle 'Name as Alias', 'type Name'
            item = re.sub(r"\bas\b.*", "", item).strip()
            item = re.sub(r"^type\s+", "", item).strip()
            if item:
                names.append(item)
    # Match: export { default } from './file' → named 'default'
    # Match: export { Name } from './file'
    return names


def get_symbols_to_remove(
    old_path: str, barrel_path: str
) -> list[dict]:
    """
    Determine which exported symbols from the original file should be removed
    (because they've been split out into their own files).
    """
    barrel_names = set(read_barrel_file(barrel_path))
    file_symbols = ast_symbols.get(old_path, [])

    to_remove = []
    for sym in file_symbols:
        name = sym.get("name")
        if not name:
            continue
        exported = sym.get("exported", False)
        top_level = sym.get("topLevel", False)
        kind = sym.get("kind", "")

        # Remove exported top-level symbols that are re-exported from the barrel
        if exported and top_level and name in barrel_names:
            to_remove.append(sym)

        # Also remove `export default` assignments if 'default' is in barrel
        if kind == "export-assignment" and top_level and "default" in barrel_names:
            to_remove.append(sym)

    return to_remove


def get_line_ranges_to_remove(symbols_to_remove: list[dict]) -> list[tuple[int, int]]:
    """Get sorted, merged line ranges to remove."""
    ranges = []
    for sym in symbols_to_remove:
        start = sym.get("startLine")
        end = sym.get("endLine")
        if start is not None and end is not None:
            ranges.append((start, end))

    # Sort and merge overlapping ranges
    ranges.sort()
    merged = []
    for start, end in ranges:
        if merged and start <= merged[-1][1] + 1:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged


def find_re_export_line_ranges(lines: list[str]) -> list[tuple[int, int]]:
    """
    Find line ranges of re-export statements like:
        export type { ... } from './something';
        export { ... } from './something';

    These are barrel-style re-exports in the original file that should be removed
    from the _internal (the barrel file handles them now).
    Returns 1-based line ranges.
    """
    ranges = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Match start of re-export block
        if re.match(r"^export\s+(?:type\s+)?{", stripped):
            start_line = i + 1  # 1-based
            # Find the end of this statement (look for the closing line with `from`)
            j = i
            while j < len(lines):
                if re.search(r"from\s+['\"]", lines[j]):
                    end_line = j + 1  # 1-based
                    ranges.append((start_line, end_line))
                    break
                j += 1
            i = j + 1
        else:
            i += 1
    return ranges


def resolve_import_path(
    import_path: str,
    old_file_dir: str,
) -> Optional[str]:
    """
    Resolve an import path to an absolute src-relative path.
    Returns the old path (as it appears in manifests), or None if unresolvable.
    """
    if import_path.startswith("@/"):
        # Alias import: @/modules/foo → src/modules/foo
        resolved = "src/" + import_path[2:]
    elif import_path.startswith("."):
        # Relative import
        resolved = os.path.normpath(os.path.join(old_file_dir, import_path))
    else:
        # External package import (react, lucide-react, etc.) — don't transform
        return None

    # Try to resolve to an actual file path in the manifest
    # Try extensions: .ts, .tsx, /index.ts, /index.tsx, as-is
    candidates = [
        resolved,
        resolved + ".ts",
        resolved + ".tsx",
        resolved + "/index.ts",
        resolved + "/index.tsx",
    ]

    for candidate in candidates:
        if candidate in file_move_manifest:
            # Skip entries whose target is None (deleted files)
            if file_move_manifest[candidate] is not None:
                return candidate

    # If the path already ends with an extension, try without
    base, ext = os.path.splitext(resolved)
    if ext in (".ts", ".tsx"):
        if base in file_move_manifest and file_move_manifest[base] is not None:
            return base

    return None


def compute_relative_import(from_dir: str, to_path: str) -> str:
    """
    Compute a relative import path from `from_dir` to `to_path`.
    Both should be src-relative paths.
    """
    # Remove extension for import
    to_base, ext = os.path.splitext(to_path)
    # If it's an index file, import the directory
    if to_base.endswith("/index"):
        to_base = to_base[: -len("/index")]

    rel = os.path.relpath(to_base, from_dir)
    if not rel.startswith("."):
        rel = "./" + rel
    return rel


def transform_import_line(
    line: str,
    old_file_dir: str,
    internal_file_dir: str,
) -> str:
    """
    Transform a single import line's path from old → new architecture.
    """
    # Match import statements with path
    m = re.search(r"""(from\s+['"])([^'"]+)(['"])""", line)
    if not m:
        # Also handle: import '...' or import "..."
        m = re.search(r"""(import\s+['"])([^'"]+)(['"])""", line)
        if not m:
            return line

    prefix, import_path, suffix = m.group(1), m.group(2), m.group(3)

    # Skip external/node_modules imports
    if not import_path.startswith(".") and not import_path.startswith("@/"):
        return line

    # Resolve old absolute path
    old_abs = resolve_import_path(import_path, old_file_dir)
    if old_abs is None:
        # Can't resolve — leave as-is or try a best-effort approach
        # For relative imports that didn't match the manifest, they might already
        # be in the same directory structure
        if import_path.startswith("@/"):
            # Try mapping @/ directly
            src_path = "src/" + import_path[2:]
            new_rel = compute_relative_import(internal_file_dir, src_path)
            return line[: m.start()] + prefix + new_rel + suffix + line[m.end() :]
        return line

    # Get new path from manifest
    new_abs = file_move_manifest.get(old_abs)
    if not new_abs:
        return line

    # Compute relative path from _internal file's directory to new target
    new_rel = compute_relative_import(internal_file_dir, new_abs)

    return line[: m.start()] + prefix + new_rel + suffix + line[m.end() :]


def add_export_to_declaration(line: str) -> str:
    """
    If a line is a top-level declaration without `export`, add it.
    Handles: function, const, let, var, class, interface, type, enum, async function.
    """
    stripped = line.lstrip()

    # Already exported
    if stripped.startswith("export "):
        return line

    # Skip blank lines, comments, closing braces, etc.
    if not stripped or stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
        return line
    if stripped.startswith("}") or stripped.startswith("{"):
        return line
    if stripped.startswith("import "):
        return line

    # Compute indentation — only process top-level (no indentation)
    indent = len(line) - len(line.lstrip())
    if indent > 0:
        return line

    # Match declaration patterns
    decl_patterns = [
        r"^(async\s+)?function\s+\w+",
        r"^(const|let|var)\s+\w+",
        r"^class\s+\w+",
        r"^interface\s+\w+",
        r"^type\s+\w+",
        r"^enum\s+\w+",
    ]

    for pattern in decl_patterns:
        if re.match(pattern, stripped):
            return "export " + line
            break

    return line


def is_orphaned_comment_block(
    lines: list[str], start_idx: int, removed_ranges_0based: set[int]
) -> bool:
    """
    Check if lines starting at start_idx are comment lines that lead directly
    into a removed function/symbol (all lines between them and the removed range
    are comments or blank).
    """
    i = start_idx
    while i < len(lines):
        stripped = lines[i].strip()
        if not stripped:
            i += 1
            continue
        if stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
            i += 1
            # Handle end of block comment
            if stripped.startswith("/*") and "*/" not in stripped:
                while i < len(lines) and "*/" not in lines[i]:
                    i += 1
                i += 1  # skip the closing */ line
            continue
        # We've hit a non-comment, non-blank line
        if i in removed_ranges_0based:
            return True
        return False
    return False


def find_leading_comment_start(lines: list[str], target_line_0based: int) -> int:
    """
    Look backwards from target_line_0based to find the start of a leading
    comment block (JSDoc, line comments, etc.) that belongs to the declaration.
    Returns the 0-based index of where comments begin.
    """
    i = target_line_0based - 1
    comment_start = target_line_0based

    while i >= 0:
        stripped = lines[i].strip()
        if not stripped:
            # Blank line — could be separator; check if there are more comments above
            i -= 1
            continue
        if stripped.startswith("//") or stripped.endswith("*/"):
            comment_start = i
            # If block comment, find its start
            if stripped.endswith("*/") and not stripped.startswith("/*"):
                while i > 0:
                    i -= 1
                    if lines[i].strip().startswith("/*"):
                        comment_start = i
                        break
            elif stripped.startswith("/*"):
                comment_start = i
            i -= 1
            continue
        if stripped.startswith("/*") or stripped.startswith("*"):
            comment_start = i
            i -= 1
            continue
        break

    return comment_start


def reconstruct_internal(
    internal_path: str,
    old_path: str,
    dry_run: bool = False,
) -> bool:
    """Reconstruct a single _internal file."""
    print(f"\n{'='*60}")
    print(f"Processing: {internal_path}")
    print(f"  Original: {old_path}")

    # Step 1: Get original source from git HEAD
    try:
        original_source = git_show(old_path)
    except RuntimeError as e:
        print(f"  ERROR: {e}")
        return False

    lines = original_source.split("\n")
    total_lines = len(lines)
    print(f"  Original: {total_lines} lines")

    # Step 2: Identify symbols to remove
    # The barrel file is at the _internal's directory with the base name
    # e.g., generate._internal.tsx → generate.ts is the barrel
    internal_dir = os.path.dirname(internal_path)
    internal_basename = os.path.basename(internal_path)
    # Extract barrel name: generate._internal.tsx → generate
    barrel_stem = internal_basename.split("._internal")[0]
    # Try both .ts and .tsx
    barrel_path = None
    for ext in [".ts", ".tsx"]:
        candidate = os.path.join(internal_dir, barrel_stem + ext)
        if os.path.exists(candidate):
            barrel_path = candidate
            break

    if barrel_path:
        print(f"  Barrel: {barrel_path}")
    else:
        print(f"  WARNING: No barrel file found for {barrel_stem} in {internal_dir}")
        barrel_path = os.path.join(internal_dir, barrel_stem + ".ts")

    symbols_to_remove = get_symbols_to_remove(old_path, barrel_path)
    remove_names = [s.get("name", "?") for s in symbols_to_remove]
    print(f"  Symbols to remove ({len(symbols_to_remove)}): {', '.join(remove_names)}")

    # Get line ranges to remove (1-based)
    line_ranges = get_line_ranges_to_remove(symbols_to_remove)

    # Also find re-export blocks in original source and mark for removal
    re_export_ranges = find_re_export_line_ranges(lines)
    print(f"  Re-export blocks to remove: {len(re_export_ranges)}")
    line_ranges.extend(re_export_ranges)

    # Sort and merge all removal ranges
    line_ranges.sort()
    merged_ranges = []
    for start, end in line_ranges:
        if merged_ranges and start <= merged_ranges[-1][1] + 1:
            merged_ranges[-1] = (merged_ranges[-1][0], max(merged_ranges[-1][1], end))
        else:
            merged_ranges.append((start, end))
    line_ranges = merged_ranges

    # Build set of 0-based line indices to remove
    removed_lines_0based: set[int] = set()
    for start, end in line_ranges:
        for ln in range(start - 1, end):  # Convert 1-based to 0-based
            if 0 <= ln < len(lines):
                removed_lines_0based.add(ln)

    # Extend removal to include leading comments for removed symbols
    extended_removals: set[int] = set(removed_lines_0based)
    for start, end in line_ranges:
        comment_start = find_leading_comment_start(lines, start - 1)
        for ln in range(comment_start, start - 1):
            extended_removals.add(ln)

    # Also extend to blank lines immediately after removed blocks
    for start, end in line_ranges:
        i = end  # 0-based index after the block
        while i < len(lines) and lines[i].strip() == "":
            extended_removals.add(i)
            i += 1

    removed_lines_0based = extended_removals

    print(f"  Lines to remove: {len(removed_lines_0based)}")

    # Step 3: Transform import paths
    old_file_dir = os.path.dirname(old_path)

    # Step 4 & 5: Build output
    output_lines: list[str] = []
    i = 0
    while i < len(lines):
        if i in removed_lines_0based:
            i += 1
            continue

        line = lines[i]

        # Transform import paths (handle multi-line imports)
        if line.strip().startswith("import ") or (
            line.strip().startswith("from ") and "import" in line
        ):
            # Collect all lines of a multi-line import statement
            import_line_indices = [i]
            full_import = line
            j = i + 1
            # If the first line already contains `from '...'`, it's a single-line import
            is_complete = bool(re.search(r"""from\s+['"].*['"]""" , full_import))
            if not is_complete:
                # Multi-line import: keep going until we find the `from '...'` closing
                while j < len(lines):
                    if j in removed_lines_0based:
                        j += 1
                        continue
                    import_line_indices.append(j)
                    full_import += "\n" + lines[j]
                    # Check if this line completes the import (has from '...' with closing quote)
                    if re.search(r"""from\s+['"].*['"]""" , lines[j]):
                        j += 1
                        break
                    j += 1

            # Transform the full import's path
            transformed = transform_import_line(
                full_import, old_file_dir, internal_dir
            )

            # Output the transformed lines preserving original line breaks
            for tl in transformed.split("\n"):
                output_lines.append(tl)

            # Advance past all consumed lines
            i = max(j, i + 1)
            continue

        # Add export to remaining top-level declarations
        line = add_export_to_declaration(line)
        output_lines.append(line)
        i += 1

    # Clean up excessive blank lines (collapse 3+ consecutive blank lines to 2)
    cleaned_lines: list[str] = []
    blank_count = 0
    for line in output_lines:
        if line.strip() == "":
            blank_count += 1
            if blank_count <= 2:
                cleaned_lines.append(line)
        else:
            blank_count = 0
            cleaned_lines.append(line)

    # Remove trailing blank lines
    while cleaned_lines and cleaned_lines[-1].strip() == "":
        cleaned_lines.pop()
    cleaned_lines.append("")  # Ensure single trailing newline

    output = "\n".join(cleaned_lines)

    print(f"  Output: {len(cleaned_lines)} lines")

    if dry_run:
        print(f"  [DRY RUN] Would write to {internal_path}")
        # Show first 20 lines as preview
        preview_lines = cleaned_lines[:20]
        for pl in preview_lines:
            print(f"    | {pl}")
        if len(cleaned_lines) > 20:
            print(f"    | ... ({len(cleaned_lines) - 20} more lines)")
        return True

    # Step 6: Write the _internal file
    out_path = Path(internal_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(output)
    print(f"  ✓ Written: {internal_path}")
    return True


# ─── Main ────────────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(
        description="Reconstruct corrupted _internal files from git HEAD sources"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without writing files",
    )
    args = parser.parse_args()

    global file_move_manifest, ast_symbols

    print("Loading file-move-manifest.json ...")
    file_move_manifest = load_file_move_manifest()
    print(f"  {len(file_move_manifest)} source→target mappings loaded")

    print("Loading AST inventory ...")
    ast_symbols = load_ast_inventory()
    total_symbols = sum(len(v) for v in ast_symbols.values())
    print(f"  {len(ast_symbols)} files, {total_symbols} symbols loaded")

    if args.dry_run:
        print("\n*** DRY RUN MODE — no files will be written ***")

    success_count = 0
    fail_count = 0

    for internal_path, old_path in INTERNAL_MAP.items():
        try:
            ok = reconstruct_internal(internal_path, old_path, dry_run=args.dry_run)
            if ok:
                success_count += 1
            else:
                fail_count += 1
        except Exception as e:
            print(f"  ERROR processing {internal_path}: {e}")
            import traceback
            traceback.print_exc()
            fail_count += 1

    print(f"\n{'='*60}")
    print(f"Done: {success_count} succeeded, {fail_count} failed")
    if fail_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
