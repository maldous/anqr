# RAG Pipeline - Retrieval Augmented Generation

## 1. Directory Overview

This directory contains a local-first RAG (Retrieval Augmented Generation) pipeline for ANQR
codebase search and context retrieval, backed by Ollama embeddings on the same machine that serves
Symphony agents. The pipeline provides semantic search capabilities across the codebase by chunking
files into semantic units, generating vector embeddings, and storing them in a vector database for
cosine similarity search. It currently contains 6 files and 6 subdirectories.

## 2. File Summaries

### Files

- **build-index-linear.mjs** - Facade exporting from `./build-index-linear/index.mjs` and `./build-index-linear/runtime.mjs`. Builds the Linear issue index in `reports/rag-index-linear/`.
- **build-index.mjs** - Facade exporting from `./build-index/index.mjs` and `./build-index/runtime.mjs`. Full-repo tracked-file index builder with noise filtering. Primary entry point for ANQR repo that chains into Linear index build.
- **chunker.mjs** - Facade exporting from `./chunker/index.mjs`. Splits code, docs, and config into line-aware semantic chunks using lightweight declaration-boundary heuristics with fallback to line-aware size splitting.
- **embeddings.mjs** - Facade exporting from `./embeddings/index.mjs`. Generates vector embeddings via Ollama API with cached health checks for reliability.
- **linear-chunker.mjs** - Facade exporting from `./linear-chunker/index.mjs`. Specialized chunker for Linear issues providing richer chunks for better recall.
- **vector-store.mjs** - Facade exporting from `./vector-store/index.mjs`. Persists, prunes, indexes, and searches embeddings with support for both legacy single-file and sharded formats.

### Child Directories

- **build-index/** - This directory contains the RAG (Retrieval-Augmented Generation) index builder for source code.
- **build-index-linear/** - This directory contains the Linear RAG index builder module for the ANQR harness.
- **chunker/** - This directory contains the core text chunking engine for the ANQR (Agentic Number Query Runner) RAG (Retrieval-Augmented Generation) system.
- **embeddings/** - This directory contains embedding generation utilities for the RAG (Retrieval Augmented Generation) system using Ollama as the embedding provider.
- **linear-chunker/** - This directory contains the Linear issue chunking module for the RAG (Retrieval-Augmented Generation) pipeline.
- **vector-store/** - This directory contains the vector store implementation for the ANQR (Agentic Number Query Runner) RAG (Retrieval-Augmented Generation) system.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
