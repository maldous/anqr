#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re
from typing import Dict, List, Optional

FILES = [
    Path("en-GB/examples.ts"),
    Path("en-GB/learn.ts"),
]

# Optional: resolve numeric string IDs via en-GB.txt (supports common formats: "123=...", "123: ...", "123 ...")
TXT_FILE = Path("txt/en-GB.txt")

STYLE_ANCHOR_BLOCK = """
Use the premium, high-end minimalist vector key-visual from the attached ANQR illustration style anchor.

Hard constraints (must be strictly enforced):
- Background must be pure white (#FFFFFF). Absolutely no gradients, no textures, no vignettes.
- NO text of any kind may appear in the image (no letters, numbers, symbols, signage, UI text).
- No logos, no brand names.

Art direction:
- High-end minimalist vector illustration with subtle film-grain texture on shapes only (very light, not noisy)
- Crisp geometric forms, consistent stroke weight, high contrast
- Soft directional lighting with gentle shadow falloff (minimal shadows, not harsh)
- Clean negative space, no clutter; polished editorial/tech-marketing feel
- Limited palette: near-black + off-white neutrals + ONE accent color used sparingly to add depth and “3D” pop

Composition:
- 16:9 poster / hero layout
- Primary subject anchored left-of-center with clear focal hierarchy

Illustrate concept (ANQR scenario):
{concept}

Scene context (caption):
{caption}

Output quality:
- Sharp edges, no blur, no photorealism
- Suitable for premium landing-page marketing visuals

FAILSAFE:
If ANY text, symbols, numbers, logos, gradients, or non-white background appear,
the image is INVALID and must be regenerated.
""".strip()

# String literal matcher that DOES handle escaped quotes like: doesn\'t, \"COVID\"
STR_SQ = r"'(?:\\.|[^'\\])*'"
STR_DQ = r'"(?:\\.|[^"\\])*"'
STR_BT = r"`(?:\\.|[^`\\])*`"
STR = rf"(?:{STR_BT}|{STR_SQ}|{STR_DQ})"

FIELD_RE = {
    "title": re.compile(rf"\btitle\s*:\s*(?P<v>{STR})", re.S),
    "description": re.compile(rf"\bdescription\s*:\s*(?P<v>{STR})", re.S),
    "heading": re.compile(rf"\bheading\s*:\s*(?P<v>{STR})", re.S),
    "src": re.compile(rf"\bsrc\s*:\s*(?P<v>{STR})", re.S),
    "alt": re.compile(rf"\balt\s*:\s*(?P<v>{STR})", re.S),
    "caption": re.compile(rf"\bcaption\s*:\s*(?P<v>{STR})", re.S),
}

SECTIONS_BLOCK_RE = re.compile(r"\bsections\s*:\s*\[", re.S)
IMAGES_BLOCK_RE = re.compile(r"\bimages\s*:\s*\[", re.S)
PARAGRAPHS_BLOCK_RE = re.compile(r"\bparagraphs\s*:\s*\[", re.S)

def load_txt_map(path: Path) -> Dict[str, str]:
    if not path.exists():
        return {}
    out: Dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"^(\d+)[:=](.*)", line)
        if not m:
            m = re.match(r"^(\d+) +(.*)", line)
        if m:
            out[m.group(1)] = m.group(2).strip()
    return out

TXT_MAP = load_txt_map(TXT_FILE)

def ts_unquote(raw: str) -> str:
    """Remove surrounding quotes/backticks and unescape common TS escapes."""
    raw = raw.strip()
    if len(raw) >= 2 and raw[0] in "'\"`" and raw[-1] == raw[0]:
        raw = raw[1:-1]
    raw = raw.replace(r"\\", "\\")
    raw = raw.replace(r"\'", "'").replace(r"\"", '"').replace(r"\`", "`")
    raw = raw.replace(r"\n", " ").replace(r"\r", " ").replace(r"\t", " ")
    raw = re.sub(r"\s+", " ", raw).strip()
    return raw

def resolve_txt_id(s: str) -> str:
    # If s is purely digits, try resolve via en-GB.txt map.
    if s.isdigit() and s in TXT_MAP:
        return TXT_MAP[s]
    return s

def find_matching(text: str, start: int, open_ch: str, close_ch: str) -> int:
    """Return index of matching close_ch for the open_ch at start."""
    depth = 0
    i = start
    in_str: Optional[str] = None
    escape = False

    while i < len(text):
        ch = text[i]

        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_str:
                in_str = None
            i += 1
            continue

        if ch in ("'", '"', "`"):
            in_str = ch
            i += 1
            continue

        if ch == open_ch:
            depth += 1
        elif ch == close_ch:
            depth -= 1
            if depth == 0:
                return i
        i += 1

    raise ValueError(f"No matching {close_ch} found for {open_ch} at {start}")

def extract_top_level_objects(block: str) -> List[str]:
    """Extract top-level { ... } objects from a block (string-safe)."""
    objs: List[str] = []
    i = 0
    depth = 0
    in_str: Optional[str] = None
    escape = False
    start_idx: Optional[int] = None

    while i < len(block):
        ch = block[i]

        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_str:
                in_str = None
            i += 1
            continue

        if ch in ("'", '"', "`"):
            in_str = ch
            i += 1
            continue

        if ch == "{":
            if depth == 0:
                start_idx = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and start_idx is not None:
                objs.append(block[start_idx : i + 1])
                start_idx = None

        i += 1

    return objs

def get_field(obj: str, name: str) -> str:
    m = FIELD_RE[name].search(obj)
    if not m:
        return ""
    return resolve_txt_id(ts_unquote(m.group("v")))

def extract_array_block(obj: str, arr_re: re.Pattern) -> str:
    m = arr_re.search(obj)
    if not m:
        return ""
    lb = obj.find("[", m.end() - 1)
    if lb == -1:
        return ""
    rb = find_matching(obj, lb, "[", "]")
    return obj[lb + 1 : rb]

def extract_string_literals(block: str) -> List[str]:
    # Find all TS string literals in order and unquote/resolve them.
    lits = re.findall(STR, block, flags=re.S)
    return [resolve_txt_id(ts_unquote(x)) for x in lits]

def extract_sections(text: str) -> List[str]:
    secs: List[str] = []
    for m in SECTIONS_BLOCK_RE.finditer(text):
        lb = text.find("[", m.end() - 1)
        rb = find_matching(text, lb, "[", "]")
        block = text[lb + 1 : rb]
        secs.extend(extract_top_level_objects(block))
    return secs

def shorten(s: str, limit: int = 480) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    if len(s) <= limit:
        return s
    return s[: limit - 1].rstrip() + "…"

for file in FILES:
    text = file.read_text(encoding="utf-8")

    for section in extract_sections(text):
        heading = get_field(section, "heading")
        paragraphs_block = extract_array_block(section, PARAGRAPHS_BLOCK_RE)
        paragraphs = extract_string_literals(paragraphs_block) if paragraphs_block else []

        images_block = extract_array_block(section, IMAGES_BLOCK_RE)
        if not images_block:
            continue

        for img_obj in extract_top_level_objects(images_block):
            src = get_field(img_obj, "src")
            alt = get_field(img_obj, "alt")
            caption = get_field(img_obj, "caption")

            if not src:
                continue

            # Concept uses ALT by default (what you want illustrated), falls back to heading.
            concept = alt or heading or "Generic ANQR QR code usage scenario"

            # Build richer caption payload using: caption + heading + key paragraph(s) + alt.
            bits: List[str] = []
            if caption:
                bits.append(caption)
            if heading:
                bits.append(f"Section heading: {heading}")
            if paragraphs:
                # Use first 1–2 paragraphs for context.
                ctx = " ".join(paragraphs[:2])
                bits.append(f"Supporting context: {shorten(ctx)}")
            if alt:
                bits.append(f"Alt (visual intent): {alt}")

            caption_text = "\n".join(bits) if bits else "(missing caption/section context in source file)"

            prompt = STYLE_ANCHOR_BLOCK.format(concept=concept, caption=caption_text)
            print(f"{src}: {prompt}\n\n--\n")

