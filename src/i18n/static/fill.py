#!/usr/bin/env python3
"""
fill_ts.py (MULTI-FILE, TS templates)

Usage:
  ./fill_ts.py en.txt

Reads (in txt/ subdir):
  - txt/template-*.ts : TS templates where translatable string literals were replaced by id string literals.
  - txt/<arg1>        : lines like: <id><TAB><translated string as JSON string OR raw text>

Writes:
  - <lang>/<stem>.ts  : for each template-<stem>.ts, emits <stem>.ts with ids replaced by translated
                        strings, preserving the original quote style (', ", `).
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple


ID_LINE_RE = re.compile(r"^\s*(\d+)(?:[\t,]|\s{2,})(\S.*)$")
ID_ONLY_RE = re.compile(r"^\d+$")


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
        # show exact offending line + a caret at the JSON error column
        caret = " " * (e.pos if isinstance(e.pos, int) else 0) + "^"
        raise ValueError(
            f"{path}:{line_no}: invalid JSON in translation\n"
            f"  rhs: {rhs}\n"
            f"       {caret}\n"
            f"  error: {e}"
        ) from e

def load_translations(path: str) -> Dict[str, str]:
    out: Dict[str, str] = {}
    for line_no, line in enumerate(Path(path).read_text(encoding="utf-8").splitlines(), start=1):
        s = line.strip()
        if not s or s.startswith("#") or s.startswith("//"):
            continue
        m = ID_LINE_RE.match(line)
        if not m:
            raise ValueError(f"{path}:{line_no}: can't parse line: {line!r}")
        _id, rhs = m.group(1), m.group(2)
        if _id in out:
            raise ValueError(f"{path}:{line_no}: duplicate id {_id}")
        out[_id] = parse_translation_rhs(rhs, path=path, line_no=line_no)
    return out


def js_escape_for_quote(s: str, quote: str) -> str:
    # escape backslashes first
    s = s.replace("\\", "\\\\")
    # normalize newlines/tabs
    s = s.replace("\r", "\\r").replace("\n", "\\n").replace("\t", "\\t")
    if quote == "'":
        s = s.replace("'", "\\'")
    elif quote == '"':
        s = s.replace('"', '\\"')
    elif quote == "`":
        s = s.replace("`", "\\`")
        # IMPORTANT: do NOT escape ${...} in template literals; we want interpolation to work.
    return s


def find_export_object_span(text: str) -> Tuple[int, int]:
    export_idx = text.find("export const")
    if export_idx == -1:
        raise ValueError("No 'export const' found")

    eq_idx = text.find("=", export_idx)
    if eq_idx == -1:
        raise ValueError("No '=' after 'export const'")

    start = text.find("{", eq_idx)
    if start == -1:
        raise ValueError("No '{' after '='")

    i = start
    depth = 0
    in_line_comment = False
    in_block_comment = False
    in_str = False
    str_q = ""

    while i < len(text):
        ch = text[i]

        if in_str:
            if ch == "\\":
                i += 2
                continue
            if ch == str_q:
                in_str = False
                str_q = ""
            i += 1
            continue

        if in_line_comment:
            if ch == "\n":
                in_line_comment = False
            i += 1
            continue

        if in_block_comment:
            if ch == "*" and i + 1 < len(text) and text[i + 1] == "/":
                in_block_comment = False
                i += 2
            else:
                i += 1
            continue

        if ch == "/" and i + 1 < len(text):
            nxt = text[i + 1]
            if nxt == "/":
                in_line_comment = True
                i += 2
                continue
            if nxt == "*":
                in_block_comment = True
                i += 2
                continue

        if ch in ("'", '"', "`"):
            in_str = True
            str_q = ch
            i += 1
            continue

        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return (start, i + 1)

        i += 1

    raise ValueError("Unbalanced braces while locating exported object")


def scan_string_literals(text: str, start: int, end: int) -> List[Tuple[int, int, str, str]]:
    """
    Returns (abs_start, abs_end, quote_char, raw_inside_without_quotes)
    """
    res: List[Tuple[int, int, str, str]] = []
    i = start
    in_line_comment = False
    in_block_comment = False

    while i < end:
        ch = text[i]

        if in_line_comment:
            if ch == "\n":
                in_line_comment = False
            i += 1
            continue

        if in_block_comment:
            if ch == "*" and i + 1 < end and text[i + 1] == "/":
                in_block_comment = False
                i += 2
            else:
                i += 1
            continue

        if ch == "/" and i + 1 < end:
            nxt = text[i + 1]
            if nxt == "/":
                in_line_comment = True
                i += 2
                continue
            if nxt == "*":
                in_block_comment = True
                i += 2
                continue

        if ch in ("'", '"', "`"):
            q = ch
            j = i + 1
            raw: List[str] = []
            while j < end:
                cj = text[j]
                if cj == "\\":
                    if j + 1 < end:
                        raw.append(text[j])
                        raw.append(text[j + 1])
                        j += 2
                        continue
                    raw.append("\\")
                    j += 1
                    continue
                if cj == q:
                    res.append((i, j + 1, q, "".join(raw)))
                    i = j + 1
                    break
                raw.append(cj)
                j += 1
            else:
                break
            continue

        i += 1

    return res


def main(argv: List[str]) -> int:
    if len(argv) != 2 or argv[1] in ("-h", "--help"):
        sys.stderr.write("Usage: fill_ts.py <translations.txt>\n")
        sys.stderr.write("Reads template-*.ts in the current directory; writes filled-*.ts.\n")
        return 2

    # Get the directory where this script lives
    script_dir = Path(__file__).parent
    txt_dir = script_dir / "txt"
    
    translations_path = txt_dir / argv[1]
    id2txt = load_translations(str(translations_path))

    # Derive language code from the translations file name (e.g. 'en-GB' from 'en-GB.txt')
    lang_code = Path(argv[1]).stem
    out_dir = script_dir / lang_code
    out_dir.mkdir(parents=True, exist_ok=True)

    templates = sorted(txt_dir.glob("template-*.ts"))
    if not templates:
        raise SystemExit("No template-*.ts files found in the current directory.")

    # Track all missing IDs across all templates
    missing_ids: Dict[str, List[str]] = {}  # template -> list of missing ids

    for tp in templates:
        txt = tp.read_text(encoding="utf-8")
        span = find_export_object_span(txt)
        lits = scan_string_literals(txt, span[0], span[1])

        out_txt = txt
        repls: List[Tuple[int, int, str]] = []

        for a, b, q, raw in lits:
            raw_s = raw.strip()
            if not ID_ONLY_RE.match(raw_s):
                continue
            _id = raw_s
            if _id not in id2txt:
                # Skip missing IDs but track them for reporting
                if tp.name not in missing_ids:
                    missing_ids[tp.name] = []
                missing_ids[tp.name].append(_id)
                continue
            tr = id2txt[_id]
            rep = f"{q}{js_escape_for_quote(tr, q)}{q}"
            repls.append((a, b, rep))

        for a, b, rep in sorted(repls, key=lambda t: t[0], reverse=True):
            out_txt = out_txt[:a] + rep + out_txt[b:]

        # Write filled TS files into the language directory one level up (../<lang>/)
        out_path = out_dir / tp.name.replace("template-", "", 1)
        out_path.write_text(out_txt, encoding="utf-8")

    # Report all missing IDs at the end
    if missing_ids:
        sys.stderr.write(f"\nError: Missing translation IDs in {translations_path}:\n")
        for tpl, ids in sorted(missing_ids.items()):
            sys.stderr.write(f"  {tpl}: {', '.join(ids)}\n")
        sys.stderr.write("\nThese IDs are used in templates but not defined in the translations file.\n")
        sys.stderr.write("Please add them to the translations file or remove them from the templates.\n")
        return 1

    print(f"Wrote {len(templates)} files to {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))

