# 08. Risk register

## Risk 1 — alias imports are not updated correctly

### Impact

High

### Cause

The repository uses path aliases such as `@/...`. Relative import updates are not sufficient.

### Control

Use the provided `move-by-manifest.ts` script, which updates alias imports after ts-morph file moves.

### Exit check

Search for imports still pointing to old paths after each pass.

---

## Risk 2 — split files change behaviour

### Impact

High

### Cause

The critical files mix UI, orchestration, and algorithmic logic.

### Control

Split in small steps using the curated symbol manifests. Keep a temporary façade only if necessary.

### Exit check

Run targeted smoke tests after each critical split.

---

## Risk 3 — domain/platform boundaries regress later

### Impact

High

### Cause

Without CI enforcement, the repo will drift back.

### Control

Enable `dependency-cruiser` as a blocking CI check.

### Exit check

Architecture policy runs on every PR.

---

## Risk 4 — new generic sinks appear during migration

### Impact

Medium

### Cause

Refactors often create temporary `helpers.ts` or `new-types.ts` files that become permanent.

### Control

Disallow new generic sink names in review and policy.

### Exit check

No new broad sink files remain at the end of each phase.

---

## Risk 5 — generated/static content pollutes architecture metrics

### Impact

Medium

### Cause

`src/i18n/static/**` dominates raw file counts.

### Control

Exclude content/generated trees from architecture metrics and policy unless they contain executable logic.

### Exit check

Metrics are reported for both full and executable working sets.

---

## Risk 6 — state split introduces duplicate enums and contracts

### Impact

Medium

### Cause

`src/store/qr-store.ts` currently centralises many enums and helper types.

### Control

Move models to their owning domain packages and leave compatibility exports only temporarily.

### Exit check

No duplicate cross-context enum sets remain.

---

## Risk 7 — broad barrels obscure true dependencies

### Impact

Medium

### Cause

Convenience re-exports hide ownership and create coupling.

### Control

Delete root barrels and replace with bounded-context entrypoints only.

### Exit check

`src/modules/index.ts` and similar barrels are gone.

---

## Risk 8 — side effects remain hidden in non-bootstrap files

### Impact

Medium

### Cause

The inventory detected a large number of top-level side-effect files.

### Control

Restrict allowed side-effect locations and review every exception.

### Exit check

All remaining side-effect files are in approved locations or documented exceptions.

---

## Risk 9 — migration stalls in the `qr-generator` subtree

### Impact

High

### Cause

This subtree is the most mixed and the most important.

### Control

Treat it as its own workstream after the critical top-level split files are handled.

### Exit check

The subtree is decomposed into render/color/dither/filters/overlay/platform responsibilities.

---

## Risk 10 — architecture package becomes stale

### Impact

Medium

### Cause

A refactor plan is only useful if it evolves with the codebase.

### Control

Refresh the AST inventory and manifests after each major pass.

### Exit check

Manifest and policy changes are committed alongside structural changes.
