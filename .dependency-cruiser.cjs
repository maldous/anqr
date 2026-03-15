/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
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
    {
      name: 'domain-no-platform-imports',
      severity: 'error',
      comment: 'Domain packages must remain runtime-agnostic (architecture-standards.md rule 5).',
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
