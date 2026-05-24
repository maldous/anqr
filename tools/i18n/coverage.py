#!/usr/bin/env python3
"""Show translation coverage (leaf key count) for each locale."""
import json
import os
import glob

SOURCE = "apps/web/src/i18n/locales/en-US.json"
LOCALES = "apps/web/src/i18n/locales"


def count(obj):
    return sum(count(v) for v in obj.values()) if isinstance(obj, dict) else 1


total = count(json.load(open(SOURCE)))
print(f"en-US: {total} keys (100%)")
print("─" * 40)

rows = []
for path in sorted(glob.glob(f"{LOCALES}/*.json")):
    loc = os.path.basename(path).replace(".json", "")
    if loc in ("en-US", "xlate"):
        continue
    n = count(json.load(open(path)))
    rows.append((n, loc))

rows.sort()
for n, loc in rows:
    bar = "█" * int(40 * n / total)
    print(f"{loc:12} {n:4d}/{total}  {n * 100 // total:3d}%  {bar}")
