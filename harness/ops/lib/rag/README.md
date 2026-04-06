# RAG Pipeline - Retrieval Augmented Generation

## 1. Directory Overview

This directory implements **RAG Pipeline - Retrieval Augmented Generation** within the ANQR harness. Key immediate entries include `build-index-linear.mjs`, `vector-store.mjs`, `linear-chunker.mjs`, `build-index.mjs`. The current inventory is 6 non-README files and 6 subdirectories.

## 2. File Summaries

### Files

- **build-index-linear.mjs** - Facade module that re-exports public members from `./build-index-linear/index.mjs`, `./build-index-linear/runtime.mjs`.
- **build-index.mjs** - Facade module that re-exports public members from `./build-index/index.mjs`, `./build-index/runtime.mjs`.
- **chunker.mjs** - Facade module that re-exports public members from `./chunker/index.mjs`.
- **embeddings.mjs** - Facade module that re-exports public members from `./embeddings/index.mjs`.
- **linear-chunker.mjs** - Facade module that re-exports public members from `./linear-chunker/index.mjs`.
- **vector-store.mjs** - Facade module that re-exports public members from `./vector-store/index.mjs`.

### Subdirectories

- **build-index/** - Contains **RAG Build Index**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **build-index-linear/** - Contains **Linear RAG Index Builder**; it contains 12 immediate files and has 0 child directories.
- **chunker/** - Contains **ANQR RAG Chunker**; it contains 34 immediate files and has 0 child directories.
- **embeddings/** - Contains **ANQR RAG Embeddings**; it contains 20 immediate files and has 0 child directories.
- **linear-chunker/** - Contains **Linear Issue Chunker**; it contains 9 immediate files and has 0 child directories.
- **vector-store/** - Contains **ANQR Vector Store**; it contains 39 immediate files and has 0 child directories.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory use Linear integration.

## 4. Usage Instructions

This directory does not define an obvious standalone entry point. Its files are consumed by adjacent harness modules or by child directories.

## 5. Dependencies

- **Internal relative modules** - `./build-index-linear/index.mjs`, `./build-index-linear/runtime.mjs`, `./build-index/index.mjs`, `./build-index/runtime.mjs`, `./chunker/index.mjs`, `./embeddings/index.mjs`, `./linear-chunker/index.mjs`, `./vector-store/index.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
