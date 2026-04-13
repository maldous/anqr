# Search

## Purpose
Directory for Linear ingestion, reconciliation, or issue management; immediate files include `hybrid-search.mjs`, `linear-search.mjs`, with child directories `hybrid-search/`, `linear-search/`.

## Contents
- 2 immediate files
- 2 child directories

## Key Files
- `hybrid-search.mjs` - JavaScript/TypeScript module used by this directory.
- `linear-search.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories
- `hybrid-search/` - Directory for runtime service bootstrap or environment support; immediate files include `collect-project-files.mjs`, `compute-fingerprint.mjs`, `cosine-similarity.mjs`, `create-hybrid-search-index.mjs`, and others.
- `linear-search/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `build-search-entry.mjs`, `compute-lexical-score.mjs`, `compute-recency-bonus.mjs`, `detect-project-root.mjs`, and others.

## Operational Notes
- Current on-disk inventory: 2 immediate files and 2 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
