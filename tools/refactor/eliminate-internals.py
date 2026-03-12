#!/usr/bin/env python3
"""Eliminate all _internal files by rewriting imports to point directly at source files.

For each _internal file:
1. Parse its re-exports to build a symbol → source-file map
2. Extract any remaining real declarations into individual files
3. Rewrite ALL importers to import directly from source files
4. Delete the _internal file

Usage:
    python3 tools/refactor/eliminate-internals.py --dry-run   # preview
    python3 tools/refactor/eliminate-internals.py              # execute
"""

import os
import re
import sys
import glob

DRY_RUN = "--dry-run" in sys.argv
ROOT = os.getcwd()


def find_internal_files():
    """Find all _internal files under src/."""
    results = []
    for root, _, files in os.walk(os.path.join(ROOT, "src")):
        for f in files:
            if "._internal." in f and (f.endswith(".ts") or f.endswith(".tsx")):
                results.append(os.path.join(root, f))
    return sorted(results)


def resolve_import_path(importer_dir: str, import_module: str) -> str:
    """Resolve an import module path to an absolute directory path.
    E.g., importer in /src/foo/, import from './bar._internal' → /src/foo/bar._internal
    """
    return os.path.normpath(os.path.join(importer_dir, import_module))


def to_kebab(name: str) -> str:
    """Convert camelCase/PascalCase to kebab-case."""
    name = name.lstrip("_")
    s = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1-\2", name)
    s = re.sub(r"([a-z\d])([A-Z])", r"\1-\2", s)
    return s.lower().replace("_", "-")


def parse_internal_file(filepath: str):
    """Parse an _internal file. Returns:
    - symbol_map: dict of symbol_name → relative_module_path (from the _internal's dir)
    - real_code_blocks: list of (list_of_symbol_names, code_block_str) for non-re-export code
    """
    symbol_map = {}
    dirpath = os.path.dirname(filepath)

    with open(filepath, "r") as f:
        content = f.read()
        lines = content.split("\n")

    # First pass: find all re-exports (export { X } from './y')
    reexport_lines = set()
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        m = re.match(
            r"""^export\s+(?:type\s+)?\{\s*(.+?)\s*\}\s+from\s+['"](.+?)['"];?\s*$""",
            line_stripped,
        )
        if m:
            symbols_str = m.group(1)
            module_path = m.group(2)
            for sym_part in symbols_str.split(","):
                sym_part = sym_part.strip()
                if " as " in sym_part:
                    original, alias = sym_part.split(" as ", 1)
                    symbol_map[alias.strip()] = module_path
                else:
                    symbol_map[sym_part] = module_path
            reexport_lines.add(i)

    # Second pass: collect remaining code (non-re-export, non-empty, non-comment-only)
    remaining_lines = []
    for i, line in enumerate(lines):
        if i not in reexport_lines:
            remaining_lines.append(line)

    # Strip trailing whitespace
    remaining_code = "\n".join(remaining_lines).strip()

    # Find symbols exported from the remaining code
    # Patterns: export { X, Y }, export const X, export function X, etc.
    real_code_blocks = []
    if remaining_code:
        exported_symbols = []
        # Direct exports: export const/function/type/etc
        for m in re.finditer(
            r"^export\s+(?:default\s+)?(?:async\s+)?(?:function|const|let|type|interface|class|enum)\s+(\w+)",
            remaining_code, re.MULTILINE
        ):
            exported_symbols.append(m.group(1))
        # Grouped exports: export { X, Y }
        for m in re.finditer(r"^export\s+\{\s*([^}]+)\s*\}", remaining_code, re.MULTILINE):
            for sym in m.group(1).split(","):
                sym = sym.strip()
                if " as " in sym:
                    _, alias = sym.split(" as ", 1)
                    exported_symbols.append(alias.strip())
                else:
                    exported_symbols.append(sym)
        if exported_symbols:
            real_code_blocks.append((exported_symbols, remaining_code))

    return symbol_map, real_code_blocks


def extract_real_code_blocks(filepath: str, real_code_blocks: list):
    """Extract real code blocks from _internal into individual files. Returns updated symbol_map entries."""
    dirpath = os.path.dirname(filepath)
    ext = ".tsx" if filepath.endswith(".tsx") else ".ts"
    new_entries = {}

    for sym_names, code_block in real_code_blocks:
        primary_name = sym_names[0]
        kebab = to_kebab(primary_name)
        new_filename = kebab + ext
        new_filepath = os.path.join(dirpath, new_filename)

        # Handle name collisions
        counter = 2
        while os.path.exists(new_filepath):
            new_filename = f"{kebab}-{counter}{ext}"
            new_filepath = os.path.join(dirpath, new_filename)
            counter += 1

        module_ref = "./" + new_filename.rsplit(".", 1)[0]
        for sym_name in sym_names:
            new_entries[sym_name] = module_ref

        content = code_block + "\n"

        if DRY_RUN:
            print(f"  WOULD CREATE {new_filepath} ({len(sym_names)} symbols: {', '.join(sym_names)})")
            print(f"    First line: {code_block.split(chr(10))[0][:80]}")
        else:
            with open(new_filepath, "w") as f:
                f.write(content)
            print(f"  CREATED {new_filepath} ({len(sym_names)} symbols)")

    return new_entries


def build_import_module_name(internal_filepath: str) -> str:
    """Build the module import path that importers use for this _internal file.
    E.g. src/domain/qr/decode/rs-decoder._internal.ts → rs-decoder._internal
    """
    basename = os.path.basename(internal_filepath)
    return basename.rsplit(".", 1)[0]  # strip .ts/.tsx extension


def rewrite_importer(filepath: str, internal_module_name: str, symbol_map: dict, internal_dir: str):
    """Rewrite imports in a file that imports from an _internal module."""
    with open(filepath, "r") as f:
        content = f.read()

    original = content
    importer_dir = os.path.dirname(filepath)

    # Find all import lines referencing this _internal
    # Patterns:
    #   import { a, b } from './foo._internal'
    #   import type { A } from './foo._internal'
    #   import { a, type B } from '../bar._internal'
    pattern = re.compile(
        r"""^(import\s+(?:type\s+)?\{[^}]*\}\s+from\s+['"])([^'"]*""" + re.escape(internal_module_name) + r""")(['"];?)""",
        re.MULTILINE,
    )

    def replace_import(match):
        prefix = match.group(1)  # "import { " or "import type { "
        full_module = match.group(2)
        suffix = match.group(3)  # "'" or "';"

        # Extract the full import statement to get symbol names
        full_line = match.group(0)

        # Parse symbols from the import
        sym_match = re.search(r"\{([^}]*)\}", full_line)
        if not sym_match:
            return full_line  # Can't parse, leave as-is

        symbols_str = sym_match.group(1)
        symbols = []
        for s in symbols_str.split(","):
            s = s.strip()
            if not s:
                continue
            # Handle "type Foo" prefix
            is_type = False
            if s.startswith("type "):
                is_type = True
                s = s[5:].strip()
            # Handle "foo as bar"
            if " as " in s:
                original_name, alias = s.split(" as ", 1)
                symbols.append((original_name.strip(), alias.strip(), is_type))
            else:
                symbols.append((s, None, is_type))

        # Group symbols by their target module
        module_groups = {}  # module_path → [(import_name, alias, is_type)]
        for sym_name, alias, is_type in symbols:
            lookup = alias if alias else sym_name
            if lookup in symbol_map:
                target_module = symbol_map[lookup]
            elif sym_name in symbol_map:
                target_module = symbol_map[sym_name]
            else:
                # Symbol not in map — keep original import path
                target_module = full_module
                print(f"  WARNING: Symbol '{sym_name}' not found in map for {internal_module_name}, keeping original import in {filepath}")

            # Convert target_module (relative to _internal's dir) to relative to importer's dir
            if target_module == full_module:
                resolved = full_module
            else:
                # target_module is like './foo' relative to internal_dir
                # We need it relative to importer_dir
                abs_target = os.path.normpath(os.path.join(internal_dir, target_module))
                resolved = os.path.relpath(abs_target, importer_dir)
                if not resolved.startswith("."):
                    resolved = "./" + resolved

            if resolved not in module_groups:
                module_groups[resolved] = []
            module_groups[resolved].append((sym_name, alias, is_type))

        # Detect if the original import was `import type`
        is_import_type = full_line.strip().startswith("import type ")

        # Build replacement import lines
        new_lines = []
        for module_path, syms in sorted(module_groups.items()):
            type_syms = [(s, a) for s, a, t in syms if t or is_import_type]
            value_syms = [(s, a) for s, a, t in syms if not t and not is_import_type]

            for sym_list, use_type in [(value_syms, False), (type_syms, True)]:
                if not sym_list:
                    continue
                parts = []
                for s, a in sym_list:
                    if a:
                        parts.append(f"{s} as {a}")
                    else:
                        parts.append(s)
                sym_str = ", ".join(parts)
                type_kw = "type " if use_type else ""
                # Determine quote style from original
                quote = "'" if "'" in suffix or "'" in prefix else "'"
                new_lines.append(f"import {type_kw}{{ {sym_str} }} from {quote}{module_path}{quote};")

        return "\n".join(new_lines)

    content = pattern.sub(replace_import, content)

    if content != original:
        if DRY_RUN:
            # Show diff summary
            old_lines = original.split("\n")
            new_lines_list = content.split("\n")
            changed = sum(1 for a, b in zip(old_lines, new_lines_list) if a != b)
            print(f"  WOULD REWRITE {filepath} ({changed} lines changed)")
        else:
            with open(filepath, "w") as f:
                f.write(content)
            print(f"  REWROTE {filepath}")
        return True
    return False


def main():
    internal_files = find_internal_files()
    print(f"Found {len(internal_files)} _internal files")

    total_rewrites = 0
    total_extracted = 0
    total_deleted = 0

    for internal_path in internal_files:
        rel = os.path.relpath(internal_path, ROOT)
        internal_dir = os.path.dirname(internal_path)
        internal_module = build_import_module_name(internal_path)

        print(f"\n=== {rel} ===")

        # Step 1: Parse the _internal file
        symbol_map, real_code_blocks = parse_internal_file(internal_path)

        # Step 2: Extract real code blocks into individual files
        if real_code_blocks:
            total_syms = sum(len(syms) for syms, _ in real_code_blocks)
            print(f"  Extracting {total_syms} symbols from {len(real_code_blocks)} code blocks...")
            new_entries = extract_real_code_blocks(internal_path, real_code_blocks)
            symbol_map.update(new_entries)
            total_extracted += total_syms

        print(f"  Symbol map: {len(symbol_map)} symbols")

        # Step 3: Find all files that import from this _internal
        # Search for the _internal module name, but verify the import resolves to THIS file
        internal_abs_no_ext = internal_path.rsplit(".", 1)[0]  # strip .ts/.tsx
        importers = []
        for root_dir, _, files in os.walk(os.path.join(ROOT, "src")):
            for f in files:
                if not (f.endswith(".ts") or f.endswith(".tsx")):
                    continue
                fpath = os.path.join(root_dir, f)
                if fpath == internal_path:
                    continue
                try:
                    with open(fpath, "r") as fh:
                        file_content = fh.read()
                    if internal_module not in file_content:
                        continue
                    # Verify: resolve the import path to check it points to THIS _internal
                    importer_dir = os.path.dirname(fpath)
                    esc = re.escape(internal_module)
                    pat = 'from\\s+[\'"]([^\'"]*' + esc + ')[\'"]'
                    for im in re.finditer(pat, file_content):
                        resolved = resolve_import_path(importer_dir, im.group(1))
                        if os.path.normpath(resolved) == os.path.normpath(internal_abs_no_ext):
                            importers.append(fpath)
                            break
                except:
                    pass

        print(f"  Found {len(importers)} importers")

        # Step 4: Rewrite each importer
        for importer in importers:
            if rewrite_importer(importer, internal_module, symbol_map, internal_dir):
                total_rewrites += 1

        # Step 5: Delete the _internal file
        if DRY_RUN:
            print(f"  WOULD DELETE {rel}")
        else:
            os.remove(internal_path)
            print(f"  DELETED {rel}")
        total_deleted += 1

    print(f"\n{'=== DRY RUN SUMMARY ===' if DRY_RUN else '=== SUMMARY ==='}")
    print(f"  {total_deleted} _internal files {'would be ' if DRY_RUN else ''}deleted")
    print(f"  {total_extracted} real declarations {'would be ' if DRY_RUN else ''}extracted")
    print(f"  {total_rewrites} importer files {'would be ' if DRY_RUN else ''}rewritten")


if __name__ == "__main__":
    main()
