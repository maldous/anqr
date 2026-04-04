# AI agent instructions for the scripts -> harness migration

## Objective

The existing `scripts/` directory under the ANQR repo is the legacy implementation. The new target is a sibling directory named `harness/`, in lowercase.

Target layout:

```text
anqr/
  scripts/   # baseline reference only
  harness/   # new decomposed canonical implementation
```

Important boundary:

The AST violations driving this work are listed in `ast.txt`, with the largest offenders led by files such as `scripts/ops/integrations/model/symphony-openai-bridge.mjs`, `scripts/ops/core/symphony-state.mjs`, `scripts/ops/integrations/model/symphony-credit-gate.mjs`, `scripts/ops/integrations/model/symphony-adaptive-context.mjs`, and `scripts/ops/orchestration/symphony-runner.mjs`. fileciteturn0file0

## Non-negotiable rules

1. Work in `harness/`, not `scripts/`.
2. Treat `scripts/` as read-only baseline reference.
3. Do not rewrite or reorganize `scripts/`.
4. The rest of ANQR should eventually be changed to call `harness/` instead of `scripts/`.
5. `scripts/` should be removable at the end of the migration.

## What I have done

For each AST-targeted file, I attempted to:

1. copy `scripts/` to `harness/`
2. decompose AST-targeted files inside `harness/`
3. split named top-level declarations into separate real files under a same-name directory
4. preserve original function, class, and variable bodies as closely as possible
5. preserve declaration forms where possible
6. rewrite relative imports for generated files inside `harness/`
7. add sibling imports when extracted declarations depend on one another
8. generate `index.*` re-export files
9. generate `runtime.*` carry-forward files for unsupported top-level statements
10. replace original `harness/*.mjs` files with facade entry files
11. generate reports under `harness/.harness-prep/`
12. scan the rest of the repo for `scripts/` references without modifying those files

## Expected output shape

Example:

```text
scripts/ops/core/symphony-state.mjs          # untouched baseline
harness/ops/core/symphony-state.mjs          # auto-generated facade
harness/ops/core/symphony-state/index.mjs    # re-exports extracted members
harness/ops/core/symphony-state/runtime.mjs  # carry-forward, if needed
harness/ops/core/symphony-state/*.mjs        # extracted one-member modules
harness/ops/core/symphony-state/__original__.mjs
harness/.harness-prep/summary.md
harness/.harness-prep/manual-todo.md
harness/.harness-prep/summary.json
```

## Your job now

### 1. Finish the decomposition inside `harness/`

For each file listed in `harness/.harness-prep/manual-todo.md`:

- compare `__original__.*` with the generated facade, `index.*`, `runtime.*`, and extracted modules
- move any remaining safe declarations out of `runtime.*`
- remove unnecessary carry-forward logic
- preserve module behaviour and CLI behaviour
- preserve exported names and call signatures
- reduce every remaining multi-AST file in `harness/`

### 2. Keep `scripts/` as the baseline until cutover

- use `scripts/` only as a reference
- do not back-port decomposition work into `scripts/`
- do not make `scripts/` the active runtime once `harness/` is viable

### 3. Rewrite ANQR to use `harness/` instead of `scripts/`

After `harness/` is stable enough, update the rest of the repo to reference `harness/`.

This includes, but is not limited to:

- `Makefile` and included `.mk` files
- `package.json` and package scripts
- systemd service, timer, and helper files
- shell scripts and bootstrap flows
- CI and CD config
- tests, fixtures, and snapshots
- docs and operator commands that are intended to be copied verbatim
- direct Node invocations such as `node scripts/...`
- wrappers in Python, shell, or other languages

I did not modify those files. I only reports them.

### 4. Use the external reference report

Review `harness/.harness-prep/manual-todo.md` and the summary files for the list of repo files outside `scripts/` and `harness/` that still contain `scripts/` references.

Update those files from `scripts/` to `harness/` when the corresponding harness entrypoints are ready.

### 5. Prepare for final removal of `scripts/`

Before deleting `scripts/`, ensure:

- operational entrypoints use `harness/`
- tests no longer reference `scripts/`
- services no longer execute `scripts/`
- no Make target still shells into `scripts/`
- no path-based tooling still expects `scripts/`
- docs that operators actually run have been updated

Only then should `scripts/` be removed.

## Required review loop

After each batch of changes:

1. run the AST audit again against `harness/`
2. run tests relevant to changed files
3. run typecheck and lint where applicable
4. verify CLI, service, and automation paths now point to `harness/`
5. compare behaviour against the baseline `scripts/` version
6. update the prep reports with a resolved summary if needed

## Minimum validation checklist

```bash
npm run audit:ast
npm run lint
npm run typecheck
npm test
rg -n "scripts/" .
rg -n "node scripts/|./scripts/|/scripts/" .
rg -n "harness/" .
```

Also inspect:

```bash
find harness -type f | sort
find harness -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.ts' \) | xargs -n1 node --check
```

For service and ops migration checks:

```bash
rg -n "scripts/" Makefile package.json .github .config systemd tests .
rg -n "ExecStart=.*scripts/|ExecStart=.*harness/" .
```

## Completion criteria

This migration is complete only when all of the following are true:

- `harness/` contains the decomposed canonical implementation
- ANQR runtime and automation use `harness/`
- AST density is within the desired limit for `harness/`
- generated files have valid imports
- tests and operational checks pass
- `scripts/` is no longer required for execution
- `scripts/` can be removed without breaking ANQR
