# 01. Root inventory and handling matrix

The latest `tree.txt` was treated as the authoritative inventory source for this bundle.

## Root directory handling matrix

| Root          |             Approximate current scope | Required treatment                                                                                                                     |
| ------------- | ------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------- |
| `android`     |   ~54 descendant files in latest tree | Transitional native Android scaffold. Keep build-only concerns here for now. Add contract docs now. Later converge to `apps/android/`. |
| `apps`        |    ~3 descendant files in latest tree | Target delivery roots. Create full contract-first app shells now, even if thin.                                                        |
| `docs`        |   ~34 descendant files in latest tree | Canonical governance. Do not fork standards into code comments when a doc already exists.                                              |
| `ios`         |   ~66 descendant files in latest tree | Transitional native iOS scaffold. Keep build-only concerns here for now. Add contract docs now. Later converge to `apps/ios/`.         |
| `netlify`     |  ~190 descendant files in latest tree | Current API/serverless surface. Thin handlers over packages; do not preserve fat logic here.                                           |
| `packages`    |   ~31 descendant files in latest tree | Primary extraction targets. Every leaf package gets contract README, package manifest, tsconfig, and source entry.                     |
| `public`      |  ~248 descendant files in latest tree | Web static assets and schemas. Remains content/runtime asset surface, not a logic package.                                             |
| `reports`     |    ~9 descendant files in latest tree | Operational state and machine memory. Never migrate into product packages.                                                             |
| `scripts`     |   ~27 descendant files in latest tree | Root automation/tooling. `harness/ops/` is the canonical harness runtime.                                                              |
| `services`    |    ~9 descendant files in latest tree | Systemd/user service surface. Keep entrypoint stability using shims.                                                                   |
| `src`         | ~4266 descendant files in latest tree | Transitional monolith to be dissolved by ownership seam.                                                                               |
| `tests`       |    ~3 descendant files in latest tree | Cross-package and cross-app tests. Keep as top-level test subjects.                                                                    |
| `vite-config` |   ~12 descendant files in latest tree | Web build configuration helpers. Move toward `packages/config/build` and `apps/web` ownership.                                         |

## Root configuration files that must be considered explicitly

| File                       | Required treatment                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `package.json`             | Convert root into workspace orchestrator while preserving top-level commands during migration.                   |
| `package-lock.json`        | Keep npm lock authoritative unless package manager migration is explicitly approved.                             |
| `tsconfig.json`            | Turn into solution coordinator rather than a single monolith compiler config.                                    |
| `tsconfig.node.json`       | Narrow to node/tooling concerns and stop pretending to be the only non-browser compiler target.                  |
| `eslint.config.js`         | Extend boundaries to `apps/*`, `packages/*/*`, `netlify/*`, and the harness.                                     |
| `.dependency-cruiser.cjs`  | Preserve current `src/` transitional rules and add package/app/netlify cross-root governance.                    |
| `netlify.toml`             | Keep runtime deploys working while web extraction proceeds.                                                      |
| `vite.config.ts`           | Eventually become `apps/web/vite.config.ts` with a short root shim if needed.                                    |
| `playwright.config.ts`     | Point at the extracted web app rather than a root-only preview model.                                            |
| `vitest.config.ts`         | Include package tests and app tests, not just `src/`.                                                            |
| `Makefile`                 | Expand targets across apps/packages/harness while preserving existing commands.                                  |
| `lefthook.yml`             | Keep validations stable across old and new roots.                                                                |
| `knip.json`                | Expand workspace awareness.                                                                                      |
| `cspell.json`              | Include new package/app READMEs and package roots without reintroducing translation noise.                       |
| `sonar-project.properties` | Continue scanning `src` during transition; add package/app granularity; remove `src` only after full extraction. |
| `commitlint.config.js`     | Preserve scope validation and expand recognized scopes if required.                                              |
| `postcss.config.mjs`       | Re-home under `apps/web` or `packages/config/build` once web build extraction lands.                             |
| `index.html`               | Treat as web-delivery concern to move under `apps/web`.                                                          |
| `README.md`                | Parent contract and migration entrypoint after this bundle is extracted.                                         |

## Things that are not source migration targets

- `reports/**`
- generated build outputs
- native binary assets and screenshots
- signing material
- service templates containing environment placeholders
