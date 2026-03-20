# Provider Routing

This document defines the current provider posture for harness and AI-assisted workflows.

## Principle

Use the cheapest truthful route that satisfies the task while preserving evidence quality.

## Current provider families

- local model / Ollama where suitable
- hosted general providers via configured tokens
- fallback providers for degraded mode

## Required behavior

- prefer configured provider routing over ad hoc direct calls
- log degraded or fallback execution explicitly
- do not make spend-bearing routing changes silently
- keep launch-critical product behavior independent of harness-provider availability

## Inputs

Provider routing currently depends on:

- local env files
- systemd env files
- symphony env
- provider tokens present in the operator environment

## Non-goals

- provider routing is not a substitute for product auth
- provider routing must not become hidden doctrine inside scripts alone

Use [README.md](/home/user/src/anqr/README.md) and [MCP-MIGRATION.md](/home/user/src/anqr/MCP-MIGRATION.md) for the broader launch and migration backlog around external AI services.
