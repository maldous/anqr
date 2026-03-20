/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ── Structural integrity ──────────────────────────────────────────
    {
      name: "not-to-unresolvable",
      severity: "error",
      comment: "All imports must resolve cleanly.",
      from: {
        pathNot: ["^src/vite-env\\.d\\.ts$", "^netlify/edge-functions/seo/handler\\.ts$"],
      },
      to: { couldNotResolve: true },
    },
    {
      name: "no-duplicate-dep-types",
      severity: "warn",
      comment: "Avoid mixing dependency types for the same target.",
      from: {},
      to: { moreThanOneDependencyType: true },
    },
    {
      name: "no-circular",
      severity: "error",
      comment:
        "Circular dependencies lead to hard-to-reason-about code. " +
        "Library-internal worker/plugin cycles (Sentry SDK, Capacitor AdMob) " +
        "are excluded via viaOnly — they are unavoidable third-party artifacts.",
      from: {},
      to: {
        circular: true,
        viaOnly: { pathNot: "dist/assets/(esm|worker|validation-worker|web)-" },
      },
    },
    {
      name: "no-orphans",
      severity: "info",
      comment: "Orphan modules are not reachable from any entry point.",
      from: {
        orphan: true,
        pathNot: [
          "\\.(spec|test)\\.",
          "\\.d\\.ts$",
          "\\.gitkeep$",
          "^dist/",
          "^scripts/",
          "(^|/)\\..+\\.c?[jt]s$",
          "^[^/]+\\.config\\.",
          "^packages/(ui/mobile|ui/design-tokens|testing/(playwright|parity|fixtures|fakes)|config/(tsconfig|eslint|depcruise|build)|application/(onboarding|monetization|gallery)|analytics/ga4)/src/index\\.ts$",
          "^apps/(mobile|api)/src/index\\.ts$",
          "^netlify/functions/qr/(sleep|non-cache-params\\.const|is-test-runtime\\.const|default-netlify-site-id\\.const)\\.ts$",
          "^apps/web/src/seo/(truncate|escape-html|config\\.const)\\.ts$",
        ],
      },
      to: {},
    },

    // ══════════════════════════════════════════════════════════════════
    // Target architecture boundaries (packages/)
    // These encode the destination monorepo layout. They do not fire
    // on the current src/ structure — that is intentional.
    // ══════════════════════════════════════════════════════════════════

    // ── Contract layer isolation ────────────────────────────────────
    {
      name: "contract-api-no-mcp-imports",
      severity: "error",
      comment: "API contracts must not import MCP contracts (parallel delivery surfaces).",
      from: { path: "^packages/contracts/api/" },
      to: { path: "^packages/contracts/mcp/" },
    },
    {
      name: "contract-mcp-no-api-imports",
      severity: "error",
      comment: "MCP contracts must not import API contracts (parallel delivery surfaces).",
      from: { path: "^packages/contracts/mcp/" },
      to: { path: "^packages/contracts/api/" },
    },
    {
      name: "contract-no-domain-imports",
      severity: "error",
      comment: "Contract packages must not import domain runtime packages.",
      from: { path: "^packages/contracts/" },
      to: { path: "^packages/domain/" },
    },
    {
      name: "contract-no-platform-imports",
      severity: "error",
      comment:
        "Contract packages must not import platform adapters or runtime-specific infrastructure.",
      from: { path: "^packages/contracts/" },
      to: { path: "^packages/platform/" },
    },
    {
      name: "contract-no-ui-imports",
      severity: "error",
      comment: "Contract packages must not import UI or presentation code.",
      from: { path: "^packages/contracts/" },
      to: { path: "^packages/ui/" },
    },
    {
      name: "contract-no-app-imports",
      severity: "error",
      comment: "Contract packages must not import app shells or delivery targets.",
      from: { path: "^packages/contracts/" },
      to: { path: "^apps/" },
    },
    {
      name: "contract-no-netlify-imports",
      severity: "error",
      comment: "Contract packages must not import Netlify delivery code.",
      from: { path: "^packages/contracts/" },
      to: { path: "^netlify/" },
    },
    {
      name: "contract-no-application-imports",
      severity: "error",
      comment: "Contract packages must not import orchestration or use-case code.",
      from: { path: "^packages/contracts/" },
      to: { path: "^packages/application/" },
    },
    {
      name: "contract-no-analytics-imports",
      severity: "error",
      comment: "Contract packages must not import analytics or runtime instrumentation.",
      from: { path: "^packages/contracts/" },
      to: { path: "^packages/analytics/" },
    },
    {
      name: "contract-no-observability-imports",
      severity: "error",
      comment: "Contract packages must not import logging, telemetry, or monitoring code.",
      from: { path: "^packages/contracts/" },
      to: { path: "^packages/observability/" },
    },
    {
      name: "contract-no-config-imports",
      severity: "error",
      comment: "Contract packages must not depend on runtime config or environment resolution.",
      from: { path: "^packages/contracts/" },
      to: { path: "^packages/config/" },
    },
    {
      name: "contract-no-test-imports",
      severity: "error",
      comment: "Contract packages must not import test helpers, fixtures, or mocks.",
      from: { path: "^packages/contracts/" },
      to: { path: "^packages/testing/" },
    },
    {
      name: "contract-no-tools-imports",
      severity: "error",
      comment: "Contract packages must not import tools, scripts, generators, or harness code.",
      from: { path: "^packages/contracts/" },
      to: { path: "^(tools|scripts)/" },
    },
    {
      name: "contract-no-src-imports",
      severity: "error",
      comment: "Contract packages must not import from the transitional src/ root.",
      from: { path: "^packages/contracts/" },
      to: { path: "^src/" },
    },

    // ── Domain layer isolation (architecture-standards.md rule 5) ─────
    {
      name: "domain-no-platform-imports",
      severity: "error",
      comment: "Domain packages must remain runtime-agnostic.",
      from: { path: "^packages/domain/" },
      to: { path: "^packages/platform/" },
    },
    {
      name: "domain-no-ui-imports",
      severity: "error",
      comment: "Domain packages must not import UI packages.",
      from: { path: "^packages/domain/" },
      to: { path: "^packages/ui/" },
    },
    {
      name: "domain-no-app-imports",
      severity: "error",
      comment: "Domain packages must not import app packages.",
      from: { path: "^packages/domain/" },
      to: { path: "^apps/" },
    },
    {
      name: "domain-no-application-imports",
      severity: "error",
      comment: "Domain packages must not import application packages (inversion of dependency).",
      from: { path: "^packages/domain/" },
      to: { path: "^packages/application/" },
    },
    {
      name: "domain-no-observability-imports",
      severity: "error",
      comment: "Domain packages must not import logging, telemetry, or monitoring code.",
      from: { path: "^packages/domain/" },
      to: { path: "^packages/observability/" },
    },
    {
      name: "domain-no-analytics-imports",
      severity: "error",
      comment: "Domain packages must not import analytics packages.",
      from: { path: "^packages/domain/" },
      to: { path: "^packages/analytics/" },
    },

    // ── Application layer isolation ──────────────────────────────────
    {
      name: "application-no-platform-imports",
      severity: "error",
      comment: "Application packages must depend on ports/contracts rather than platform adapters.",
      from: { path: "^packages/application/" },
      to: { path: "^packages/platform/" },
    },
    {
      name: "application-no-app-imports",
      severity: "error",
      comment: "Application packages must not import from delivery targets.",
      from: { path: "^packages/application/" },
      to: { path: "^apps/" },
    },
    {
      name: "application-no-ui-imports",
      severity: "error",
      comment: "Application packages must not import UI packages (wrong direction).",
      from: { path: "^packages/application/" },
      to: { path: "^packages/ui/" },
    },
    {
      name: "application-no-observability-imports",
      severity: "error",
      comment: "Application packages must not import logging, telemetry, or monitoring code.",
      from: { path: "^packages/application/" },
      to: { path: "^packages/observability/" },
    },
    {
      name: "application-no-analytics-imports",
      severity: "error",
      comment: "Application packages must not import analytics packages.",
      from: { path: "^packages/application/" },
      to: { path: "^packages/analytics/" },
    },

    // ── UI layer isolation ───────────────────────────────────────────
    {
      name: "ui-no-platform-imports",
      severity: "error",
      comment: "UI packages must not import platform adapters directly.",
      from: { path: "^packages/ui/" },
      to: { path: "^packages/platform/" },
    },
    {
      name: "ui-no-app-imports",
      severity: "error",
      comment: "UI packages must not import from delivery targets.",
      from: { path: "^packages/ui/" },
      to: { path: "^apps/" },
    },
    {
      name: "ui-no-domain-imports",
      severity: "error",
      comment:
        "UI packages must not import domain directly (go through application/features). " +
        "UI stays presentation-only.",
      from: { path: "^packages/ui/" },
      to: { path: "^packages/domain/" },
    },

    // ── Platform layer isolation ─────────────────────────────────────
    {
      name: "platform-no-app-imports",
      severity: "error",
      comment: "Platform packages must not import from delivery targets.",
      from: { path: "^packages/platform/" },
      to: { path: "^apps/" },
    },

    // ── Testing package isolation ────────────────────────────────────
    {
      name: "no-test-package-in-production",
      severity: "error",
      comment: "Production code must not import from testing packages.",
      from: {
        path: "^(packages/(domain|application|ui|platform|observability|analytics)|apps|netlify|src)/",
      },
      to: { path: "^packages/testing/" },
    },

    // ── Tools/harness isolation ──────────────────────────────────────
    {
      name: "no-tools-in-packages",
      severity: "error",
      comment: "Production runtime code must not import from tools/harness.",
      from: { path: "^(packages|apps|netlify|src)/" },
      to: { path: "^tools/" },
    },
    {
      name: "no-harness-in-packages",
      severity: "error",
      comment: "Production runtime code must not import from scripts/ops/.",
      from: { path: "^(packages|apps|netlify|src)/" },
      to: { path: "^scripts/ops/" },
    },

    // ── Apps must not import src/ once packages exist ─────────────────
    {
      name: "apps-no-src-imports",
      severity: "error",
      comment: "Apps must not import from the transitional src/ root.",
      from: { path: "^apps/" },
      to: { path: "^src/" },
    },
    {
      name: "apps-no-app-imports",
      severity: "error",
      comment: "Apps must not import from other apps.",
      from: { path: "^apps/([^/]+)/" },
      to: { path: "^apps/([^/]+)/", pathNot: "^apps/$1/" },
    },
    {
      name: "apps-no-domain-imports",
      severity: "error",
      comment:
        "Apps must not import domain directly; go through application/contracts/ui/platform.",
      from: { path: "^apps/" },
      to: { path: "^packages/domain/" },
    },

    // ── Packages must not import src/ ────────────────────────────────
    {
      name: "packages-no-src-imports",
      severity: "error",
      comment: "Packages must not import from the transitional src/ root.",
      from: { path: "^packages/" },
      to: { path: "^src/" },
    },

    // ── Netlify may import only approved package layers ──────────────
    {
      name: "netlify-no-app-imports",
      severity: "error",
      comment: "Netlify handlers must not import from app targets.",
      from: { path: "^netlify/" },
      to: { path: "^apps/" },
    },
    {
      name: "netlify-no-src-imports",
      severity: "error",
      comment: "Netlify handlers must not import from the transitional src/ root.",
      from: { path: "^netlify/" },
      to: { path: "^src/" },
    },
    {
      name: "netlify-no-domain-imports",
      severity: "error",
      comment:
        "Netlify handlers must depend on application-facing entrypoints, not domain directly.",
      from: { path: "^netlify/" },
      to: { path: "^packages/domain/" },
    },
    {
      name: "netlify-no-disallowed-package-layers",
      severity: "error",
      comment:
        "Netlify may depend only on application-facing code, contracts, platform/node, and delivery-owned observability.",
      from: { path: "^netlify/" },
      to: {
        path: "^packages/(ui|analytics|testing|config)/",
      },
    },
    {
      name: "netlify-no-nonnode-platform-imports",
      severity: "error",
      comment: "Netlify must not import browser, worker, or native platform adapters.",
      from: { path: "^netlify/" },
      to: { path: "^packages/platform/(browser|worker|native)/" },
    },
    {
      name: "runtime-no-config-package-imports",
      severity: "error",
      comment: "Runtime code must not import non-runtime config packages.",
      from: {
        path: "^(packages/(domain|application|ui|platform|observability|analytics)|apps|netlify|src)/",
      },
      to: { path: "^packages/config/" },
    },

    // ── Forbidden broad bucket names (architecture-standards.md) ────
    {
      name: "no-broad-bucket-packages",
      severity: "warn",
      comment:
        "Broad generic sinks (core, common, helpers, misc, utils, types, data, store) " +
        "are forbidden at package scope per architecture-standards.md.",
      from: {
        path: "^packages/(core|common|helpers|misc|utils|types|data|store)/",
      },
      to: {},
    },

    // ══════════════════════════════════════════════════════════════════
    // Current structure governance (src/)
    // Transitional rules that enforce boundaries on the existing src/
    // layout. Inherited violations use 'warn' to avoid blocking while
    // migration is underway; clean boundaries use 'error' to prevent
    // new regressions.
    // ══════════════════════════════════════════════════════════════════

    // ── Domain isolation (src/) ──────────────────────────────────────
    {
      name: "src-domain-no-platform",
      severity: "warn",
      comment:
        "domain/ must not import platform/ (runtime-agnostic rule). " +
        "Inherited: 4 violations (3 type-only CanvasFactory, 1 validation-worker-client).",
      from: { path: "^src/domain/" },
      to: { path: "^src/platform/" },
    },
    {
      name: "src-domain-no-app",
      severity: "error",
      comment: "domain/ must not import app/ (shell is a delivery target).",
      from: { path: "^src/domain/" },
      to: { path: "^src/app/" },
    },
    {
      name: "src-domain-no-ui",
      severity: "error",
      comment: "domain/ must not import ui/ or components/ (wrong direction).",
      from: { path: "^src/domain/" },
      to: { path: "^src/(ui|components)/" },
    },
    {
      name: "src-domain-no-features",
      severity: "error",
      comment: "domain/ must not import features/ (features orchestrate domain, not the reverse).",
      from: { path: "^src/domain/" },
      to: { path: "^src/features/" },
    },

    // ── State layer isolation (src/) ──────────────────────────────────
    {
      name: "src-state-no-ui",
      severity: "error",
      comment:
        "state/ must not import ui/ or components/ (dependency-rules.md: state forbidden from ui).",
      from: { path: "^src/state/" },
      to: { path: "^src/(ui|components)/" },
    },
    {
      name: "src-state-no-app",
      severity: "error",
      comment: "state/ must not import app/ (dependency-rules.md: state forbidden from app).",
      from: { path: "^src/state/" },
      to: { path: "^src/app/" },
    },
    {
      name: "src-state-no-platform",
      severity: "error",
      comment:
        "state/ must not import platform/ (dependency-rules.md: state forbidden from platform).",
      from: { path: "^src/state/" },
      to: { path: "^src/platform/" },
    },

    // ── UI layer isolation (src/) ────────────────────────────────────
    {
      name: "src-ui-no-domain",
      severity: "error",
      comment:
        "ui/ and components/ must not import domain/ directly. " +
        "UI stays presentation-only; go through features/ for domain access.",
      from: { path: "^src/(ui|components)/" },
      to: { path: "^src/domain/" },
    },
    {
      name: "src-ui-no-state",
      severity: "error",
      comment:
        "ui/ and components/ must not import state/ (dependency-rules.md: ui forbidden from state).",
      from: { path: "^src/(ui|components)/" },
      to: { path: "^src/state/" },
    },
    {
      name: "src-ui-no-store",
      severity: "warn",
      comment:
        "ui/ and components/ must not import store/ (broad bucket for state stores). " +
        "Inherited: 8 violations (Tier type + useQRStore from store/qr-store).",
      from: { path: "^src/(ui|components)/" },
      to: { path: "^src/store/" },
    },
    {
      name: "src-ui-no-features",
      severity: "warn",
      comment:
        "ui/ and components/ must not import features/ (wrong direction — features orchestrate ui, not the reverse). " +
        "Inherited: ~30 violations (re-export shims in components/ pointing to features/).",
      from: { path: "^src/(ui|components)/" },
      to: { path: "^src/features/" },
    },
    {
      name: "src-ui-no-platform",
      severity: "warn",
      comment:
        "ui/ and components/ must not import platform/ directly (dependency-rules.md: ui forbidden from browser/native adapters). " +
        "Inherited: 4 violations (clipboard, ads).",
      from: { path: "^src/(ui|components)/" },
      to: { path: "^src/platform/" },
    },
    {
      name: "src-ui-no-app",
      severity: "warn",
      comment:
        "ui/ and components/ must not import app/ (wrong direction — app composes ui, not the reverse). " +
        "Inherited: 5 violations (i18n, pages, shell).",
      from: { path: "^src/(ui|components)/" },
      to: { path: "^src/app/" },
    },

    // ── Platform layer isolation (src/) ──────────────────────────────
    {
      name: "src-platform-no-ui",
      severity: "error",
      comment:
        "platform/ must not import ui/ or components/ (dependency-rules.md: platform forbidden from ui).",
      from: { path: "^src/platform/" },
      to: { path: "^src/(ui|components)/" },
    },
    {
      name: "src-platform-no-features",
      severity: "error",
      comment:
        "platform/ must not import features/ (dependency-rules.md: platform forbidden from features).",
      from: { path: "^src/platform/" },
      to: { path: "^src/features/" },
    },
    {
      name: "src-platform-no-app",
      severity: "error",
      comment: "platform/ must not import app/ (dependency-rules.md: platform forbidden from app).",
      from: { path: "^src/platform/" },
      to: { path: "^src/app/" },
    },

    // ── Application layer isolation (src/) ───────────────────────────
    {
      name: "src-features-no-app",
      severity: "warn",
      comment:
        "features/ must not import app/ (app shell is a delivery target). " +
        "Inherited: ~45 violations via search-context, i18n, and routing imports.",
      from: { path: "^src/features/" },
      to: { path: "^src/app/" },
    },
    {
      name: "src-app-no-domain-sink",
      severity: "warn",
      comment:
        "app/ must not import domain/ directly (prevents app shell from becoming " +
        "a sink for domain logic). Inherited: 1 type-only violation in app/i18n/analyze-messages.ts.",
      from: { path: "^src/app/" },
      to: { path: "^src/domain/" },
    },
    {
      name: "src-no-cross-feature-imports",
      severity: "error",
      comment:
        "Features must not import other features' internals. " +
        "Each feature is a vertical slice; cross-feature coupling goes through shared domain or platform.",
      from: { path: "^src/features/([^/]+)/" },
      to: { path: "^src/features/([^/]+)/", pathNot: "^src/features/$1/" },
    },

    // ── Broad bucket prevention (src/) ────────────────────────────────
    // Existing broad-bucket directories (lib/6, types/16, data/4,
    // store/82, state/1) are inherited structural debt tracked for
    // migration into bounded contexts — not enforced as rules.
    {
      name: "src-no-new-broad-buckets",
      severity: "warn",
      comment:
        "Prevent creation of new cross-context broad sinks per architecture-standards.md. " +
        "Existing src/lib, src/types, src/data, src/store, src/state are inherited debt.",
      from: {
        path: "^src/(core|common|helpers|misc|utils)/",
      },
      to: {},
    },

    // ══════════════════════════════════════════════════════════════════
    // Package encapsulation & dependency hygiene
    // ══════════════════════════════════════════════════════════════════

    {
      name: "no-package-entrypoint-cycles",
      severity: "error",
      scope: "folder",
      comment:
        "Package public entrypoints must not participate in folder-level cycles. " +
        "This catches package-to-package cycles without flagging internal folder structure.",
      from: { path: "^packages/[^/]+/[^/]+/src/index\\.ts$" },
      to: { circular: true },
    },
    {
      name: "no-deep-package-imports",
      severity: "error",
      comment:
        "Never deep-import another package's internals (ai-agent-rules.md). " +
        "Intra-package imports are allowed. Sub-module barrels (src/*/index.ts) are allowed.",
      from: { path: "^packages/([^/]+/[^/]+)/" },
      to: {
        path: "^packages/[^/]+/[^/]+/",
        pathNot: [
          "^packages/$1/",
          "^packages/[^/]+/[^/]+/(index|src/index)\\.",
          // Sub-module barrels (one level deep under src/)
          "^packages/[^/]+/[^/]+/src/[^/]+/index\\.",
        ],
      },
    },
    {
      name: "apps-no-deep-package-imports",
      severity: "error",
      comment:
        "Apps must consume packages via stable public entrypoints or one-level submodule barrels only.",
      from: { path: "^apps/" },
      to: {
        path: "^packages/[^/]+/[^/]+/",
        pathNot: [
          "^packages/[^/]+/[^/]+/(index|src/index)\\.",
          "^packages/[^/]+/[^/]+/src/[^/]+/index\\.",
        ],
      },
    },
    {
      name: "netlify-no-deep-package-imports",
      severity: "error",
      comment:
        "Netlify delivery code must consume packages via stable public entrypoints, one-level barrels, or explicit server entry files only.",
      from: { path: "^netlify/" },
      to: {
        path: "^packages/[^/]+/[^/]+/",
        pathNot: [
          "^packages/[^/]+/[^/]+/(index|src/index)\\.",
          "^packages/[^/]+/[^/]+/src/[^/]+/index\\.",
          "^packages/[^/]+/[^/]+/src/server/[^/]+\\.",
        ],
      },
    },
    {
      name: "contract-entrypoint-only",
      severity: "error",
      comment: "Only contract package root entrypoints may be imported by external consumers.",
      from: {
        path: "^(packages/(application|domain|ui|platform|observability|analytics|testing|config)/|apps/|netlify/|src/)",
      },
      to: {
        path: "^packages/contracts/([^/]+)/src/",
        pathNot: ["^packages/contracts/[^/]+/(index|src/index)\\."],
      },
    },
    {
      name: "contract-no-orphans",
      severity: "error",
      comment: "Every contract module must be reachable from a declared public entrypoint.",
      from: {
        orphan: true,
        path: "^packages/contracts/",
        pathNot: ["\\.d\\.ts$"],
      },
      to: {},
    },
    {
      name: "no-dev-deps-in-src",
      severity: "error",
      comment: "Production source should not depend on devDependencies.",
      from: { path: "^(src|packages|apps)/" },
      to: { dependencyTypes: ["npm-dev"] },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/(@[^/]+/[^/]+|[^/]+)",
      },
    },
  },
};
