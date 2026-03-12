#!/usr/bin/env python3
"""
Repair broken decomposed helper files.

Fixes two issues:
1. AST inventory sourceText truncated at ~4022 chars → extract from git history
2. Missing const/let/var keywords on variable declarations
"""

import json
import os
import re
import subprocess
import sys

SYMBOLS_JSONL = "out/ast-inventory/symbols.jsonl"
TRUNCATION_MARKER = "/* ...truncated... */"

# Files to repair → their AST inventory source file
BROKEN_FILES = {
    "src/domain/qr/decode/rs-decoder.correct-rs-block.ts": "src/modules/qr-decoder/rs-decoder.ts",
    "src/domain/qr/qart/generate.full-q-art-result.ts": "src/modules/qr-art/generate.ts",
    "src/domain/qr/qart/generate.handle-scan-failure-fallback.ts": "src/modules/qr-art/generate.ts",
    "src/domain/qr/qart/generate.validate-final-matrix-diagnostics.ts": "src/modules/qr-art/generate.ts",
    "src/domain/qr/qart/scan-fallback.binary-search-max-vectors.ts": "src/modules/qr-art/scan-fallback.ts",
    "src/domain/qr/qart/scan-fallback.flatten-and-order-selections-limited.ts": "src/modules/qr-art/scan-fallback.ts",
    "src/features/analyze/components/content-type-renderers.detect-social-platform.tsx": "src/components/analyze/content-type-renderers.tsx",
    "src/hooks/useQRGenerator.download-svg-format.ts": "src/hooks/useQRGenerator.ts",
    "src/hooks/useQRGenerator.execute-frame-generation-loop.ts": "src/hooks/useQRGenerator.ts",
    "src/hooks/useQRGenerator.execute-q-art-worker-pipeline.ts": "src/hooks/useQRGenerator.ts",
    "src/hooks/useQRGenerator.process-animation-frame-loop-iteration.ts": "src/hooks/useQRGenerator.ts",
    "src/hooks/useQRGenerator.resolve-overlay-preservation-options.ts": "src/hooks/useQRGenerator.ts",
}

NAME_RE = re.compile(
    r"(?:export\s+)?(?:export\s+default\s+)?"
    r"(?:declare\s+)?"
    r"(?:async\s+)?"
    r"(?:function\*?|const|let|var|type|interface|class|enum|abstract\s+class)\s+"
    r"([a-zA-Z_$][a-zA-Z0-9_$]*)"
)


def load_symbols_for_file(old_file: str) -> dict[str, dict]:
    """Load all symbols for a given old file, keyed by name."""
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


def get_git_lines(old_file: str) -> list[str] | None:
    """Get file content from git HEAD."""
    try:
        result = subprocess.run(
            ["git", "show", f"HEAD:{old_file}"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            return result.stdout.split("\n")
    except Exception:
        pass
    return None


def extract_from_git(git_lines: list[str], start_line: int, end_line: int) -> str:
    """Extract lines from git content (1-indexed)."""
    return "\n".join(git_lines[start_line - 1 : end_line])


def get_source_text(sym: dict, git_lines: list[str] | None) -> str | None:
    """Get complete sourceText for a symbol, using git fallback if truncated."""
    source = sym.get("sourceText", "")

    # Check if truncated
    if source.rstrip().endswith(TRUNCATION_MARKER) or not source.strip():
        # Fall back to git history
        start = sym.get("startLine")
        end = sym.get("endLine")
        if git_lines and start and end:
            extracted = extract_from_git(git_lines, start, end)
            if extracted.strip():
                return extracted
        return None

    return source


def add_declaration_keyword(source: str, sym: dict) -> str:
    """Add missing const/let/var keyword for variable declarations."""
    kind = sym.get("kind", "")
    if kind != "variable":
        return source

    first_line = source.split("\n")[0].strip()

    # Check if already has a proper declaration keyword
    if re.match(r"^(export\s+)?(const|let|var)\s+", first_line):
        return source

    # Variable kind but no const/let/var - add const
    if first_line.startswith("export "):
        source = source.replace("export ", "export const ", 1)
    else:
        source = "const " + source

    return source


def extract_import_section(content: str) -> tuple[str, int]:
    """Extract the import section from file content."""
    lines = content.split("\n")
    import_end = 0
    i = 0

    while i < len(lines):
        stripped = lines[i].strip()
        if not stripped:
            i += 1
            continue

        if stripped.startswith("import ") or stripped.startswith("import{"):
            depth = stripped.count("{") - stripped.count("}")
            while depth > 0 and i + 1 < len(lines):
                i += 1
                depth += lines[i].count("{") - lines[i].count("}")
            import_end = i + 1
            i += 1
        elif stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
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

    return "\n".join(lines[:import_end]), import_end


def extract_symbol_names(content: str, body_start: int) -> list[str]:
    """Extract all top-level declaration names from the body."""
    lines = content.split("\n")
    names: list[str] = []
    for i in range(body_start, len(lines)):
        match = NAME_RE.match(lines[i].strip())
        if match:
            name = match.group(1)
            if name not in names:
                names.append(name)
    return names


def repair_file(
    broken_path: str,
    old_file: str,
    all_symbols: dict[str, dict],
    git_cache: dict[str, list[str] | None],
) -> bool:
    """Repair a single broken file."""
    if not os.path.isfile(broken_path):
        print(f"  SKIP (not found): {broken_path}")
        return False

    with open(broken_path, "r") as f:
        content = f.read()

    import_text, body_start = extract_import_section(content)
    symbol_names = extract_symbol_names(content, body_start)

    if not symbol_names:
        print(f"  SKIP (no symbols): {broken_path}")
        return False

    git_lines = git_cache.get(old_file)

    parts: list[str] = []
    if import_text.strip():
        parts.append(import_text.rstrip())
        parts.append("")

    found = 0
    missing: list[str] = []
    git_fallbacks = 0

    for name in symbol_names:
        sym = all_symbols.get(name)
        if not sym:
            missing.append(name)
            continue

        source = get_source_text(sym, git_lines)
        if not source:
            missing.append(f"{name}(no-source)")
            continue

        # Track if we used git fallback
        ast_source = sym.get("sourceText", "")
        if ast_source.rstrip().endswith(TRUNCATION_MARKER):
            git_fallbacks += 1

        # Add declaration keyword if needed
        source = add_declaration_keyword(source, sym)

        # Ensure exported symbols carry export keyword
        if sym.get("exported") and not source.lstrip().startswith("export "):
            source = "export " + source

        parts.append(source.rstrip())
        parts.append("")
        found += 1

    if found == 0:
        print(f"  SKIP (no matches): {broken_path}")
        return False

    new_content = "\n".join(parts).rstrip() + "\n"

    with open(broken_path, "w") as f:
        f.write(new_content)

    status = f"  ✓ {broken_path}: {found}/{len(symbol_names)} symbols"
    if git_fallbacks:
        status += f" ({git_fallbacks} from git)"
    if missing:
        status += f" (missing: {', '.join(missing[:5])}{'...' if len(missing) > 5 else ''})"
    print(status)
    return True


def main() -> None:
    if not os.path.isfile(SYMBOLS_JSONL):
        print(f"ERROR: {SYMBOLS_JSONL} not found.", file=sys.stderr)
        sys.exit(1)

    print(f"Repairing {len(BROKEN_FILES)} decomposed files...\n")

    # Pre-load symbols and git content
    old_files = set(BROKEN_FILES.values())
    symbols_by_old: dict[str, dict[str, dict]] = {}
    git_cache: dict[str, list[str] | None] = {}

    for old_file in sorted(old_files):
        symbols_by_old[old_file] = load_symbols_for_file(old_file)
        git_cache[old_file] = get_git_lines(old_file)
        git_status = f"{len(git_cache[old_file])} lines from git" if git_cache[old_file] else "NOT in git"
        print(f"  {old_file}: {len(symbols_by_old[old_file])} symbols, {git_status}")

    print()

    repaired = 0
    for broken_path, old_file in sorted(BROKEN_FILES.items()):
        if repair_file(broken_path, old_file, symbols_by_old[old_file], git_cache):
            repaired += 1

    print(f"\n{'=' * 60}")
    print(f"Repaired: {repaired}/{len(BROKEN_FILES)} files")


if __name__ == "__main__":
    main()
