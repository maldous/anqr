# Baking permutation snapshot baselines

Run-once procedure to seed
`tests/e2e/__snapshots__/permutations/*.sha256.txt`, then enable drift
detection in CI.

## Why this needs a human-run step

`tests/e2e/permutations.web.spec.ts` uses `canvas.toDataURL("image/png")`
hash equality (`ANQR_SNAPSHOT_PERMUTATIONS` env var). The baseline must
be recorded on a representative machine + browser combo so subsequent
runs (local + CI) compare apples to apples. Recording it from an
arbitrary ephemeral container would just freeze the wrong baseline.

## Procedure

1. Build the web bundle and start the preview server:
   ```bash
   npm run build:web
   npx vite preview --host 127.0.0.1 --port 4173 &
   ```
2. Set the baseline mode and run only the permutations project:
   ```bash
   ANQR_SNAPSHOT_PERMUTATIONS=record \
     npx playwright test --project permutations
   ```
3. Commit the generated baselines:
   ```bash
   git add tests/e2e/__snapshots__/permutations/
   git commit -m "test(testing): bake permutation canvas hashes"
   ```
4. From this point, run with `ANQR_SNAPSHOT_PERMUTATIONS=1` (or set the
   env var in CI). The spec compares the runtime hash against the
   committed baseline and fails on drift.

## When to re-bake

- A deliberate render-pipeline change is shipped (e.g., a new module
  style, a fix that changes per-pixel output). Re-bake on the same
  branch, eyeball the visual diff between old and new fixture PNGs,
  commit if it matches the intent.
- Cross-platform pixel drift on CI (rare but possible if the runner OS
  changes its Skia/Cairo backend). Decide whether to baseline per OS or
  keep a single canonical baseline.

## Why we ship `mode=off` as the default

Even after baking, the spec's default is `off` so a clone-and-test on a
fresh machine doesn't flake on cross-machine pixel differences. Opt in
explicitly via the env var when you want the regression catch.
