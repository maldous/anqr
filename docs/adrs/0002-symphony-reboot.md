# ADR-0002: Symphony Reboot on Main

## Decision

Rebuild Symphony from scratch on `main` as a smaller, stricter autonomous operations substrate. Do not copy legacy `master` files.

## Reason

Legacy `master` accumulated operational complexity that obscured the working core. The real work is not migration — it is distilling legacy lessons into a tighter system.

## Key Lessons from Legacy

### Deterministic first

Symphony worked when the loop began with deterministic local checks, not AI reasoning. The three-tier corrective framework is:

1. local deterministic checks (harness-report)
2. scheduled automation (nightly-ops-pass)
3. issue-driven AI correction (Symphony execution)

### Ollama is single-slot

- `max_concurrent_agents` = 1
- `num_thread` = 1
- Issues must be Ollama-sized: 1–2 files, 1–3 acceptance criteria, single run <5 minutes
- Throughput targets: 2–3 queued items, not 5–10
- GPU contention, timeouts, and `provider_no_output` failures are the dominant failure mode

### Guardian over Sentinel

The AI-first Sentinel pattern was replaced with deterministic Guardian checks. Guardian owns:

- reading harness reports
- creating/updating issues
- duplicate suppression
- queue-size control
- stale-session escalation
- hygiene enforcement

### Hygiene must be automatic

- Required priority + domain/risk labels on all issues
- Descriptor taxonomy: `[CHILD]`, `[HUMAN]`, `[LOCAL-SLICE]`
- Queue health actively drained
- Human-only items clearly marked and excluded from automation

### systemd environment differs

PATH and runtime environment under systemd differ from interactive shells. Service units must set explicit PATH, HOME, and NODE_PATH.

## Structure

```
harness/ops/       operational scripts (harness, guardian, audit, routing)
services/systemd/   systemd service and timer units
reports/            harness report artifacts
docs/workflows/     execution workflow documentation
```

## Phased Delivery

See ANQ-364 and children (ANQ-365 through ANQ-371).
