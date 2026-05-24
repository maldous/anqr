#!/usr/bin/env python3
"""Show keys present in en-US.json but missing from xlate.json."""
import json
import sys

SOURCE = "apps/web/src/i18n/locales/en-US.json"
XLATE = "apps/web/src/i18n/locales/xlate.json"


def flatten(obj, prefix=""):
    result = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            result.update(flatten(v, f"{prefix}.{k}" if prefix else k))
    else:
        result[prefix] = obj
    return result


en = set(flatten(json.load(open(SOURCE))).keys())
xl = set(flatten(json.load(open(XLATE))).keys())

missing = sorted(en - xl)
extra = sorted(xl - en)

if not missing and not extra:
    print("xlate.json is in sync with en-US.json")
    sys.exit(0)

if missing:
    print(f"Missing from xlate ({len(missing)}):")
    for k in missing:
        print(f"  {k}")

if extra:
    print(f"\nIn xlate but not en-US ({len(extra)}):")
    for k in extra:
        print(f"  {k}")
