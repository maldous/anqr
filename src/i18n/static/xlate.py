#!/usr/bin/env python3
from __future__ import annotations

class RateLimited(Exception):
    """Raised when an upstream translation service is rate-limiting or blocking us."""

# If Google rate-limits once, disable Google for remainder of the run (instant skip).
GOOGLE_DISABLED: bool = False
GOOGLE_DISABLED_REASON: str = ""

"""
xlate.py

Translate en-GB.txt into locale .txt files.

Key features (opinionated for reliability):
- Uses Google Translate (unofficial gtx endpoint — free, no API key required)
- Batch mode with numbered markers so we can split reliably
- Placeholder protection for common i18n patterns
- Never writes empty placeholder files; never deletes existing files on failure
- Atomic writes

File format:
  <id>\t"<text with escaped quotes>"
"""

import argparse
import concurrent.futures as cf
import random
import re
import time
from pathlib import Path
from typing import Dict, List, Tuple

import requests

DEFAULT_WORKERS = 1
DEFAULT_BATCH_SIZE = 25
DEFAULT_MAX_CHARS = 3500
DEFAULT_QPS = 0.8

DEBUG = False

SEP_MARK_RE = re.compile(r"\[\[\[\s*ANQR(\d+)\s*\]\]\]")

# Protect placeholders: {name}, {0}, {{var}}, %s, %d, %(name)s, %1$s, :name
PH_RE = re.compile(
    r"(\{\{[^{}]+\}\}|\{[^{}]+\}|%\([^)]+\)[sd]|%[0-9]+\$[sd]|%[sd]|:[A-Za-z_][A-Za-z0-9_]*|__ANQR_[A-Z0-9_]+__)",
    re.UNICODE,
)

def safe_print(*a: object, **k: object) -> None:
    print(*a, **k, flush=True)

def escape_quotes(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')

def unescape_quotes(s: str) -> str:
    # supports our writer: \" and \\ only
    return s.replace('\\"', '"').replace("\\\\", "\\")

def parse_txt_file(path: Path) -> Dict[int, str]:
    out: Dict[int, str] = {}
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line:
            continue
        m = re.match(r"^(\d+)\t\"(.*)\"$", line)
        if not m:
            continue
        k = int(m.group(1))
        v = unescape_quotes(m.group(2))
        out[k] = v
    return out

def write_txt_file_atomic(path: Path, mapping: Dict[int, str]) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.parent.mkdir(parents=True, exist_ok=True)
    lines: List[str] = []
    for k in sorted(mapping.keys()):
        lines.append(f'{k}\t"{escape_quotes(mapping[k])}"')
    tmp.write_text("\n".join(lines) + "\n", encoding="utf-8")
    tmp.replace(path)

def protect(s: str) -> Tuple[str, Dict[str, str]]:
    """
    Replace placeholders with tokens unlikely to be altered by translators.
    """
    repl: Dict[str, str] = {}
    idx = 0

    def sub(m: re.Match[str]) -> str:
        nonlocal idx
        tok = f"__ANQR_PH_{idx}__"
        repl[tok] = m.group(0)
        idx += 1
        return tok

    return PH_RE.sub(sub, s), repl

def unprotect(s: str, repl: Dict[str, str]) -> str:
    for tok, orig in repl.items():
        s = s.replace(tok, orig)
    return s

class RateLimiter:
    def __init__(self, qps: float):
        self.qps = max(0.001, qps)
        self.min_interval = 1.0 / self.qps
        self._next = time.monotonic()
        self._lock = None

    def wait(self) -> None:
        # single-thread friendly
        now = time.monotonic()
        if now < self._next:
            time.sleep(self._next - now)
        self._next = time.monotonic() + self.min_interval

class GoogleGTXEngine:
    """
    Google Translate (unofficial) using translate.googleapis.com with client=gtx.
    No API key required. Batch mode uses markers and join/split.
    """
    def __init__(self, batch_size: int = DEFAULT_BATCH_SIZE):
        self._session = requests.Session()
        self.batch_size = int(max(1, batch_size))

    def normalize_target(self, target: str) -> str:
        # gtx accepts BCP47-ish; keep base for most.
        return target.replace("_", "-").strip()

    def translate_batch(self, texts: List[str], target_norm: str, limiter: RateLimiter, max_chars: int) -> List[str]:
        endpoint = "https://translate.googleapis.com/translate_a/single"

        def gtx_translate(q: str) -> str:
            # Use GET; requests handles encoding
            params = {
                "client": "gtx",
                "sl": "en",
                "tl": target_norm,
                "dt": "t",
                "q": q,
            }
            global GOOGLE_DISABLED, GOOGLE_DISABLED_REASON
            if GOOGLE_DISABLED:
                raise RateLimited(GOOGLE_DISABLED_REASON or 'google disabled')

            limiter.wait()
            r = self._session.get(endpoint, params=params, timeout=60)

            # Instant skip on quota / rate limit / temporary unavailable (disable for rest of run)
            if r.status_code in (429, 503, 403):
                GOOGLE_DISABLED = True
                GOOGLE_DISABLED_REASON = f"google rate limited/block (HTTP {r.status_code})"
                raise RateLimited(GOOGLE_DISABLED_REASON)

            r.raise_for_status()
            data = r.json()
            # data[0] is list of [translated, original, ...]
            chunks = []
            for part in (data[0] or []):
                if part and isinstance(part, list):
                    chunks.append(part[0] or "")
            return "".join(chunks)

        def mk_payload(batch: List[str]) -> Tuple[str, int]:
            markers = [f"[[[ANQR{i}]]]" for i in range(len(batch))]
            parts: List[str] = []
            for m, s in zip(markers, batch):
                parts.append(m)
                parts.append(s)
            joined = "\n".join(parts)
            return joined, len(batch)

        def parse_payload(out: str, n: int) -> List[str]:
            matches = list(SEP_MARK_RE.finditer(out))
            if len(matches) < n:
                return []
            segs: Dict[int, str] = {}
            for i, m in enumerate(matches):
                idx = int(m.group(1))
                start = m.end()
                end = matches[i + 1].start() if i + 1 < len(matches) else len(out)
                segs[idx] = out[start:end].strip("\n ").rstrip()
            return [segs.get(i, "") for i in range(n)]

        results: List[str] = []
        i = 0
        while i < len(texts):
            batch = texts[i : i + self.batch_size]
            joined, n = mk_payload(batch)

            # Hard limit join size
            if len(joined) > max_chars and len(batch) > 1:
                # split batch
                mid = max(1, len(batch) // 2)
                results.extend(self.translate_batch(batch[:mid], target_norm, limiter, max_chars))
                results.extend(self.translate_batch(batch[mid:], target_norm, limiter, max_chars))
                i += len(batch)
                continue

            try:
                out = gtx_translate(joined)
                parts = parse_payload(out, n)
                if len(parts) != n:
                    if DEBUG:
                        safe_print(f"  [google] marker parse failed; falling back to per-item ({target_norm})")
                    raise ValueError("marker-parse-failed")
                # If some entries come back empty, translate those individually.
                for j, s in enumerate(batch):
                    if parts[j].strip() == "":
                        parts[j] = gtx_translate(s).strip() or s
                results.extend([p.strip() for p in parts])
            except Exception as e:
                if DEBUG:
                    safe_print(f"  [google] batch error ({type(e).__name__}): {e!r} -> per-item fallback")
                for s in batch:
                    try:
                        results.append(gtx_translate(s).strip() or s)
                    except Exception as ee:
                        if DEBUG:
                            safe_print(f"  [google] per-item error ({type(ee).__name__}): {ee!r}")
                        results.append(s)
            i += len(batch)
        return results

def translate_texts(engine: GoogleGTXEngine, limiter: RateLimiter, texts: List[str], target: str, max_chars: int) -> List[str]:
    if not texts:
        return []
    if target.lower() in {"en", "en-gb"}:
        return texts

    tnorm = engine.normalize_target(target)
    outs = engine.translate_batch(texts, tnorm, limiter, max_chars)
    if len(outs) != len(texts):
        raise RuntimeError(f"count mismatch: expected {len(texts)} got {len(outs)}")
    return outs

def process_language(en_map: Dict[int, str], lang_file: Path, engine: GoogleGTXEngine, limiter: RateLimiter, max_chars: int, dry_run: bool) -> Tuple[str, int]:
    lang_code = lang_file.stem  # e.g. gu, zh-CN, no-NO
    target = lang_code

    existing = parse_txt_file(lang_file)
    missing_ids = [k for k in sorted(en_map.keys()) if k not in existing or not existing.get(k)]
    if not missing_ids:
        safe_print(f"{lang_file.name}: up to date")
        return (lang_file.name, 0)

    safe_print(f"{lang_file.name}: translating {len(missing_ids)} lines -> {target}")

    # Build texts and placeholder protection maps aligned with missing_ids
    protected: List[str] = []
    ph_maps: List[Dict[str, str]] = []
    for k in missing_ids:
        p, m = protect(en_map[k])
        protected.append(p)
        ph_maps.append(m)

    # Translate in batches with retries/backoff at the call-site
    backoff = 1.0
    for attempt in range(4):
        try:
            translated = translate_texts(engine, limiter, protected, target, max_chars)
            # Unprotect
            translated = [unprotect(t, m) for t, m in zip(translated, ph_maps)]
            if dry_run:
                safe_print(f"  [{lang_file.name}] dry-run: would add {len(missing_ids)} lines")
                return (lang_file.name, len(missing_ids))

            # Merge and write
            merged = dict(existing)
            for k, t in zip(missing_ids, translated):
                merged[k] = t
            write_txt_file_atomic(lang_file, merged)
            safe_print(f"  [{lang_file.name}] Added {len(missing_ids)} lines")
            return (lang_file.name, len(missing_ids))
        except RateLimited as e:
            safe_print(f"  [{lang_file.name}] Skipped instantly: {e}; leaving file unchanged")
            return (lang_file.name, 0)
        except Exception as e:
            msg = f"{type(e).__name__}: {e!r}"
            safe_print(f"  [{lang_file.name}] attempt {attempt+1}/4 failed: {msg}")
            if DEBUG:
                import traceback
                traceback.print_exc()
            if attempt < 3:
                time.sleep(backoff + random.random() * 0.3)
                backoff = min(backoff * 2.0, 10.0)
                continue
            safe_print(f"  [{lang_file.name}] Failed: all attempts errored; leaving file unchanged")
            return (lang_file.name, 0)

def main() -> None:
    global DEBUG
    ap = argparse.ArgumentParser()
    ap.add_argument("lines", nargs="*", help="Language files to process (default: all *.txt except en-GB.txt)")
    ap.add_argument("--workers", type=int, default=DEFAULT_WORKERS)
    ap.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE)
    ap.add_argument("--max-chars", type=int, default=DEFAULT_MAX_CHARS)
    ap.add_argument("--qps", type=float, default=DEFAULT_QPS)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--debug", action="store_true")
    args = ap.parse_args()
    DEBUG = bool(args.debug)

    script_dir = Path(__file__).parent
    txt_dir = script_dir / "txt"
    en_file = txt_dir / "en-GB.txt"
    if not en_file.exists():
        raise SystemExit(f"Error: {en_file} not found")

    en_map = parse_txt_file(en_file)
    safe_print(f"Loaded {len(en_map)} lines from {en_file.name}\n")

    engine = GoogleGTXEngine(batch_size=int(max(1, args.batch_size)))
    limiter = RateLimiter(args.qps)

    # choose language files
    if args.lines:
        lang_files = [txt_dir / x for x in args.lines]
    else:
        lang_files = sorted([p for p in txt_dir.glob("*.txt") if p.name != "en-GB.txt"])

    safe_print(f"Processing {len(lang_files)} languages (workers={args.workers}, qps={args.qps}, batch={args.batch_size}, max_chars={args.max_chars})...\n")

    added_total = 0
    if args.workers <= 1:
        for lf in lang_files:
            name, added = process_language(en_map, lf, engine, limiter, args.max_chars, args.dry_run)
            added_total += added
    else:
        # NOTE: RateLimiter isn't thread-safe; enforce per-thread QPS by splitting
        per_qps = max(0.05, args.qps / args.workers)
        def task(lf: Path) -> Tuple[str, int]:
            return process_language(en_map, lf, engine, RateLimiter(per_qps), args.max_chars, args.dry_run)
        with cf.ThreadPoolExecutor(max_workers=args.workers) as ex:
            futs = [ex.submit(task, lf) for lf in lang_files]
            for f in cf.as_completed(futs):
                name, added = f.result()
                added_total += added

    safe_print(f"\nDone! Processed {len(lang_files)} languages, added {added_total} total translations.")

if __name__ == "__main__":
    main()
