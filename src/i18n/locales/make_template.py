#!/usr/bin/env python3
"""
make_template.py

Creates template.json by mapping the structure of en-GB.json to the
line-number-based IDs in en-GB.txt.

The .txt files use line numbers as IDs (1, 2, 3...) where each line
contains the English string. This script:
1. Reads en-GB.txt to build a mapping: english_string -> ID
2. Reads en-GB.json to get the structure
3. Replaces each string value with its corresponding ID
4. Writes template.json

Usage:
  python3 make_template.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict


ID_RE = re.compile(r"^\s*(\d+)(?:[\t,]|\s{2,})(\S.*)$")


def load_id_mapping(txt_path: str) -> Dict[str, str]:
    """Load en-GB.txt and create a mapping from English string to ID."""
    string_to_id: Dict[str, str] = {}
    
    for line in Path(txt_path).read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("//"):
            continue
        
        m = ID_RE.match(line)
        if not m:
            continue
            
        _id, rhs = m.group(1), m.group(2).strip()
        
        # Parse the string value (it's JSON-encoded)
        if rhs.startswith('"') and rhs.endswith('"'):
            try:
                value = json.loads(rhs)
                string_to_id[value] = _id
            except json.JSONDecodeError:
                # Try as raw string
                string_to_id[rhs[1:-1]] = _id
        else:
            string_to_id[rhs] = _id
    
    return string_to_id


def replace_with_ids(node: Any, string_to_id: Dict[str, str], path: str = "$") -> Any:
    """Recursively replace string values with their IDs."""
    if isinstance(node, dict):
        return {k: replace_with_ids(v, string_to_id, f"{path}.{k}") for k, v in node.items()}
    
    if isinstance(node, list):
        return [replace_with_ids(x, string_to_id, f"{path}[{i}]") for i, x in enumerate(node)]
    
    if isinstance(node, str):
        if node in string_to_id:
            return string_to_id[node]
        else:
            # String not found in mapping - this shouldn't happen for valid data
            print(f"Warning: No ID found for string at {path}: {node[:50]}...")
            return node
    
    return node


def main() -> None:
    # Get the directory where this script lives
    script_dir = Path(__file__).parent
    
    txt_path = script_dir / "txt" / "en-GB.txt"
    json_path = script_dir / "en-GB.json"
    template_out = script_dir / "template.json"
    
    # Load the ID mapping from en-GB.txt
    string_to_id = load_id_mapping(txt_path)
    print(f"Loaded {len(string_to_id)} string->ID mappings from {txt_path}")
    
    # Load the JSON structure
    data = json.loads(Path(json_path).read_text(encoding="utf-8"))
    
    # Replace strings with IDs
    template = replace_with_ids(data, string_to_id)
    
    # Write template.json
    Path(template_out).write_text(
        json.dumps(template, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    print(f"Wrote {template_out}")


if __name__ == "__main__":
    main()
