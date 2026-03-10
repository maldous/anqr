# Changelog

All notable changes to ANQR are documented here.
Each resolved issue should add an entry under the current date heading.

## 2026-03-10

- fix(ops): include explicit process exit reasons in structured codex startup failure diagnostics
- fix(ops): add Ollama VRAM/KV cache pressure health check to harness report
- test(ops): add provider cascade integration harness check for model-injector failover
- fix(ops): add structured startup diagnostics and error categorization for codex credit gate failures

## 2026-03-09

- fix(sonar): use globalThis instead of self in worker contexts (ANQ-284)
- fix(sonar): remove unused catch parameters in server function (ANQ-284)
- fix(sonar): use element.remove() instead of parentNode.removeChild (ANQ-280)
- fix(sonar): prefer Math.trunc/Math.round over bitwise OR zero truncation (ANQ-282)
- fix(sonar): use RegExp.exec instead of String.match for simple patterns (ANQ-287)
- fix(ops): clean Linear noise by hardening CI monitor workflow matching/repo filtering and auto-resolving harness issues in guardian
- fix(ci): shorten GitHub quality gate to static quality checks; move runtime app tests under `make test`
- fix(workflow): route catastrophic retry escalations to `Todo` (AI retry lane) and normalize human-only queue in `Pending`
- fix(ops): add `--help` / `-h` support to Linear list CLI and improve unknown-flag guidance
- fix(build): make `make sonar` non-blocking when local SonarQube is unavailable
- fix(ops): record cloud `gpt-5.3-codex` selection in credit-gate model state to prevent stale fallback model markers
- docs(harness): codify Sonar triage loop and bootstrap token refresh requirements
- fix(ops): propagate `SONAR_*` into Symphony EnvironmentFile and bootstrap archive so agent runs can query Sonar APIs
- fix(ops): make credit-gate failure memory PID-aware with expiring skip entries to prevent stale cross-agent provider poisoning
- fix(ops): treat dashboard `has_credits=false` with `balance=nil` as unknown telemetry and retry `gpt-5.3-codex` first
- fix(ops): make `sonar-report` robust to script execute-bit drift by invoking export script via `bash`
- fix(sonar): report only unresolved Sonar issues in exports and exclude localized static docs from source analysis noise

## 2026-03-07

- fix(ops): add `additional_drop_params` defense-in-depth for Groq/Gemini/OpenRouter cloud models (`litellm-config.yaml`)
- fix(ops): transform `/v1/models` response in model-injector to add `"models"` key for Codex CLI compatibility
- fix(ops): fix litellm alias naming (colon→dash) and add case branch for `qwen2.5-coder-7b-32t`
- fix(ops): enable GPU partial offload for Ollama (removed `CUDA_VISIBLE_DEVICES=-1`, added flash attention)

## 2026-03-06

- fix: reset pooled canvas smoothing state (`598c85d5`)
- fix: make sonar non-blocking when unavailable (`b4ab81a3`)
- fix: inventory gallery execution paths (`dcad859f`)
- fix: bump android version (`b9be5a4e`)
- fix: validate make install (`104716dd`)
- feat(ops): harden agent harness, terminate sentinel loop, improve credit gate (`1be900af`)
- fix: regenerate sitemap (`b2e80a2b`)
- fix: add orphan child hygiene report (`f836f449`)
- fix: add 2026 ux strategy roadmap (`fc7833af`)
- fix(ops): handle gzip-compressed request bodies in model-injector proxy (`cc035faa`)
- fix(ops): add SO_REUSEADDR/SO_REUSEPORT to model-injector to prevent port conflicts (`b7188fa4`)
- feat(ops): add model-injector proxy to fix Codex CLI model=None bug (`42cfaac2`)
- fix(ops): route all fallbacks through LiteLLM proxy for Responses API translation (`90392caf`)
- fix(ops): add terminal state guard and push step to simplified WORKFLOW.md (`b4267cd8`)
- fix(ops): drastically simplify WORKFLOW.md for 3B model capability (`799da0c7`)
- feat(ops): add LiteLLM proxy for Ollama tool-call translation (`101b86f4`)
- feat(ops): add minimal WORKFLOW-3B.md for qwen2.5-coder:3b context budget (`de5ebac2`)
- feat(ops): add 3B-ready issue format, [NEEDS-PRECOMPUTE] pattern (`18ea20e6`)
- fix(ops): simplify sentinel to 3-step heartbeat, auto-feed Symphony via guardian (`c6210da1`)
- feat(ops): add sentinel dead man's switch to linear guardian (`1ff27ce9`)
- feat(ops): fully autonomous workflow — skip Human Review except for payment issues (`6188fe00`)
- fix(ops): harden credit-gate, fix ollama audit, resolve lint/format blockers (`39db20b5`)
- docs: remove legacy markdown stubs, update all references — ANQ-66 (`d74ac2c6`)
- docs: migrate project knowledge into canonical docs tree — ANQ-7 (`d0a4fce1`)
- feat(ops): full autonomous Symphony pipeline with dynamic costing (`bb1dc929`)

## 2026-03-05

- test: raise dither scan-gate timeouts for CI stability (`3cc68f27`)
- build: mark cross-platform netlify optional bins as optional (`11dc4ec4`)

## 2026-03-04

- fix: performance and quality fixes caused by incorrect changes (`d19f7822`)
- fix(gallery): align local/browser parity and capture defaults (`15f5226b`)
- fix: flaky overlay/animation Playwright tests (`eaae4924`)

## 2026-03-02

- fix: language update (`b326a366`)
- fix: QR-art frame caching and wire new i18n status keys (`cd9a050b`)
- perf: accelerate animated dither pipeline and frame effects (`92aea582`)
- perf: speed up animated GIF preview scan-gate retries (`e3698194`)
- fix(overlay): stabilize color preprocessing and scan-gate rescue (`6f50c659`)

## 2026-03-01

- fix(overlay): apply power curve to intensity slider so 50% maps to ~6% effective (`b8d7829c`)
- fix(scan-gate): validate only frame 0 for animation decodability (`c6f6342d`)
- fix(analyze): resolve Analyze failing for animated QR codes (`46e8a7f0`)
- perf(render): improve luminance sampling and qart target extraction (`78387ad5`)
- perf(qr-generator): pack overlay data and trim render/server hot-path churn (`ce76ea00`)
- perf(animation): reduce decode fallback and patch copy overhead (`575694b8`)
- perf(startup): lazy-load exporter module in download path (`9f825bf2`)
- perf(bundle): isolate qart, analyzer, and generated gallery chunks (`c7a7d790`)
- perf(render): trim hot-loop style churn and hash overhead (`d1b8c812`)
- perf(workers): switch validation and qart payloads to transferable pixel buffers (`3d8131f9`)
- perf(startup): lazy-load qr-art core from editor paths (`613c68c9`)
- feat(qr-art): worker pipeline, frame stability, and busy overlay UX (`dac6f7d2`)
- feat(qart): offload artwork generation to worker (`f31432a0`)
