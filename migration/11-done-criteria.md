# 11. Done criteria

Migration is done only when all of the following are true.

## Architecture

- `apps/*` are thin shells
- `packages/*/*` own reusable contracts
- `scripts/ops/*` is internally contract-separated
- `netlify/*` is thin over packages
- no new broad buckets exist

## Dependency graph

- no package deep imports
- no app imports from `src/*`
- no product imports from `scripts/ops/*`
- no production imports from `packages/testing/*`
- no forbidden layer inversions

## Transitional cleanup

- `src/*` removed or reduced to the final allowed residue with an explicit plan
- `src/modules`, `src/store`, `src/lib`, `src/types` no longer act as architecture roots
- compatibility shims removed where safe

## Validation

- typecheck green
- lint green
- depcruise green
- unit tests green
- harness quick/full green
- nightly dry-run acceptable
- queue check acceptable
- sonar config aligned to the new shape

## Documentation

- every package/app/harness project root has a contract `README.md`
- parent roots have overview `README.md`
- root README describes the repository as a whole
- docs point at canonical standards rather than duplicate them
