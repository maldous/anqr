#!/usr/bin/env python3
"""
Decompose large _internal files into smaller helper modules using pre-computed AST inventory data.

Usage:
    python3 tools/refactor/decompose-internals.py --dry-run
    python3 tools/refactor/decompose-internals.py
    python3 tools/refactor/decompose-internals.py --file src/domain/qr/qart/generate._internal.tsx
    python3 tools/refactor/decompose-internals.py --dry-run --verbose
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
import sys
from collections import defaultdict
from typing import Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SYMBOLS_JSONL = "out/ast-inventory/symbols.jsonl"
SYMBOL_DEPS_JSONL = "out/ast-inventory/symbol-deps.jsonl"

MIN_LINES_TO_DECOMPOSE = 400
MIN_CLUSTER_SIZE = 2

# Hub symbols with degree above this percentile are excluded from clustering edges
HUB_DEGREE_THRESHOLD = 10

# Target max LOC per cluster file; large components are split further
TARGET_CLUSTER_LOC = 600

# Old path (AST inventory) → New path (current _internal file)
OLD_TO_NEW: dict[str, str] = {
    "src/modules/qr-art/generate.ts": "src/domain/qr/qart/generate._internal.tsx",
    "src/hooks/useQRGenerator.ts": "src/hooks/useQRGenerator._internal.tsx",
    "src/components/analyze/content-type-renderers.tsx": "src/features/analyze/components/content-type-renderers._internal.tsx",
    "src/modules/qr-generator/pixel-matrix-dithered.ts": "src/domain/render/generator/pixel-matrix-dithered._internal.tsx",
    "src/modules/qr-decoder/locate.ts": "src/domain/qr/decode/locate._internal.ts",
    "src/modules/qr-decoder/rs-decoder.ts": "src/domain/qr/decode/rs-decoder._internal.ts",
    "src/modules/qr-analyzer/decoder.ts": "src/domain/qr/decode/decode._internal.tsx",
    "src/modules/qr-encoder/shift-jis.ts": "src/domain/qr/encode/shift-jis._internal.ts",
    "src/modules/share-links/url-params.ts": "src/domain/share/url-params._internal.tsx",
    "src/modules/qr-generator/render-modes.ts": "src/domain/render/generator/render-modes._internal.ts",
    "src/modules/qr-art/elimination.ts": "src/domain/qr/qart/elimination._internal.tsx",
    "src/modules/qr-art/scan-fallback.ts": "src/domain/qr/qart/scan-fallback._internal.tsx",
}

NEW_TO_OLD: dict[str, str] = {v: k for k, v in OLD_TO_NEW.items()}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def to_kebab_case(name: str) -> str:
    """Convert a PascalCase/camelCase name to kebab-case."""
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", name)
    s = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1-\2", s)
    s = re.sub(r"[_\s]+", "-", s)
    s = re.sub(r"-+", "-", s)
    return s.lower().strip("-")


def load_symbols(old_file: str) -> list[dict]:
    """Load all symbols for a given old file path from symbols.jsonl."""
    symbols: list[dict] = []
    with open(SYMBOLS_JSONL, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            if obj.get("file") == old_file:
                symbols.append(obj)
    return symbols


# ---------------------------------------------------------------------------
# Dependency graph & clustering
# ---------------------------------------------------------------------------


class UnionFind:
    """Simple union-find for computing connected components."""

    def __init__(self) -> None:
        self.parent: dict[str, str] = {}
        self.rank: dict[str, int] = {}

    def find(self, x: str) -> str:
        if x not in self.parent:
            self.parent[x] = x
            self.rank[x] = 0
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: str, y: str) -> None:
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1


def build_directed_deps(
    symbols: list[dict], old_file: str
) -> tuple[dict[str, set[str]], dict[str, int]]:
    """
    Build *directed* adjacency: A → B means A references B (same file).
    Also returns the in-degree for each symbol (how many symbols reference it).
    """
    all_names = {s["name"] for s in symbols if s.get("name")}
    forward: dict[str, set[str]] = defaultdict(set)  # A uses B
    in_degree: dict[str, int] = defaultdict(int)

    for sym in symbols:
        name = sym.get("name")
        if not name:
            continue
        for ref_str in sym.get("referencedSymbols", []):
            if "@@" not in ref_str:
                continue
            ref_name, ref_file = ref_str.rsplit("@@", 1)
            if ref_file == old_file and ref_name in all_names and ref_name != name:
                if ref_name not in forward[name]:
                    forward[name].add(ref_name)
                    in_degree[ref_name] = in_degree.get(ref_name, 0) + 1

    return forward, in_degree


def identify_hubs(in_degree: dict[str, int], threshold: int) -> set[str]:
    """Return symbol names that are referenced by more than *threshold* other symbols."""
    return {name for name, deg in in_degree.items() if deg > threshold}


def compute_clusters_smart(
    symbols: list[dict],
    old_file: str,
    verbose: bool = False,
) -> list[list[dict]]:
    """
    Smart clustering:
    1. Build directed dep graph.
    2. Identify hub symbols (very high in-degree) and exclude them from union edges.
    3. Union-Find on the remaining edges to get initial components.
    4. Split any component whose total LOC exceeds TARGET_CLUSTER_LOC by source-order
       grouping into sub-clusters of roughly TARGET_CLUSTER_LOC lines.
    5. Assign hub symbols to the cluster of their primary *consumer* (or keep them as shared).
    """
    named_symbols = [s for s in symbols if s.get("name") and s.get("kind") != "re-export"]
    if not named_symbols:
        return []

    sym_by_name: dict[str, dict] = {s["name"]: s for s in named_symbols}
    forward, in_degree = build_directed_deps(named_symbols, old_file)

    hubs = identify_hubs(in_degree, HUB_DEGREE_THRESHOLD)
    if verbose and hubs:
        print(f"    Hub symbols (excluded from clustering edges): {sorted(hubs)}")

    # -- Phase 1: Union-Find without hubs --------------------------------
    uf = UnionFind()
    for s in named_symbols:
        uf.find(s["name"])

    for name, deps in forward.items():
        if name in hubs:
            continue
        for dep in deps:
            if dep in hubs:
                continue
            uf.union(name, dep)

    # Group symbols by component
    components: dict[str, list[dict]] = defaultdict(list)
    hub_syms: list[dict] = []
    for s in named_symbols:
        if s["name"] in hubs:
            hub_syms.append(s)
        else:
            root = uf.find(s["name"])
            components[root].append(s)

    # Sort each component by startLine
    for comp in components.values():
        comp.sort(key=lambda s: s.get("startLine", 0))

    # -- Phase 2: Split oversized components by source order ---------------
    final_clusters: list[list[dict]] = []

    for comp_syms in components.values():
        total_loc = sum(s.get("loc", 1) for s in comp_syms)
        if total_loc <= TARGET_CLUSTER_LOC or len(comp_syms) <= 2:
            final_clusters.append(comp_syms)
            continue

        # Split into sub-clusters of ~TARGET_CLUSTER_LOC lines each
        n_parts = max(2, math.ceil(total_loc / TARGET_CLUSTER_LOC))
        target_per = total_loc / n_parts

        current: list[dict] = []
        current_loc = 0
        for s in comp_syms:
            loc = s.get("loc", 1)
            current.append(s)
            current_loc += loc
            if current_loc >= target_per and len(current) >= MIN_CLUSTER_SIZE:
                final_clusters.append(current)
                current = []
                current_loc = 0
        if current:
            # Merge small leftovers into last cluster
            if len(current) < MIN_CLUSTER_SIZE and final_clusters:
                final_clusters[-1].extend(current)
            else:
                final_clusters.append(current)

    # -- Phase 3: Assign hub symbols to best cluster ----------------------
    # For each hub, find which cluster uses it the most (or put in misc)
    cluster_name_sets = [{s["name"] for s in c} for c in final_clusters]

    for hub_sym in hub_syms:
        hub_name = hub_sym["name"]
        # Count how many symbols in each cluster reference this hub
        best_cluster_idx = -1
        best_count = 0
        for ci, c in enumerate(final_clusters):
            count = sum(
                1
                for s in c
                if hub_name in forward.get(s["name"], set())
            )
            if count > best_count:
                best_count = count
                best_cluster_idx = ci

        if best_cluster_idx >= 0:
            # Insert hub at the beginning (it's usually a utility/constant)
            final_clusters[best_cluster_idx].insert(0, hub_sym)
            cluster_name_sets[best_cluster_idx].add(hub_name)
        else:
            # Nobody uses it — standalone
            final_clusters.append([hub_sym])
            cluster_name_sets.append({hub_name})

    # Re-sort each cluster by startLine
    for c in final_clusters:
        c.sort(key=lambda s: s.get("startLine", 0))

    # Sort clusters by first symbol startLine
    final_clusters.sort(key=lambda c: c[0].get("startLine", 0))

    return final_clusters


def name_cluster(cluster: list[dict]) -> str:
    """
    Name a cluster using the most prominent exported symbol,
    or the largest function. Convert to kebab-case.
    """
    exported = [s for s in cluster if s.get("exported")]
    if exported:
        best = max(exported, key=lambda s: s.get("loc", 0))
    else:
        best = max(cluster, key=lambda s: s.get("loc", 0))
    name = best.get("name", "misc")
    return to_kebab_case(name)


# ---------------------------------------------------------------------------
# Parsing the _internal file into blocks
# ---------------------------------------------------------------------------


def parse_import_section(lines: list[str]) -> tuple[list[str], int]:
    """
    Parse the import section at the top of the file.
    Returns (import_lines, first_non_import_line_index).
    """
    import_lines: list[str] = []
    i = 0
    while i < len(lines):
        stripped = lines[i].strip()

        if not stripped:
            import_lines.append(lines[i])
            i += 1
            continue

        if stripped.startswith("import ") or stripped.startswith("import{"):
            start = i
            brace_depth = 0
            while i < len(lines):
                for ch in lines[i]:
                    if ch == "{":
                        brace_depth += 1
                    elif ch == "}":
                        brace_depth -= 1
                if lines[i].strip().endswith(";") and brace_depth <= 0:
                    i += 1
                    break
                i += 1
            for j in range(start, i):
                import_lines.append(lines[j])
        elif stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
            # Comment line — only keep if next substantive line is an import
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
                import_lines.append(lines[i])
                i += 1
            else:
                break
        else:
            break

    return import_lines, i


def parse_trailing_exports(lines: list[str]) -> tuple[list[str], list[str]]:
    """
    Detect trailing `export { ... };` and `export type { ... };` lines at the end.
    Returns (body_lines_without_trailing, trailing_export_lines).
    """
    i = len(lines) - 1

    # Skip trailing blank lines
    while i >= 0 and not lines[i].strip():
        i -= 1

    # Collect trailing export-only lines
    while i >= 0:
        stripped = lines[i].strip()
        if stripped.startswith("export {") or stripped.startswith("export type {"):
            i -= 1
        elif stripped == "":
            i -= 1
        else:
            break

    body_end = i + 1
    trailing = [l for l in lines[body_end:] if l.strip().startswith("export ")]
    return lines[:body_end], trailing


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


def parse_declaration_blocks(
    lines: list[str], body_start: int, body_end: int
) -> list[dict]:
    """
    Parse the body of the file into top-level declaration blocks using
    brace-depth tracking.
    """
    blocks: list[dict] = []
    i = body_start

    while i < body_end:
        stripped = lines[i].strip()

        if not stripped:
            i += 1
            continue

        # Skip / absorb comment lines — they'll be attached to the next decl
        if stripped.startswith("//") or stripped.startswith("/*"):
            if stripped.startswith("/*"):
                while i < body_end and "*/" not in lines[i]:
                    i += 1
                i += 1
            else:
                while i < body_end and lines[i].strip().startswith("//"):
                    i += 1
            if i < body_end:
                stripped = lines[i].strip()
            else:
                break

        match = DECL_RE.match(stripped)
        if not match:
            i += 1
            continue

        name_match = NAME_RE.match(stripped)
        decl_name = name_match.group(1) if name_match else None
        is_exported = stripped.startswith("export ")

        block_start = i

        # Walk backwards to pick up leading comments
        comment_start = block_start
        j = block_start - 1
        while j >= body_start:
            prev = lines[j].strip()
            if (
                prev.startswith("//")
                or prev.startswith("*")
                or prev.startswith("/*")
                or prev.endswith("*/")
            ):
                comment_start = j
                j -= 1
            elif prev == "":
                j -= 1
            else:
                break

        # Track brace depth to find end
        brace_depth = 0
        found_open = False
        while i < body_end:
            for ch in lines[i]:
                if ch == "{":
                    brace_depth += 1
                    found_open = True
                elif ch == "}":
                    brace_depth -= 1
            if found_open and brace_depth <= 0:
                i += 1
                break
            if not found_open and lines[i].rstrip().endswith(";"):
                i += 1
                break
            i += 1

        blocks.append(
            {
                "name": decl_name,
                "start_line": comment_start,
                "end_line": i - 1,
                "lines": lines[comment_start:i],
                "exported": is_exported,
            }
        )

    return blocks


# ---------------------------------------------------------------------------
# Import handling
# ---------------------------------------------------------------------------


def parse_imports(import_lines: list[str]) -> list[dict]:
    """Parse import lines into structured import objects."""
    imports: list[dict] = []
    i = 0
    while i < len(import_lines):
        stripped = import_lines[i].strip()
        if not stripped or stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
            i += 1
            continue

        if stripped.startswith("import ") or stripped.startswith("import{"):
            stmt_lines = [import_lines[i]]
            depth = import_lines[i].count("{") - import_lines[i].count("}")
            while depth > 0 and i + 1 < len(import_lines):
                i += 1
                stmt_lines.append(import_lines[i])
                depth += import_lines[i].count("{") - import_lines[i].count("}")
            stmt = "\n".join(stmt_lines)
            is_type_only = bool(re.match(r"import\s+type[\s{]", stmt))
            from_match = re.search(r"""from\s+['"](.+?)['"]""", stmt)
            imports.append(
                {
                    "text": stmt,
                    "is_type_only": is_type_only,
                    "from_path": from_match.group(1) if from_match else None,
                }
            )
        i += 1
    return imports


def resolve_import_path(from_path: str, current_file: str) -> Optional[str]:
    """Resolve a relative or alias import path to a normalized src path."""
    if from_path.startswith("@/"):
        return "src/" + from_path[2:]
    if from_path.startswith("."):
        return os.path.normpath(os.path.join(os.path.dirname(current_file), from_path))
    return None  # external package


def filter_imports_for_cluster(
    all_imports: list[dict],
    cluster_imports_used: set[str],
    old_file: str,
) -> list[dict]:
    """Keep only imports needed by a cluster (based on importsUsed from AST data)."""
    needed: list[dict] = []
    for imp in all_imports:
        if not imp["from_path"]:
            needed.append(imp)
            continue
        resolved = resolve_import_path(imp["from_path"], old_file)
        if resolved is None:
            # External package — include if any importsUsed looks like it
            # Be conservative: include external imports
            needed.append(imp)
            continue

        resolved_norm = resolved.replace(".ts", "").replace(".tsx", "").replace("/index", "")
        for used in cluster_imports_used:
            if used.startswith("../../../../"):
                continue
            used_norm = used.replace(".ts", "").replace(".tsx", "").replace("/index", "")
            if used_norm == resolved_norm or used_norm.startswith(resolved_norm + "/"):
                needed.append(imp)
                break

    return needed


# ---------------------------------------------------------------------------
# File generation
# ---------------------------------------------------------------------------


def determine_extension(cluster: list[dict]) -> str:
    return ".tsx" if any(s.get("hasJsx") for s in cluster) else ".ts"


def generate_cluster_file_content(
    cluster: list[dict],
    blocks: list[dict],
    all_imports: list[dict],
    old_file: str,
) -> Optional[str]:
    """Build file content for one cluster helper module."""
    cluster_names = {s["name"] for s in cluster if s.get("name")}

    # Collect importsUsed
    cluster_imports: set[str] = set()
    for s in cluster:
        for p in s.get("importsUsed", []):
            cluster_imports.add(p)

    needed_imports = filter_imports_for_cluster(all_imports, cluster_imports, old_file)

    matched: list[dict] = [b for b in blocks if b["name"] and b["name"] in cluster_names]
    if not matched:
        return None

    matched.sort(key=lambda b: b["start_line"])

    parts: list[str] = []
    if needed_imports:
        for imp in needed_imports:
            parts.append(imp["text"])
        parts.append("")

    for block in matched:
        sym = next((s for s in cluster if s.get("name") == block["name"]), None)
        block_lines = list(block["lines"])
        # Ensure exported symbols carry `export` keyword
        if sym and sym.get("exported") and not block.get("exported"):
            first = block_lines[0]
            stripped_first = first.lstrip()
            indent = first[: len(first) - len(stripped_first)]
            if not stripped_first.startswith("export "):
                block_lines[0] = indent + "export " + stripped_first
        text = "\n".join(block_lines)
        parts.append(text)
        parts.append("")

    return "\n".join(parts).rstrip() + "\n"


def generate_barrel_content(
    cluster_info: list[tuple[str, str, list[dict]]],
    misc_symbols: list[dict],
    misc_file: Optional[str],
) -> str:
    """Generate the rewritten _internal barrel file."""
    lines: list[str] = []

    def _emit(syms: list[dict], file_stem: str) -> None:
        val_names: list[str] = []
        type_names: list[str] = []
        for s in syms:
            n = s.get("name")
            if not n or not s.get("exported"):
                continue
            if s.get("kind") in ("type", "interface"):
                type_names.append(n)
            else:
                val_names.append(n)
        rel = "./" + file_stem
        if val_names:
            lines.append(f"export {{ {', '.join(sorted(val_names))} }} from '{rel}';")
        if type_names:
            lines.append(f"export type {{ {', '.join(sorted(type_names))} }} from '{rel}';")

    for _, file_stem, syms in cluster_info:
        _emit(syms, file_stem)

    if misc_symbols and misc_file:
        stem = misc_file.replace(".ts", "").replace(".tsx", "")
        _emit(misc_symbols, stem)

    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------
# Main decomposition logic
# ---------------------------------------------------------------------------


def decompose_file(
    internal_path: str,
    dry_run: bool = False,
    verbose: bool = False,
) -> dict:
    result: dict = {
        "file": internal_path,
        "original_lines": 0,
        "clusters": 0,
        "new_files": [],
        "skipped": False,
        "reason": "",
    }

    if not os.path.isfile(internal_path):
        result["skipped"] = True
        result["reason"] = f"File not found: {internal_path}"
        return result

    with open(internal_path, "r") as f:
        content = f.read()
    all_lines = content.split("\n")
    result["original_lines"] = len(all_lines)

    if len(all_lines) < MIN_LINES_TO_DECOMPOSE:
        result["skipped"] = True
        result["reason"] = f"Only {len(all_lines)} lines (< {MIN_LINES_TO_DECOMPOSE})"
        return result

    old_file = NEW_TO_OLD.get(internal_path)
    if not old_file:
        result["skipped"] = True
        result["reason"] = f"No old→new mapping for {internal_path}"
        return result

    print(f"  Loading AST symbols for {old_file}...")
    symbols = load_symbols(old_file)
    if not symbols:
        result["skipped"] = True
        result["reason"] = f"No symbols found in AST inventory for {old_file}"
        return result

    real_symbols = [s for s in symbols if s.get("kind") != "re-export"]
    re_exports = [s for s in symbols if s.get("kind") == "re-export"]
    if verbose:
        print(f"    {len(real_symbols)} real symbols, {len(re_exports)} re-exports")

    # -- Clustering --------------------------------------------------------
    clusters = compute_clusters_smart(real_symbols, old_file, verbose=verbose)

    if verbose:
        print(f"    {len(clusters)} clusters after smart split")
        for ci, c in enumerate(clusters):
            names = [s.get("name", "?") for s in c]
            loc = sum(s.get("loc", 0) for s in c)
            print(
                f"      Cluster {ci}: {len(c)} syms, ~{loc} LOC — "
                f"{', '.join(names[:6])}{'…' if len(names) > 6 else ''}"
            )

    big = [c for c in clusters if len(c) >= MIN_CLUSTER_SIZE]
    small = [c for c in clusters if len(c) < MIN_CLUSTER_SIZE]
    misc_symbols = [s for sc in small for s in sc]

    if not big and not misc_symbols:
        result["skipped"] = True
        result["reason"] = "No clusters to create"
        return result

    # If no big clusters but there are misc symbols, nothing useful to split
    if not big:
        result["skipped"] = True
        result["reason"] = "No clusters with >= 2 symbols found"
        return result

    # -- Parse the _internal file ------------------------------------------
    import_lines, body_start = parse_import_section(all_lines)
    body_lines, trailing_exports = parse_trailing_exports(all_lines)
    body_end = len(body_lines)

    if verbose:
        print(f"    Imports end at line {body_start}, body ends at line {body_end}")
        print(f"    Trailing export lines removed: {len(trailing_exports)}")

    all_imports = parse_imports(import_lines)
    blocks = parse_declaration_blocks(all_lines, body_start, body_end)

    if verbose:
        print(f"    Parsed {len(blocks)} declaration blocks")

    # -- Generate output files ---------------------------------------------
    base_name = internal_path.replace("._internal.tsx", "").replace("._internal.ts", "")
    internal_dir = os.path.dirname(internal_path)
    stem = os.path.basename(base_name)

    cluster_outputs: list[tuple[str, str, list[dict]]] = []
    used_names: set[str] = set()

    for cluster in big:
        cname = name_cluster(cluster)
        orig = cname
        n = 2
        while cname in used_names:
            cname = f"{orig}-{n}"
            n += 1
        used_names.add(cname)

        ext = determine_extension(cluster)
        file_stem = f"{stem}.{cname}"
        file_path = os.path.join(internal_dir, f"{file_stem}{ext}")

        file_content = generate_cluster_file_content(cluster, blocks, all_imports, old_file)
        if file_content:
            cluster_outputs.append((cname, file_stem, cluster))
            result["new_files"].append(
                {"path": file_path, "symbols": len(cluster), "content": file_content}
            )

    # Misc bucket
    misc_file_name: Optional[str] = None
    misc_file_path: Optional[str] = None
    misc_content: Optional[str] = None
    if misc_symbols:
        ext = determine_extension(misc_symbols)
        misc_file_stem = f"{stem}.misc"
        misc_file_name = f"{misc_file_stem}{ext}"
        misc_file_path = os.path.join(internal_dir, misc_file_name)
        misc_content = generate_cluster_file_content(misc_symbols, blocks, all_imports, old_file)

    result["clusters"] = len(cluster_outputs) + (1 if misc_content else 0)

    # If nothing could actually be generated, skip
    if not cluster_outputs and not misc_content:
        result["skipped"] = True
        result["reason"] = (
            "No declaration blocks matched AST inventory symbols — "
            "file content may have diverged from the inventory"
        )
        return result

    barrel = generate_barrel_content(
        cluster_outputs,
        misc_symbols if misc_content else [],
        misc_file_name if misc_content else None,
    )

    # Safety check: never write an empty barrel that would lose all exports
    if not barrel.strip():
        result["skipped"] = True
        result["reason"] = "Generated barrel would be empty — aborting to prevent data loss"
        return result

    # -- Output / Write ----------------------------------------------------
    if dry_run:
        print(f"\n  === DRY RUN: {internal_path} ===")
        print(f"  Original: {result['original_lines']} lines")
        print(
            f"  Clusters: {len(cluster_outputs)}"
            + (f" + 1 misc ({len(misc_symbols)} syms)" if misc_content else "")
        )
        for nf in result["new_files"]:
            lc = nf["content"].count("\n")
            print(f"    → {nf['path']} ({nf['symbols']} symbols, ~{lc} lines)")
        if misc_content and misc_file_path:
            lc = misc_content.count("\n")
            print(f"    → {misc_file_path} ({len(misc_symbols)} symbols, ~{lc} lines)")
        print(f"  Barrel ({internal_path}):")
        for line in barrel.strip().split("\n")[:20]:
            print(f"    {line}")
        if barrel.count("\n") > 20:
            print(f"    … ({barrel.count(chr(10))} total lines)")
    else:
        for nf in result["new_files"]:
            print(f"    Writing {nf['path']}…")
            os.makedirs(os.path.dirname(nf["path"]), exist_ok=True)
            with open(nf["path"], "w") as fh:
                fh.write(nf["content"])
        if misc_content and misc_file_path:
            print(f"    Writing {misc_file_path}…")
            with open(misc_file_path, "w") as fh:
                fh.write(misc_content)
        print(f"    Rewriting {internal_path} as barrel…")
        with open(internal_path, "w") as fh:
            fh.write(barrel)

    return result


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Decompose large _internal files into smaller helper modules"
    )
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing")
    parser.add_argument("--file", type=str, default=None, help="Process a single file")
    parser.add_argument("--verbose", "-v", action="store_true", help="Print diagnostics")
    args = parser.parse_args()

    for path in (SYMBOLS_JSONL, SYMBOL_DEPS_JSONL):
        if not os.path.isfile(path):
            print(f"ERROR: {path} not found. Run AST inventory first.", file=sys.stderr)
            sys.exit(1)

    targets = [args.file] if args.file else sorted(NEW_TO_OLD.keys())
    print(f"{'DRY RUN: ' if args.dry_run else ''}Decomposing {len(targets)} _internal file(s)…\n")

    results: list[dict] = []
    for target in targets:
        print(f"Processing: {target}")
        r = decompose_file(target, dry_run=args.dry_run, verbose=args.verbose)
        if r["skipped"]:
            print(f"  SKIPPED: {r['reason']}")
        else:
            nf = len(r["new_files"])
            print(f"  ✓ {r['original_lines']} lines → {r['clusters']} clusters, {nf} new files")
        results.append(r)
        print()

    # -- Summary -----------------------------------------------------------
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    processed = [r for r in results if not r["skipped"]]
    skipped = [r for r in results if r["skipped"]]
    print(f"Processed: {len(processed)} files")
    print(f"Skipped:   {len(skipped)} files")

    if processed:
        total_orig = sum(r["original_lines"] for r in processed)
        total_new = sum(len(r["new_files"]) for r in processed)
        print(f"Total original lines: {total_orig}")
        print(f"Total new files created: {total_new}")
        print("\nBreakdown:")
        for r in processed:
            nf = len(r["new_files"])
            print(f"  {r['file']}: {r['original_lines']} lines → {r['clusters']} clusters, {nf} new files")
            for f in r["new_files"]:
                lc = f["content"].count("\n")
                print(f"    → {f['path']} ({f['symbols']} symbols, ~{lc} lines)")

    if skipped:
        print("\nSkipped:")
        for r in skipped:
            print(f"  {r['file']}: {r['reason']}")

    if args.dry_run:
        print(f"\n{'=' * 60}")
        print("This was a DRY RUN. No files were written.")
        print("Run without --dry-run to apply changes.")


if __name__ == "__main__":
    main()
