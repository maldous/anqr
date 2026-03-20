# Secrets, Redaction, And Operator Access

## Principle

Secrets are operator-owned and must not leak into routine code, docs, prompts, or reports.

## Human-only surfaces

- signing material
- store credentials
- third-party billing or approval credentials
- production auth secrets
- long-lived private keys

## Repository behavior

- keep extracted local secret files ignored
- keep bootstrap material handled through controlled install flows
- keep real secret values out of issue comments and evidence artifacts

## Redaction

When producing logs or examples:

- redact secrets entirely
- reduce tokens and keys to labels, not partial values, unless partial display is required for an operator runbook
- do not include private payloads in public bug trails

## Operator access

Only humans should perform:

- signing and store actions
- prod env changes
- secret rotation
- legal/privacy configuration
