/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ── Structural integrity ──────────────────────────────────────────
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies lead to hard-to-reason-about code.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'info',
      comment: 'Orphan modules are not reachable from any entry point.',
      from: { orphan: true, pathNot: ['\\.(spec|test)\\.', '\\.d\\.ts$', '\\.gitkeep$'] },
      to: {},
    },

    // ══════════════════════════════════════════════════════════════════
    // Target architecture boundaries (packages/)
    // These encode the destination monorepo layout. They do not fire
    // on the current src/ structure — that is intentional.
    // ══════════════════════════════════════════════════════════════════

    // ── Domain layer isolation (architecture-standards.md rule 5) ─────
    {
      name: 'domain-no-platform-imports',
      severity: 'error',
      comment: 'Domain packages must remain runtime-agnostic.',
      from: { path: '^packages/domain/' },
      to: { path: '^packages/platform/' },
    },
    {
      name: 'domain-no-ui-imports',
      severity: 'error',
      comment: 'Domain packages must not import UI packages.',
      from: { path: '^packages/domain/' },
      to: { path: '^packages/ui/' },
    },
    {
      name: 'domain-no-app-imports',
      severity: 'error',
      comment: 'Domain packages must not import app packages.',
      from: { path: '^packages/domain/' },
      to: { path: '^apps/' },
    },
    {
      name: 'domain-no-application-imports',
      severity: 'error',
      comment: 'Domain packages must not import application packages (inversion of dependency).',
      from: { path: '^packages/domain/' },
      to: { path: '^packages/application/' },
    },

    // ── Application layer isolation ──────────────────────────────────
    {
      name: 'application-no-app-imports',
      severity: 'error',
      comment: 'Application packages must not import from delivery targets.',
      from: { path: '^packages/application/' },
      to: { path: '^apps/' },
    },
    {
      name: 'application-no-ui-imports',
      severity: 'error',
      comment: 'Application packages must not import UI packages (wrong direction).',
      from: { path: '^packages/application/' },
      to: { path: '^packages/ui/' },
    },

    // ── UI layer isolation ───────────────────────────────────────────
    {
      name: 'ui-no-app-imports',
      severity: 'error',
      comment: 'UI packages must not import from delivery targets.',
      from: { path: '^packages/ui/' },
      to: { path: '^apps/' },
    },
    {
      name: 'ui-no-domain-imports',
      severity: 'error',
      comment:
        'UI packages must not import domain directly (go through application/features). ' +
        'UI stays presentation-only.',
      from: { path: '^packages/ui/' },
      to: { path: '^packages/domain/' },
    },

    // ── Platform layer isolation ─────────────────────────────────────
    {
      name: 'platform-no-app-imports',
      severity: 'error',
      comment: 'Platform packages must not import from delivery targets.',
      from: { path: '^packages/platform/' },
      to: { path: '^apps/' },
    },

    // ── Testing package isolation ────────────────────────────────────
    {
      name: 'no-test-package-in-production',
      severity: 'error',
      comment: 'Production code must not import from testing packages.',
      from: { path: '^(packages/(domain|application|ui|platform)|apps)/' },
      to: { path: '^packages/testing/' },
    },

    // ── Tools/harness isolation ──────────────────────────────────────
    {
      name: 'no-tools-in-packages',
      severity: 'error',
      comment: 'Packages and apps must not import from tools/harness.',
      from: { path: '^(packages|apps)/' },
      to: { path: '^tools/' },
    },

    // ── Forbidden broad bucket names (architecture-standards.md) ────
    {
      name: 'no-broad-bucket-packages',
      severity: 'warn',
      comment:
        'Broad generic sinks (core, common, helpers, misc, utils, types, data, store) ' +
        'are forbidden at package scope per architecture-standards.md.',
      from: {
        path: '^packages/(core|common|helpers|misc|utils|types|data|store)/',
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
      name: 'src-domain-no-platform',
      severity: 'warn',
      comment:
        'domain/ must not import platform/ (runtime-agnostic rule). ' +
        'Inherited: 4 violations (3 type-only CanvasFactory, 1 validation-worker-client).',
      from: { path: '^src/domain/' },
      to: { path: '^src/platform/' },
    },
    {
      name: 'src-domain-no-app',
      severity: 'error',
      comment: 'domain/ must not import app/ (shell is a delivery target).',
      from: { path: '^src/domain/' },
      to: { path: '^src/app/' },
    },
    {
      name: 'src-domain-no-ui',
      severity: 'error',
      comment: 'domain/ must not import ui/ or components/ (wrong direction).',
      from: { path: '^src/domain/' },
      to: { path: '^src/(ui|components)/' },
    },
    {
      name: 'src-domain-no-features',
      severity: 'error',
      comment: 'domain/ must not import features/ (features orchestrate domain, not the reverse).',
      from: { path: '^src/domain/' },
      to: { path: '^src/features/' },
    },

    // ── UI → domain direction guard (src/) ───────────────────────────
    {
      name: 'src-ui-no-domain',
      severity: 'error',
      comment:
        'ui/ and components/ must not import domain/ directly. ' +
        'UI stays presentation-only; go through features/ for domain access.',
      from: { path: '^src/(ui|components)/' },
      to: { path: '^src/domain/' },
    },

    // ── Application layer isolation (src/) ───────────────────────────
    {
      name: 'src-features-no-app',
      severity: 'warn',
      comment:
        'features/ must not import app/ (app shell is a delivery target). ' +
        'Inherited: ~45 violations via search-context, i18n, and routing imports.',
      from: { path: '^src/features/' },
      to: { path: '^src/app/' },
    },
    {
      name: 'src-app-no-domain-sink',
      severity: 'warn',
      comment:
        'app/ must not import domain/ directly (prevents app shell from becoming ' +
        'a sink for domain logic). Inherited: 1 type-only violation in app/i18n/analyze-messages.ts.',
      from: { path: '^src/app/' },
      to: { path: '^src/domain/' },
    },
    {
      name: 'src-no-cross-feature-imports',
      severity: 'error',
      comment:
        'Features must not import other features\' internals. ' +
        'Each feature is a vertical slice; cross-feature coupling goes through shared domain or platform.',
      from: { path: '^src/features/([^/]+)/' },
      to: { path: '^src/features/([^/]+)/', pathNot: '^src/features/$1/' },
    },

    // ── Broad bucket prevention (src/) ────────────────────────────────
    // Existing broad-bucket directories (lib/6, types/16, data/4,
    // store/82, state/1) are inherited structural debt tracked for
    // migration into bounded contexts — not enforced as rules.
    {
      name: 'src-no-new-broad-buckets',
      severity: 'warn',
      comment:
        'Prevent creation of new cross-context broad sinks per architecture-standards.md. ' +
        'Existing src/lib, src/types, src/data, src/store, src/state are inherited debt.',
      from: {
        path: '^src/(core|common|helpers|misc|utils)/',
      },
      to: {},
    },

    // ══════════════════════════════════════════════════════════════════
    // Package encapsulation & dependency hygiene
    // ══════════════════════════════════════════════════════════════════

    {
      name: 'no-deep-package-imports',
      severity: 'error',
      comment: 'Never deep-import another package internals (ai-agent-rules.md).',
      from: { path: '^packages/[^/]+/[^/]+/' },
      to: {
        path: '^packages/[^/]+/[^/]+/',
        pathNot: '^packages/[^/]+/[^/]+/index\\.',
      },
    },
    {
      name: 'no-dev-deps-in-src',
      severity: 'error',
      comment: 'Production source should not depend on devDependencies.',
      from: { path: '^(src|packages|apps)/' },
      to: { dependencyTypes: ['npm-dev'] },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/(@[^/]+/[^/]+|[^/]+)',
      },
    },
  },
};
