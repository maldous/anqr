# Harness Runtime Surface Classification

## Summary

This report classifies the current `scripts/ops/*` and `services/systemd/*` surfaces for ANQR 1.0 Phase 3.

## Scope class

- docs-harness

## Control-loop surfaces

| Surface                                                | Disposition | Reason                                        | Owner/runtime   | Replacement target                            | Blocking risk | Follow-up issue                        |
| ------------------------------------------------------ | ----------- | --------------------------------------------- | --------------- | --------------------------------------------- | ------------- | -------------------------------------- |
| `scripts/ops/harness-report.mjs`                       | canonical   | stable operator entrypoint for harness health | runtime:harness | keep as stable root entrypoint                | low           | Classify and stabilize harness runtime |
| `scripts/ops/reporting/harness-report.mjs`             | canonical   | structured implementation ownership           | runtime:harness | remain implementation target behind root shim | low           | Classify and stabilize harness runtime |
| `scripts/ops/linear-guardian.mjs`                      | canonical   | stable operator entrypoint                    | runtime:harness | keep as stable root entrypoint                | low           | Classify and stabilize harness runtime |
| `scripts/ops/governance/linear-guardian.mjs`           | canonical   | structured implementation ownership           | runtime:harness | remain implementation target behind root shim | low           | Classify and stabilize harness runtime |
| `scripts/ops/symphony-queue-control.mjs`               | canonical   | stable operator entrypoint                    | runtime:harness | keep as stable root entrypoint                | low           | Classify and stabilize harness runtime |
| `scripts/ops/orchestration/symphony-queue-control.mjs` | canonical   | structured implementation ownership           | runtime:harness | remain implementation target behind root shim | low           | Classify and stabilize harness runtime |
| `scripts/ops/symphony-runner.mjs`                      | canonical   | stable operator entrypoint                    | runtime:harness | keep as stable root entrypoint                | low           | Classify and stabilize harness runtime |
| `scripts/ops/orchestration/symphony-runner.mjs`        | canonical   | structured implementation ownership           | runtime:harness | remain implementation target behind root shim | low           | Classify and stabilize harness runtime |
| `scripts/ops/notify.mjs`                               | canonical   | stable operator entrypoint for notifications  | runtime:harness | keep as shim until root-surface cleanup       | low           | Classify and stabilize harness runtime |
| `scripts/ops/lib/notify.mjs`                           | canonical   | notification implementation and shared logic  | runtime:harness | remain implementation target                  | low           | Classify and stabilize harness runtime |

## Supporting runtime surfaces

| Surface                                                   | Disposition  | Reason                                                         | Owner/runtime   | Replacement target                                         | Blocking risk | Follow-up issue                        |
| --------------------------------------------------------- | ------------ | -------------------------------------------------------------- | --------------- | ---------------------------------------------------------- | ------------- | -------------------------------------- |
| `scripts/ops/nightly-ops-pass.mjs`                        | canonical    | stable nightly entrypoint                                      | runtime:harness | keep as root entrypoint                                    | low           | Classify and stabilize harness runtime |
| `scripts/ops/orchestration/nightly-ops-pass.mjs`          | canonical    | structured implementation ownership                            | runtime:harness | remain implementation target                               | low           | Classify and stabilize harness runtime |
| `scripts/ops/email-ingest.mjs`                            | canonical    | stable operator entrypoint                                     | runtime:harness | keep as root entrypoint                                    | low           | Classify and stabilize harness runtime |
| `scripts/ops/integrations/email/email-ingest.mjs`         | canonical    | structured implementation ownership                            | runtime:harness | remain implementation target                               | low           | Classify and stabilize harness runtime |
| `scripts/ops/symphony-agent.mjs`                          | canonical    | stable operator entrypoint                                     | runtime:harness | keep as root entrypoint                                    | low           | Classify and stabilize harness runtime |
| `scripts/ops/runtime/symphony/symphony-agent.mjs`         | canonical    | structured implementation ownership                            | runtime:harness | remain implementation target                               | low           | Classify and stabilize harness runtime |
| `scripts/ops/symphony-credit-gate.mjs`                    | canonical    | stable operator entrypoint                                     | runtime:harness | keep as root entrypoint                                    | low           | Classify and stabilize harness runtime |
| `scripts/ops/integrations/model/symphony-credit-gate.mjs` | canonical    | structured implementation ownership                            | runtime:harness | remain implementation target                               | low           | Classify and stabilize harness runtime |
| `scripts/ops/sonar-linear-mail.mjs`                       | canonical    | maintained Sonar notification entrypoint                       | runtime:harness | keep as root entrypoint                                    | low           | Classify and stabilize harness runtime |
| `scripts/ops/lib/sonar-linear-sync.mjs`                   | transitional | legacy shared location duplicated by integration-owned version | runtime:harness | converge toward `integrations/sonar/sonar-linear-sync.mjs` | medium        | Converge duplicate Sonar sync surfaces |
| `scripts/ops/integrations/sonar/sonar-linear-sync.mjs`    | canonical    | integration-owned implementation location                      | runtime:harness | become sole implementation after convergence               | medium        | Converge duplicate Sonar sync surfaces |
| `scripts/ops/integrations/sonar/sonar-linear-audit.mjs`   | canonical    | integration-owned audit behavior                               | runtime:harness | retain                                                     | low           | Classify and stabilize harness runtime |
| `scripts/ops/linear-client.mjs`                           | canonical    | stable root shim used by existing runtime                      | runtime:harness | keep until runtime cleanup deliberately replaces it        | low           | Classify and stabilize harness runtime |
| `scripts/ops/integrations/linear/linear-client.mjs`       | canonical    | canonical implementation ownership                             | runtime:harness | retain                                                     | low           | Classify and stabilize harness runtime |

## Config and support files

| Surface                                                        | Disposition  | Reason                                                              | Owner/runtime   | Replacement target                                                  | Blocking risk | Follow-up issue                          |
| -------------------------------------------------------------- | ------------ | ------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------- | ------------- | ---------------------------------------- |
| `scripts/ops/core/*`                                           | canonical    | shared harness config/state/validation layer                        | runtime:harness | retain                                                              | low           | Classify and stabilize harness runtime   |
| `scripts/ops/integrations/model/litellm-config.yaml`           | canonical    | provider-routing config                                             | runtime:harness | retain                                                              | low           | Publish runtime contract                 |
| `scripts/ops/litellm-config.yaml`                              | transitional | root duplicate of integration-owned config                          | runtime:harness | converge toward integration-owned location                          | low           | Converge duplicate model config surfaces |
| `scripts/ops/integrations/model/model-injector-proxy.py`       | canonical    | integration-owned helper                                            | runtime:harness | retain if provider routing still needs it                           | low           | Publish runtime contract                 |
| `scripts/ops/model-injector-proxy.py`                          | transitional | root duplicate of integration-owned helper                          | runtime:harness | converge toward integration-owned location                          | low           | Converge duplicate model config surfaces |
| `scripts/ops/integrations/model/ollama-local-audit.mjs`        | canonical    | integration-owned local provider audit                              | runtime:harness | retain                                                              | low           | Publish runtime contract                 |
| `scripts/ops/ollama-local-audit.mjs`                           | transitional | root duplicate of integration-owned helper                          | runtime:harness | converge toward integration-owned location                          | low           | Converge duplicate model config surfaces |
| `scripts/ops/__pycache__/model-injector-proxy.cpython-313.pyc` | remove       | generated bytecode does not belong in the maintained surface        | runtime:harness | delete and ignore if needed                                         | low           | Remove generated harness artifacts       |
| `scripts/ops/*/README.md`                                      | canonical    | local ownership docs for harness subtrees                           | docs-harness    | retain while they remain truthful                                   | low           | Classify and stabilize harness runtime   |
| `scripts/ops/runtime/symphony/WORKFLOW.md`                     | transitional | detailed runtime workflow doc exists outside canonical harness docs | docs-harness    | map any live doctrine into new canonical docs, then archive or trim | low           | Archive or rewrite legacy workflow notes |
| `scripts/ops/symphony/WORKFLOW.md`                             | duplicate    | duplicate workflow note outside canonical docs                      | docs-harness    | archive or remove after doctrine extraction                         | low           | Archive or rewrite legacy workflow notes |

## systemd surfaces

| Surface                                         | Disposition | Reason                                                                 | Owner/runtime   | Replacement target                                            | Blocking risk | Follow-up issue                        |
| ----------------------------------------------- | ----------- | ---------------------------------------------------------------------- | --------------- | ------------------------------------------------------------- | ------------- | -------------------------------------- |
| `services/systemd/anqr-symphony-runner.service` | canonical   | maintained runner entrypoint                                           | runtime:harness | retain                                                        | low           | Classify and stabilize harness runtime |
| `services/systemd/anqr-symphony-runner.timer`   | canonical   | maintained runner scheduler                                            | runtime:harness | retain                                                        | low           | Classify and stabilize harness runtime |
| `services/systemd/anqr-queue-feeder.service`    | canonical   | maintained queue maintenance entrypoint                                | runtime:harness | retain                                                        | low           | Classify and stabilize harness runtime |
| `services/systemd/anqr-queue-feeder.timer`      | canonical   | maintained queue maintenance scheduler                                 | runtime:harness | retain                                                        | low           | Classify and stabilize harness runtime |
| `services/systemd/anqr-nightly.service`         | canonical   | maintained nightly entrypoint                                          | runtime:harness | retain                                                        | low           | Classify and stabilize harness runtime |
| `services/systemd/anqr-nightly.timer`           | canonical   | maintained nightly scheduler                                           | runtime:harness | retain                                                        | low           | Classify and stabilize harness runtime |
| `services/systemd/anqr-email-ingest.service`    | optional    | useful operator integration, but not required for core product runtime | runtime:harness | retain as optional until later decision                       | low           | Publish runtime contract               |
| `services/systemd/anqr-email-ingest.timer`      | optional    | useful operator integration, but not required for core product runtime | runtime:harness | retain as optional until later decision                       | low           | Publish runtime contract               |
| `services/systemd/anqr-ops.env`                 | canonical   | documented env contract for user services                              | runtime:harness | retain with human-only secret handling                        | medium        | Publish runtime contract               |
| `services/systemd/README.md`                    | canonical   | explains stable operator contract                                      | docs-harness    | retain                                                        | low           | Classify and stabilize harness runtime |
| `services/systemd/.gitignore`                   | canonical   | generated/runtime hygiene                                              | runtime:harness | retain                                                        | low           | Classify and stabilize harness runtime |
| `services/systemd/.gitkeep`                     | optional    | placeholder only                                                       | runtime:harness | retain or drop later depending on directory persistence needs | low           | Classify and stabilize harness runtime |

## Recommended next order

1. keep root stable operator entrypoints until convergence is deliberate
2. remove generated artifacts like `__pycache__` first
3. converge duplicate implementation files only after control-flow and runtime-contract docs are accepted
4. do not delete service units until launch/runtime doctrine says they are not required

## Risk / rollback

- This report is classification only. No runtime files were removed or altered.
