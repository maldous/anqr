# Prompt to give the AI after extracting this bundle

Use this exact prompt:

```text
Read the repository contract in README.md first, then read every file under migration/ in numeric order, then read every contract README that was added under apps/, packages/, scripts/ops/, netlify/, src/, tests/, services/systemd/, android/, ios/, public/, reports/, and vite-config/.

Perform the migration exactly as documented.

Non-negotiable requirements:
- treat tree.txt as the latest inventory authority
- do not ignore any top-level directory or root config file
- keep scripts/ops as the canonical harness runtime
- create internal harness contract separation with compatibility shims
- do not create a competing tools/harness runtime
- move reusable product logic from src into packages/*/*
- move delivery-specific shell/routing/page/seo/i18n composition into apps/*
- keep netlify handlers thin and move implementation into packages
- do not preserve broad legacy buckets such as modules, store, lib, hooks, types, helpers, utils, or common as new architecture roots
- update package.json, tsconfig*, eslint.config.js, .dependency-cruiser.cjs, vitest, playwright, netlify.toml, sonar-project.properties, Makefile, lefthook.yml, knip.json, cspell.json, and any other root configs needed by the new structure
- preserve green validation between phases
- keep operator and systemd entrypoints stable using shims until the final cleanup phase

Execution order:
1. apply root config changes
2. lay down package/app contracts and manifests where still missing
3. contract-separate scripts/ops with stable entry shims
4. extract observability/platform packages
5. extract domain packages
6. extract application packages
7. compose apps/web, apps/mobile, and apps/api
8. thin netlify over packages
9. retire broad legacy src roots
10. remove transitional shims only when safe

After each phase run:
npm run typecheck
npm run lint
npm run depcruise
npm run test:unit
npm run harness:quick

At phase boundaries also run:
npm run harness:full
npm run nightly:dry-run
npm run queue:check
npm run cspell

When finished, summarize:
- files moved
- shims added
- root configs changed
- remaining transitional roots
- exact validation commands run and their outcomes
```
