#!/usr/bin/env python3
"""
Repair broken decomposed helper files using sourceText from the AST inventory.

The decompose-internals.py brace-depth parser truncates functions that have
complex type parameters (containing { and }). This script rebuilds each broken
file by:
  1. Reading the current file to get the import section and list of symbol names
  2. Looking up each symbol's correct sourceText in the AST inventory
  3. Rewriting the file with correct imports + correct sourceText
"""

import json
import os
import re
import sys

SYMBOLS_JSONL = "out/ast-inventory/symbols.jsonl"

# Broken files mapped to their AST inventory source file
# Format: broken_file -> old_file_in_ast_inventory
BROKEN_FILES = {
    "src/domain/qr/qart/generate.full-q-art-result.ts": "src/modules/qr-art/generate.ts",
    "src/domain/qr/qart/generate.handle-scan-failure-fallback.ts": "src/modules/qr-art/generate.ts",
    "src/domain/qr/qart/generate.validate-final-matrix-diagnostics.ts": "src/modules/qr-art/generate.ts",
    "src/domain/qr/qart/scan-fallback.binary-search-max-vectors.ts": "src/modules/qr-art/scan-fallback.ts",
    "src/domain/qr/qart/scan-fallback.flatten-and-order-selections-limited.ts": "src/modules/qr-art/scan-fallback.ts",
    "src/domain/qr/decode/rs-decoder.correct-rs-block.ts": "src/modules/qr-decoder/rs-decoder.ts",
    "src/features/analyze/components/content-type-renderers.detect-social-platform.tsx": "src/components/analyze/content-type-renderers.tsx",
    "src/hooks/useQRGenerator.download-svg-format.ts": "src/hooks/useQRGenerator.ts",
    "src/hooks/useQRGenerator.execute-frame-generation-loop.ts": "src/hooks/useQRGenerator.ts",
    "src/hooks/useQRGenerator.execute-q-art-worker-pipeline.ts": "src/hooks/useQRGenerator.ts",
    "src/hooks/useQRGenerator.process-animation-frame-loop-iteration.ts": "src/hooks/useQRGenerator.ts",
    "src/hooks/useQRGenerator.resolve-overlay-preservation-options.ts": "src/hooks/useQRGenerator.ts",
}

# Regex to find top-level declarations (same as decompose script)
DECL_RE = re.compile(
    r"^(?:export\s+)?(?:export\s+default\s+)?"
    r"(?:declare\s+)?"
    r"(?:async\s+)?"
    r"(function\*?|const|let|var|type|interface|class|enum|abstract\s+class)\s+"
)

NAME_RE = re.compile(
    r"(?:export\s+)?(?:export\s+default\s+)?"
    r"(?:declare\s+)?"
    r"(?:async\s+)?"
    r"(?:function\*?|const|let|var|type|interface|class|enum|abstract\s+class)\s+"
    r"([a-zA-Z_$][a-zA-Z0-9_$]*)"
)


def load_all_symbols(old_file: str) -> dict[str, dict]:
    """Load all symbols for a given old file path, keyed by name."""
    symbols: dict[str, dict] = {}
    with open(SYMBOLS_JSONL, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            if obj.get("file") == old_file and obj.get("name") and obj.get("kind") != "re-export":
                symbols[obj["name"]] = obj
    return symbols


def extract_import_section(content: str) -> tuple[str, int]:
    """Extract the import section from a file. Returns (import_text, body_start_index)."""
    lines = content.split("\n")
    import_end = 0
    i = 0
    brace_depth = 0

    while i < len(lines):
        stripped = lines[i].strip()

        if not stripped:
            i += 1
            continue

        if stripped.startswith("import ") or stripped.startswith("import{"):
            # Track multi-line imports
            brace_depth = stripped.count("{") - stripped.count("}")
            while brace_depth > 0 and i + 1 < len(lines):
                i += 1
                brace_depth += lines[i].count("{") - lines[i].count("}")
            import_end = i + 1
            i += 1
        elif stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
            # Comment — check if next real line is an import
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

    import_text = "\n".join(lines[:import_end])
    return import_text, import_end


def extract_symbol_names_from_file(content: str, body_start: int) -> list[str]:
    """Extract all top-level declaration names from the body of a file."""
    lines = content.split("\n")
    names: list[str] = []

    for i in range(body_start, len(lines)):
        stripped = lines[i].strip()
        match = NAME_RE.match(stripped)
        if match:
            name = match.group(1)
            if name not in names:
                names.append(name)

    return names


def repair_file(broken_path: str, old_file: str, all_symbols: dict[str, dict]) -> bool:
    """Repair a single broken file using AST inventory sourceText."""
    if not os.path.isfile(broken_path):
        print(f"  SKIP (not found): {broken_path}")
        return False

    with open(broken_path, "r") as f:
        content = f.read()

    # Extract imports and symbol names from the broken file
    import_text, body_start = extract_import_section(content)
    symbol_names = extract_symbol_names_from_file(content, body_start)

    if not symbol_names:
        print(f"  SKIP (no symbols found): {broken_path}")
        return False

    # Look up each symbol in the AST inventory
    found_count = 0
    missing: list[str] = []
    parts: list[str] = []

    if import_text.strip():
        parts.append(import_text.rstrip())
        parts.append("")

    for name in symbol_names:
        sym = all_symbols.get(name)
        if not sym:
            missing.append(name)
            continue

        source = sym.get("sourceText", "")
        if not source:
            missing.append(name)
            continue

        # Ensure exported symbols carry the export keyword
        if sym.get("exported") and not source.startswith("export "):
            source = "export " + source

        parts.append(source.rstrip())
        parts.append("")
        found_count += 1

    if found_count == 0:
        print(f"  SKIP (no symbols matched AST inventory): {broken_path}")
        return False

    new_content = "\n".join(parts).rstrip() + "\n"

    with open(broken_path, "w") as f:
        f.write(new_content)

    status = f"  ✓ {broken_path}: {found_count}/{len(symbol_names)} symbols rebuilt"
    if missing:
        status += f" (missing: {', '.join(missing)})"
    print(status)
    return True


def main() -> None:
    if not os.path.isfile(SYMBOLS_JSONL):
        print(f"ERROR: {SYMBOLS_JSONL} not found.", file=sys.stderr)
        sys.exit(1)

    print(f"Repairing {len(BROKEN_FILES)} broken decomposed files...\n")

    # Pre-load symbols grouped by old file
    old_files = set(BROKEN_FILES.values())
    symbols_by_old: dict[str, dict[str, dict]] = {}
    for old_file in old_files:
        symbols_by_old[old_file] = load_all_symbols(old_file)
        print(f"  Loaded {len(symbols_by_old[old_file])} symbols for {old_file}")

    print()

    repaired = 0
    failed = 0
    for broken_path, old_file in sorted(BROKEN_FILES.items()):
        if repair_file(broken_path, old_file, symbols_by_old[old_file]):
            repaired += 1
        else:
            failed += 1

    print(f"\n{'=' * 60}")
    print(f"Repaired: {repaired} files")
    if failed:
        print(f"Failed:   {failed} files")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
