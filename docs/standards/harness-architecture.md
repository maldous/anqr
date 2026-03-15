# Harness Architecture

## Role

The harness is a first-class system, separate from product packages.

## Inputs

- email
- Linear
- local operator instructions
- telemetry
- repo state
- test results
- provider/model health

## Core modules

- email ingest
- Linear guardian
- Symphony/Codex orchestration
- model routing / fallback
- watchdogs
- reporting
- corrective-healing logic
- model evaluation

## Rules

- one planner/governor first
- bounded specialist executors later
- strict evidence before marking work done
- strict rollback expectations
- explicit human approval gates for protected actions
