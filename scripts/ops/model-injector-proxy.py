#!/usr/bin/env python3

"""Compatibility shim for the canonical integration-owned model injector proxy."""

from pathlib import Path
from runpy import run_path


if __name__ == "__main__":
    target = Path(__file__).resolve().parent / "integrations" / "model" / "model-injector-proxy.py"
    run_path(str(target), run_name="__main__")
