# ANQR Search Library

## 1. Directory Overview

This directory contains search functionality for the ANQR (Agentic Number Query Runner) harness. It
provides two search implementations: **linear-search** for straightforward linear search operations
and **hybrid-search** which combines BM25 keyword search with embedding-based semantic search using
Reciprocal Rank Fusion (RRF). It currently contains 2 files and 2 subdirectories.

## 2. File Summaries

### Files

- **hybrid-search.mjs** - Auto-generated facade that re-exports from `./hybrid-search/index.mjs` and exports all from `./hybrid-search/runtime.mjs`. Implements hybrid search combining BM25 keyword search with embedding-based semantic search.
- **linear-search.mjs** - Auto-generated facade that re-exports from `./linear-search/index.mjs`. Provides linear search capabilities for file content. The original file has been decomposed into sibling modules under the matching directory.

### Child Directories

- **hybrid-search/** - This directory contains the hybrid search implementation for the ANQR (Agentic Number Query Runner) harness.
- **linear-search/** - This directory contains the linear search module for the ANQR (Agentic Number Query Runner) harness.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
