# Archive Policy

## Live doctrine

The live doctrine surface is:

- [README.md](/home/user/src/anqr/README.md)
- [AGENTS.md](/home/user/src/anqr/AGENTS.md)
- [docs/README.md](/home/user/src/anqr/docs/README.md)
- [docs/program/\*](/home/user/src/anqr/docs/program)
- [docs/harness/\*](/home/user/src/anqr/docs/harness)

## Archive-only surfaces

- `migration/*`
- superseded bootstrap notes
- legacy planning notes that are no longer operationally binding

## Archive rule

Historical context may be preserved, but it must not silently override current doctrine.

When a document is superseded:

1. preserve it under `docs/archive/*` or leave it in an explicitly archive-only root
2. link to the live replacement
3. stop updating the archived file as if it were current doctrine
