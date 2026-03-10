#!/usr/bin/env python3
"""
fill_template.py

Usage:
  ./fill_template.py hi.txt

Reads:
  - template.json : JSON where translatable strings have been replaced by id strings (e.g. "12")
  - txt/<arg1>   : lines like: <id><TAB><translated string as JSON string OR raw text>

Writes:
  - <language>.json (e.g., txt/hi.txt -> hi.json)
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any, Dict


ID_RE = re.compile(r"^\s*(\d+)\s*(?:[\t,]|\s{2,})\s*(.+?)\s*$")


def normalize_quotes(s: str) -> str:
    """Normalize curly/smart quotes to straight quotes.
    
    For JSON strings (starting and ending with "), inner curly quotes
    are escaped as \" to preserve valid JSON syntax.
    """
    # Check if this is a JSON string (starts and ends with straight double quote)
    if s.startswith('"') and s.endswith('"') and len(s) >= 2:
        # For JSON strings, escape inner curly double quotes as \"
        inner = s[1:-1]
        inner = inner.replace("\u201c", '\\"').replace("\u201d", '\\"')
        # Single curly quotes can be replaced directly (they don't break JSON)
        inner = inner.replace("\u2018", "'").replace("\u2019", "'")
        return '"' + inner + '"'
    else:
        # For non-JSON strings, simple replacement
        s = s.replace("\u201c", '"').replace("\u201d", '"')
        s = s.replace("\u2018", "'").replace("\u2019", "'")
        return s


def parse_translation_rhs(rhs: str, *, path: str, line_no: int) -> str:
    rhs = rhs.strip()
    if rhs == "":
        return ""
    # Normalize smart/curly quotes to straight quotes before processing
    rhs = normalize_quotes(rhs)
    try:
        if rhs.startswith('"') and rhs.endswith('"'):
            return json.loads(rhs)  # JSON string
        if rhs.startswith(("{", "[")) and rhs.endswith(("}", "]")):
            return json.dumps(json.loads(rhs), ensure_ascii=False)
        return rhs
    except json.JSONDecodeError as e:
        raise ValueError(
            f"{path}:{line_no}: invalid JSON in translation: {rhs!r}\n{e}"
        ) from e

def load_translations(path: str) -> Dict[str, str]:
    """
    Returns mapping: id(str) -> translated text
    Ignores blank lines and comment lines starting with # or //.
    """
    out: Dict[str, str] = {}
    for line_no, line in enumerate(Path(path).read_text(encoding="utf-8").splitlines(), start=1):
        s = line.strip()
        if not s or s.startswith("#") or s.startswith("//"):
            continue
        m = ID_RE.match(line)
        if not m:
            raise ValueError(f"{path}:{line_no}: can't parse line: {line!r}")
        _id, rhs = m.group(1), m.group(2)
        if _id in out:
            raise ValueError(f"{path}:{line_no}: duplicate id {_id}")
        out[_id] = parse_translation_rhs(rhs, path=path, line_no=line_no)
    return out


def fill(node: Any, id2txt: Dict[str, str], *, path: str = "$") -> Any:
    if isinstance(node, dict):
        new_obj: Dict[str, Any] = {}
        for k, v in node.items():
            # keys might be ids (strings of digits) OR preserved strings
            new_k = id2txt.get(k, k) if isinstance(k, str) and k.isdigit() else k

            if new_k in new_obj:
                raise ValueError(f"Duplicate key after translation at {path}: {new_k!r}")

            new_obj[new_k] = fill(v, id2txt, path=f"{path}.{new_k}")
        return new_obj

    if isinstance(node, list):
        return [fill(x, id2txt, path=f"{path}[{i}]") for i, x in enumerate(node)]

    if isinstance(node, str) and node.isdigit():
        if node not in id2txt:
            raise KeyError(f"Missing translation for id {node} at {path}")
        return id2txt[node]

    return node


def main(argv: list[str]) -> int:
    if len(argv) != 2 or argv[1] in ("-h", "--help"):
        sys.stderr.write("Usage: fill_template.py <translations.txt>\n")
        sys.stderr.write("Reads template.json; writes to <lang>.json\n")
        return 2

    # Get the directory where this script lives
    script_dir = Path(__file__).parent
    
    template_path = script_dir / "template.json"
    translated_xlate_path = script_dir / "txt" / argv[1]

    # Derive language code from input filename (e.g., 'hi' from 'hi.txt')
    lang_code = Path(argv[1]).stem
    out_path = script_dir / f"{lang_code}.json"

    templ = json.loads(Path(template_path).read_text(encoding="utf-8"))
    id2txt = load_translations(translated_xlate_path)

    filled = fill(templ, id2txt)

    out_path.write_text(json.dumps(filled, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))

