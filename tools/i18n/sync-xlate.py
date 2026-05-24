#!/usr/bin/env python3
"""Add keys missing from xlate.json (copies values from en-US.json)."""
import json

SOURCE = "apps/web/src/i18n/locales/en-US.json"
XLATE = "apps/web/src/i18n/locales/xlate.json"


def merge(base, patch):
    """Deep-merge patch into base, adding only missing keys."""
    result = dict(base)
    for k, v in patch.items():
        if k not in result:
            result[k] = v
        elif isinstance(v, dict) and isinstance(result.get(k), dict):
            result[k] = merge(result[k], v)
    return result


en = json.load(open(SOURCE))
xl = json.load(open(XLATE))
merged = merge(xl, en)

with open(XLATE, "w") as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)
    f.write("\n")

print("xlate.json updated — run 'make i18n-diff' to verify")
