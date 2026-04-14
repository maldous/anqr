# Search

## Purpose
Search contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 2 immediate files
- 2 child directories

## Key Files

- `hybrid-search.mjs` - JavaScript/TypeScript module used by this directory.
- `linear-search.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories
- `hybrid-search/` - Hybrid Search scope; immediate files include `collect-project-files.mjs`, `compute-fingerprint.mjs`, `cosine-similarity.mjs`, `create-hybrid-search-index.mjs`, and others.
- `linear-search/` - Linear Search scope; immediate files include `build-search-entry.mjs`, `compute-lexical-score.mjs`, `compute-recency-bonus.mjs`, `detect-project-root.mjs`, and others.

## Operational Notes
- Current on-disk inventory: 2 immediate file(s) and 2 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
