#!/usr/bin/env python3
"""
Revert the decomposition by reconstructing _internal files from their helper files.

For each decomposed _internal file:
1. Read the barrel to find all helper files
2. Read each helper file's imports and body
3. Merge all imports (deduplicating)
4. Concatenate all bodies in file order
5. Write the merged content back to the _internal file
6. Delete the helper files
"""

import os
import re
import sys

# Map of _internal barrel file → list of helper files (will be auto-discovered)
BARREL_FILES = [
    "src/domain/qr/qart/generate._internal.tsx",
    "src/domain/qr/qart/elimination._internal.tsx",
    "src/domain/qr/qart/scan-fallback._internal.tsx",
    "src/domain/qr/decode/rs-decoder._internal.ts",
    "src/domain/qr/decode/locate._internal.ts",
    "src/domain/qr/encode/shift-jis._internal.ts",
    "src/domain/render/generator/pixel-matrix-dithered._internal.tsx",
    "src/domain/render/generator/render-modes._internal.ts",
    "src/domain/share/url-params._internal.tsx",
    "src/features/analyze/components/content-type-renderers._internal.tsx",
    "src/hooks/useQRGenerator._internal.tsx",
]


def discover_helper_files(barrel_path: str) -> list[str]:
    """Read a barrel file and discover all helper files it re-exports from."""
    if not os.path.isfile(barrel_path):
        return []

    with open(barrel_path) as f:
        content = f.read()

    # Check if this is actually a barrel (small file with only export lines)
    lines = [l.strip() for l in content.strip().split("\n") if l.strip()]
    is_barrel = all(
        l.startswith("export ") or l.startswith("import ") or l == ""
        for l in lines
    )
    if not is_barrel or len(lines) > 20:
        return []  # Not a barrel, skip

    # Extract all referenced helper files
    helpers: list[str] = []
    seen: set[str] = set()
    dir_path = os.path.dirname(barrel_path)

    for line in lines:
        match = re.search(r"""from\s+['"](\.\/[^'"]+)['"]""", line)
        if match:
            rel = match.group(1)
            # Try with .ts and .tsx extensions
            for ext in [".ts", ".tsx"]:
                full = os.path.join(dir_path, rel + ext)
                if os.path.isfile(full) and full not in seen:
                    helpers.append(full)
                    seen.add(full)
                    break
            else:
                # Try without adding extension (maybe it already has one)
                full = os.path.join(dir_path, rel)
                if os.path.isfile(full) and full not in seen:
                    helpers.append(full)
                    seen.add(full)

    return helpers


def parse_file_sections(filepath: str) -> tuple[list[str], list[str]]:
    """Parse a file into (import_lines, body_lines)."""
    with open(filepath) as f:
        lines = f.readlines()

    import_lines: list[str] = []
    body_start = 0
    i = 0
    brace_depth = 0

    while i < len(lines):
        stripped = lines[i].strip()

        if not stripped:
            i += 1
            continue

        if stripped.startswith("import ") or stripped.startswith("import{"):
            start = i
            brace_depth = stripped.count("{") - stripped.count("}")
            while brace_depth > 0 and i + 1 < len(lines):
                i += 1
                brace_depth += lines[i].count("{") - lines[i].count("}")
            for j in range(start, i + 1):
                import_lines.append(lines[j].rstrip("\n"))
            body_start = i + 1
            i += 1
        elif stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
            # Comment before imports
            peek = i + 1
            while peek < len(lines) and (
                not lines[peek].strip()
                or lines[peek].strip().startswith("//")
                or lines[peek].strip().startswith("*")
            ):
                peek += 1
            if peek < len(lines) and (
                lines[peek].strip().startswith("import ")
                or lines[peek].strip().startswith("import{")
            ):
                i += 1
            else:
                break
        else:
            break

    body_lines = [l.rstrip("\n") for l in lines[body_start:]]

    # Remove trailing blank lines from body
    while body_lines and not body_lines[-1].strip():
        body_lines.pop()

    return import_lines, body_lines


def merge_imports(all_imports: list[list[str]]) -> list[str]:
    """Merge import lists, deduplicating identical imports."""
    seen: set[str] = set()
    merged: list[str] = []

    for import_list in all_imports:
        # Join multi-line imports into single statements for dedup
        i = 0
        while i < len(import_list):
            stmt_lines = [import_list[i]]
            # Check if this is a multi-line import
            depth = import_list[i].count("{") - import_list[i].count("}")
            while depth > 0 and i + 1 < len(import_list):
                i += 1
                stmt_lines.append(import_list[i])
                depth += import_list[i].count("{") - import_list[i].count("}")

            stmt = "\n".join(stmt_lines)
            # Normalize for dedup
            normalized = re.sub(r"\s+", " ", stmt.strip())
            if normalized not in seen and normalized:
                seen.add(normalized)
                merged.extend(stmt_lines)

            i += 1

    return merged


def reconstruct_internal(barrel_path: str, helper_files: list[str]) -> str | None:
    """Reconstruct an _internal file from its helper files."""
    all_imports: list[list[str]] = []
    all_bodies: list[list[str]] = []

    for helper in helper_files:
        imports, body = parse_file_sections(helper)
        all_imports.append(imports)
        if body:
            all_bodies.append(body)

    if not all_bodies:
        return None

    merged_imports = merge_imports(all_imports)

    parts: list[str] = []
    if merged_imports:
        parts.extend(merged_imports)
        parts.append("")

    for i, body in enumerate(all_bodies):
        parts.extend(body)
        if i < len(all_bodies) - 1:
            parts.append("")

    return "\n".join(parts).rstrip() + "\n"


def main() -> None:
    print("Reverting decomposition...\n")

    total_deleted = 0
    total_restored = 0

    for barrel_path in BARREL_FILES:
        helpers = discover_helper_files(barrel_path)
        if not helpers:
            print(f"  SKIP {barrel_path}: not a barrel or no helpers found")
            continue

        print(f"  {barrel_path}: {len(helpers)} helper files")
        for h in helpers:
            print(f"    ← {h}")

        content = reconstruct_internal(barrel_path, helpers)
        if not content:
            print(f"    ERROR: no content reconstructed, skipping")
            continue

        line_count = content.count("\n")
        print(f"    → reconstructed: {line_count} lines")

        # Write reconstructed content
        with open(barrel_path, "w") as f:
            f.write(content)
        total_restored += 1

        # Delete helper files
        for helper in helpers:
            os.remove(helper)
            total_deleted += 1
            print(f"    ✗ deleted {helper}")

        print()

    print(f"{'=' * 60}")
    print(f"Restored: {total_restored} _internal files")
    print(f"Deleted:  {total_deleted} helper files")


if __name__ == "__main__":
    main()
