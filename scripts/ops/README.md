# Harness runtime contract

`scripts/ops/` is the canonical harness runtime.

## Own here

- automation orchestration
- governance
- provider routing
- reporting
- notifications
- runtime state
- machine execution prompts
- issue/email/sonar integrations
- RAG pipeline (chunker, embeddings, vector store)
- hybrid search (BM25 + semantic)
- MCP server management (Context7)

## Do not own here

- product runtime logic
- reusable product packages
- app shell code

## Directory structure

```
scripts/ops/
├── core/                  # Configuration and shared constants
├── integrations/          # External service integrations
│   ├── linear/            # Linear issue tracking
│   ├── model/             # AI provider bridges and routing
│   ├── notifications/     # Discord webhooks, email
│   └── sonar/             # SonarQube integration
├── lib/                   # Shared libraries
│   ├── rag/               # RAG pipeline (chunker, embeddings, vector-store, build-index)
│   └── search/            # Hybrid search (BM25 + embeddings via RRF)
├── orchestration/         # Runner, queue, nightly flows
├── runtime/
│   ├── mcp/               # Context7 MCP server wrapper and HTTP service
│   └── symphony/          # Symphony agent runtime
└── diagnostics/           # Health checks and auditing
```
