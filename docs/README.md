# Docs

This directory holds the active documentation set.

## Active sections

- `program/` product scope, charter, functions, and policy
- `adrs/` architectural decisions
- `standards/` stable engineering rules
- `workflows/` operational task flows
- `harness/` active harness entry and current guidance
- `reference/` quick reference material
- `archive/` historical material kept for traceability

## Reading order

Start with:

1. `../README.md`
2. `../AGENTS.md`
3. `program/01-anqr-1.0-definition.md`

Then choose the smallest relevant surface:

- architecture decision: `adrs/`
- stable repo rule: `standards/`
- operational flow: `workflows/`
- harness work: `harness/00-index.md`
- runtime lookup: `reference/`

## Placement rules

- Current behavior belongs in active sections.
- Historical reviews, migration notes, and completed plans belong in `archive/`.
- Root docs stay minimal and point here.
- Directory-local implementation detail belongs beside the code it describes.
