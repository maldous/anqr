// Generated from ../../harness/ops/linear-issue-review.mjs:102

export const CLOSE_AS_DONE = {
  "ANQ-417": "src/modules/ no longer exists — all module directories dissolved into packages/.",
  "ANQ-415":
    "src/ layers fully dissolved into packages/ architecture. No cross-layer violations remain in old structure.",
  "ANQ-413":
    "src/ layers fully dissolved. Cross-layer audit is moot — architecture now enforced at packages/ level.",
  "ANQ-397": "src/components/sections/ no longer exists — dissolved into packages/.",
  "ANQ-396": "src/components/ no longer exists — dissolved into packages/.",
  "ANQ-395": "Service description already reads 'AI agent', not 'Ollama'. No update needed.",
  "ANQ-377":
    "Email infrastructure exists on main: email-ingest.mjs, notify.mjs, notify-impl.mjs, anqr-email-ingest.service/timer.",
  "ANQ-374":
    "Symphony execution agent implemented: symphony-agent.mjs, symphony-runner.mjs, symphony-credit-gate.mjs.",
  "ANQ-373":
    "Queue feeder operational: anqr-queue-feeder.service/timer, symphony-queue-control.mjs.",
  "ANQ-372":
    "Symphony autonomous operations running: all systemd services active, harness-report operational.",
  "ANQ-371": "harness-report.mjs implemented with quick/continuous/full profiles.",
  "ANQ-370":
    "Local execution path operational: litellm-config.yaml, model-injector-proxy.py, ollama-local-audit.mjs.",
  "ANQ-369": "Archived issue migration completed as part of foundation doctrine reboot.",
  "ANQ-368":
    "Symphony queue control implemented: symphony-queue-control.mjs, symphony-config.mjs with target_min/target_max.",
  "ANQ-367":
    "Scheduled operations operational: 4 systemd service/timer pairs (runner, nightly, queue-feeder, email-ingest).",
  "ANQ-366":
    "Guardian + Linear integration implemented: linear-client.mjs, linear-guardian.mjs, notify.mjs.",
  "ANQ-365": "Symphony bootstrap skeleton complete: all harness/ops/ files exist on main.",
  "ANQ-364": "Symphony autonomous operations substrate fully bootstrapped on main.",
  "ANQ-363": "0 .type.ts files remain in src/ or packages/. All migrated to .types.ts.",
  "ANQ-361":
    "architecture-standards.md now documents full repo topology including apps/, packages/, netlify/, harness/ops/, services/systemd/.",
  "ANQ-360": "src/app/ no longer exists — search-context dissolved with full src/ decomposition.",
  "ANQ-359":
    "src/data/ dissolved. src/types/ contains only .d.ts platform type augmentations — correct placement per architecture standards (tsconfig typeRoots).",
  "ANQ-358": "src/components/ no longer exists — dissolved into packages/.",
  "ANQ-357": "src/lib/ no longer exists — dissolved into packages/.",
  "ANQ-356": "src/hooks/ no longer exists — dissolved into packages/.",
  "ANQ-355": "All src/ cross-layer violations resolved via full decomposition into packages/.",
  "ANQ-354":
    "src/modules/ (542 files, 17 directories) fully dissolved into packages/domain/, packages/application/, etc.",
  "ANQ-353": "src/i18n/ resolved — dissolved with full src/ decomposition.",
  "ANQ-352": "CanvasFactory dependency inversion resolved via packages/domain/render/ extraction.",
  "ANQ-351":
    "src/store/ fully decomposed — types to domain, serializers to application, store to feature state.",
  "ANQ-320":
    "Linear guardian orchestration implemented: queue management, hygiene, stale escalation in linear-guardian.mjs.",
  "ANQ-319":
    "Model routing and provider fallback implemented via symphony-credit-gate.mjs provider cascade.",
};
