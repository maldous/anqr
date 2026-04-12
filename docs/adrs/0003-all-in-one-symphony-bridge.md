# ADR-0003: All-in-One Symphony Bridge with Integrated Codebuff SDK

**Status:** Accepted  
**Date:** 2026-03-31  
**Deciders:** Harness Team  
**Reviewers:** GPT-5 (external architecture review)

## Context

The ANQR harness uses AI bridges to enable LLM-driven task execution across multiple git worktrees for concurrent processing. The original architecture had separate services:

1. **Codebuff Bridge** (`anqr-codebuff-bridge@.service`) — Codebuff SDK exposed as OpenAI HTTP API
2. **Symphony Bridge** (`anqr-symphony-executor@.service`, was `anqr-symphony-bridge@.service`) — AI completion with provider cascade and tool execution
3. **Discord Router** (`anqr-discord-router.service`) — Load balancer that rewrites cwd to target worktrees

### The Fundamental Problem

During external code review, a critical defect was identified in `codebuff-openai-bridge.mjs`:

**F1: Codebuff client cwd caching** — The shared Codebuff client was keyed by `costMode` only, ignoring the working directory (`cwd`). This meant:

- Requests intended for worktree `wt1` could silently reuse a client created with `cwd=/home/user/src/anqr-wt2`
- File operations would execute in the wrong worktree
- Worktree isolation was broken at the bridge level

While this was fixed by keying the client by `costMode + cwd`, it revealed a deeper architectural issue: **shared services across worktrees introduce caching and state management complexity that breaks isolation guarantees.**

## Decision

**Consolidate Codebuff bridge functionality, routing logic, and Symphony bridge into a single "all-in-one Symphony bridge" per worktree.**

Each Symphony executor instance (`anqr-symphony-executor@{1-8}.service`) will:

1. Handle AI completion requests (`/v1/chat/completions`)
2. Execute Codebuff SDK operations (tool use, code edits, file operations)
3. Run within its designated worktree via systemd `WorkingDirectory`
4. Maintain its own isolated provider cascade and session state
5. Automatically sync from `origin/main` before each request and push changes after completion

This eliminates:

- The separate Codebuff bridge service (`anqr-codebuff-bridge@.service`)
- The need for explicit cwd rewriting in the router (WorkingDirectory ensures correct cwd)
- Caching complexity across worktrees (each bridge is self-contained)

## Architecture

### Before (3-layer architecture)

```
Discord Gateway (OpenClaw) → Discord Router (port 18790)
                               ↓ rewrites cwd, selects worktree
                             Worktree Symphony Bridges (ports 4325-4328)
                               ↓ AI completion only
                             Provider Cascade → LLM API

Separate: Codebuff Bridge (port 4318, 4331-4338)
                               ↓ Codebuff SDK operations
                             Shared client cache (defect F1)
```

### After (2-layer architecture)

```
Discord Gateway (OpenClaw) → Discord Router (port 18790)
                               ↓ selects worktree, proxies request
                             All-in-One Symphony Bridges (ports 4325-4328)
                               ↓ AI completion + Codebuff SDK + tool execution
                               ↓ WorkingDirectory = worktree path
                             Provider Cascade → LLM API
```

Each Symphony bridge is:

- **Self-contained:** All capabilities (AI, tools, Codebuff SDK) in one service
- **Worktree-bound:** systemd `WorkingDirectory` ensures correct cwd from process start
- **Isolated:** No shared state or caching across worktrees

## Consequences

### Positive

- **Eliminates caching defects:** No shared client state across worktrees
- **Simplifies isolation model:** WorkingDirectory is the single source of truth for worktree binding
- **Reduces service count:** Eliminates 8 separate Codebuff bridge instances (wt1-wt8)
- **Clearer architecture:** One service per worktree instead of multiple overlapping services
- **Easier to reason about:** No cwd rewriting logic needed (WorkingDirectory handles it)

### Negative

- **Code duplication in each bridge:** Codebuff SDK integration code now in every Symphony bridge instance (but they're the same systemd template)
- **Memory overhead:** Each bridge loads full capability set even if only AI completion is needed (acceptable tradeoff)

### Migration Path

1. **Phase 1:** Integrate Codebuff SDK directly into `symphony-openai-bridge.mjs`
2. **Phase 2:** Update Symphony bridge instances to expose Codebuff capabilities
3. **Phase 3:** Deprecate and disable Codebuff bridge services
4. **Phase 4:** Update documentation and remove deprecated service files

## Implementation Notes

- Symphony bridge already has tool execution framework — extend it to support Codebuff SDK methods
- Router simplification: can reduce cwd rewriting logic (WorkingDirectory is authoritative)
- Service deployment: update only `anqr-symphony-executor@.service` template
- Backward compatibility: Main bridge (port 4319) remains unchanged for non-worktree use cases

## Related ADRs

- ADR-0001: Bootstrap branch strategy (establishes worktree foundation)
- ADR-0002: Symphony reboot (establishes AI bridge architecture)

## References

- External code review findings (2026-03-31): F1, F2, F3
- `docs/harness/12-concurrent-execution-with-worktrees.md` (Phase 0-8 validation)
- `docs/harness/discord-worktree-routing.md` (Discord isolation architecture)
- `services/systemd/anqr-codebuff-bridge@.service` (deprecated)
