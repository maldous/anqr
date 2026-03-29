# Bootstrap Actions

Follow this in order.

## 1. Create the ChatGPT Project

Create a new ChatGPT Project named:

`ANQR 1.0 Product OS`

Upload this pack and the source context files.

## 2. Freeze legacy

In the ANQR repo:

```bash
git checkout master
git tag legacy-v0-final
```

Then protect `master` and stop structural work there.

## 3. Keep the extraction branch

Keep:

`refactor/anqr-architecture`

as the decomposition/extraction reference branch.

Do not try to make it the final architecture.

## 4. Perform secrets/config review

Before creating `main`, review and remediate:

- tracked secrets
- embedded credentials
- signing/config material
- systemd secrets
- `.env` handling
- GitHub/Netlify/Cloudflare secret sources
- Google/Apple/Sentry/GA/AdMob credentials

Document the results in:

`docs/discovery/02-environments-and-secrets.md`

## 5. Fill in the doctrine/control docs

Complete first-pass answers for:

- `docs/program/*`
- `docs/discovery/*`

These do not need to be perfect, but they must be explicit.

## 6. Create clean `main`

When the control docs exist:

```bash
git checkout --orphan main
git rm -rf .
```

Then copy in:

- this doctrine pack
- workspace scaffolding
- repo skeleton
- no legacy product files yet

## 7. Commit bootstrap only

First commit should include only:

- docs
- repo tree
- workspace/package scaffolding
- lint/typecheck/depcruise/testing setup
- no imported product logic

## 8. Re-parent Linear work

Archive or close legacy implementation-specific issues.

Keep or recreate:

- standards
- launch readiness
- harness reliability
- observability
- ads/analytics
- release readiness
- mobile distribution
- self-care and corrective-healing work

## 9. Configure git for ANQR development

All developers must configure git with weave merge for concurrent worktree execution:

```bash
./scripts/git-setup.sh
```

This configures:

- Weave merge driver for reduced conflicts in concurrent development
- diff3 conflict markers for better conflict resolution
- Line ending handling for cross-platform compatibility
- Optional patience diff algorithm

See [docs/standards/git-weave-merge.md](standards/git-weave-merge.md) for details on why weave merge is critical for concurrent worktree execution.

## 10. Enable local execution

Keep ChatGPT Project as planning/governance brain.
Keep Symphony/Linear/Codex/Ollama/systemd as local execution engine.

## 11. Start build order

Build in this order:

1. standards enforcement
2. observability facade
3. testing contracts
4. analytics/ads facade
5. shared domain/application packages
6. app shells
7. harness integration
