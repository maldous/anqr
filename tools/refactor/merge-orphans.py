#!/usr/bin/env python3
"""Merge orphaned decomposed helper files back into their parent _internal files."""

import os
import re

ORPHANS = {
    "src/domain/qr/qart/generate.build-and-validate-basis.ts": "src/domain/qr/qart/generate._internal.tsx",
    "src/domain/qr/qart/generate.filter-selections-for-numeric-suffix.ts": "src/domain/qr/qart/generate._internal.tsx",
    "src/domain/qr/qart/generate.handle-scan-failure-fallback.ts": "src/domain/qr/qart/generate._internal.tsx",
    "src/domain/qr/qart/generate.validate-final-matrix-diagnostics.ts": "src/domain/qr/qart/generate._internal.tsx",
    "src/domain/render/generator/pixel-matrix-dithered.generate-bw-first-matrix.ts": "src/domain/render/generator/pixel-matrix-dithered._internal.tsx",
    "src/domain/render/generator/pixel-matrix-dithered.init-constraint-context.ts": "src/domain/render/generator/pixel-matrix-dithered._internal.tsx",
    "src/features/analyze/components/content-type-renderers.build-geo-details.tsx": "src/features/analyze/components/content-type-renderers._internal.tsx",
    "src/hooks/useQRGenerator.download-svg-format.ts": "src/hooks/useQRGenerator._internal.tsx",
    "src/hooks/useQRGenerator.execute-frame-generation-loop.ts": "src/hooks/useQRGenerator._internal.tsx",
    "src/hooks/useQRGenerator.execute-q-art-worker-pipeline.ts": "src/hooks/useQRGenerator._internal.tsx",
    "src/hooks/useQRGenerator.process-animation-frame-loop-iteration.ts": "src/hooks/useQRGenerator._internal.tsx",
    "src/hooks/useQRGenerator.run-q-art-generation.ts": "src/hooks/useQRGenerator._internal.tsx",
    "src/hooks/useQRGenerator.use-qr-generator.ts": "src/hooks/useQRGenerator._internal.tsx",
}


def parse_sections(filepath):
    with open(filepath) as f:
        lines = f.readlines()
    import_lines = []
    body_start = 0
    i = 0
    while i < len(lines):
        stripped = lines[i].strip()
        if not stripped:
            i += 1
            continue
        if stripped.startswith("import ") or stripped.startswith("import{"):
            start = i
            depth = stripped.count("{") - stripped.count("}")
            while depth > 0 and i + 1 < len(lines):
                i += 1
                depth += lines[i].count("{") - lines[i].count("}")
            for j in range(start, i + 1):
                import_lines.append(lines[j].rstrip("\n"))
            body_start = i + 1
            i += 1
        elif stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
            peek = i + 1
            while peek < len(lines) and (not lines[peek].strip() or lines[peek].strip().startswith("//") or lines[peek].strip().startswith("*")):
                peek += 1
            if peek < len(lines) and (lines[peek].strip().startswith("import ") or lines[peek].strip().startswith("import{")):
                i += 1
            else:
                break
        else:
            break
    body_lines = [l.rstrip("\n") for l in lines[body_start:]]
    while body_lines and not body_lines[-1].strip():
        body_lines.pop()
    return import_lines, body_lines


def normalize_import(stmt):
    return re.sub(r"\s+", " ", stmt.strip())


def merge_into(parent_path, orphan_path):
    p_imports, p_body = parse_sections(parent_path)
    o_imports, o_body = parse_sections(orphan_path)

    existing = set()
    for imp in p_imports:
        existing.add(normalize_import(imp))

    new_imports = []
    i = 0
    while i < len(o_imports):
        stmt_lines = [o_imports[i]]
        depth = o_imports[i].count("{") - o_imports[i].count("}")
        while depth > 0 and i + 1 < len(o_imports):
            i += 1
            stmt_lines.append(o_imports[i])
            depth += o_imports[i].count("{") - o_imports[i].count("}")
        stmt = "\n".join(stmt_lines)
        if normalize_import(stmt) not in existing:
            new_imports.extend(stmt_lines)
            existing.add(normalize_import(stmt))
        i += 1

    parts = []
    all_imports = p_imports + new_imports
    if all_imports:
        parts.extend(all_imports)
        parts.append("")
    parts.extend(p_body)
    if o_body:
        parts.append("")
        parts.extend(o_body)

    content = "\n".join(parts).rstrip() + "\n"
    with open(parent_path, "w") as f:
        f.write(content)
    os.remove(orphan_path)
    return len(o_body)


def main():
    print(f"Merging {len(ORPHANS)} orphaned helper files...\n")
    by_parent = {}
    for orphan, parent in ORPHANS.items():
        by_parent.setdefault(parent, []).append(orphan)

    for parent, orphans in sorted(by_parent.items()):
        print(f"  {parent}:")
        for orphan in orphans:
            body_lines = merge_into(parent, orphan)
            print(f"    ← merged {orphan} ({body_lines} body lines)")
        with open(parent) as f:
            total = f.read().count("\n")
        print(f"    → total: {total} lines\n")

    print(f"Done. Merged {len(ORPHANS)} orphans into their parent _internal files.")


if __name__ == "__main__":
    main()
