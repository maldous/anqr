#!/usr/bin/env python3
"""Fail if xlate.json is missing any keys relative to en-US.json."""
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
if missing:
    print(f"ERROR: xlate.json missing {len(missing)} keys vs en-US.json")
    for k in missing[:20]:
        print(f"  {k}")
    if len(missing) > 20:
        print(f"  ... and {len(missing) - 20} more")
    sys.exit(1)

print("i18n-check passed: xlate.json in sync with en-US.json")
