/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  options: {
    tsConfig: {
      fileName: "tsconfig.json",
    },
    doNotFollow: {
      path: "node_modules",
    },
    includeOnly: "^src",
    exclude: {
      path: [
        "^src/content/generated",
        "^src/content/i18n/static",
        "^src/i18n/static",
        "\.spec\.",
        "\.test\.",
      ],
    },
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"],
    },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/[^/]+",
      },
    },
  },
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "no-app-to-domain",
      severity: "error",
      comment: "app composes features and infrastructure, but does not directly own domain logic.",
      from: { path: "^src/app/" },
      to: { path: "^src/domain/" },
    },
    {
      name: "no-ui-to-app-features-state-domain-platform",
      severity: "error",
      comment: "ui stays presentational and generic.",
      from: { path: "^src/ui/" },
      to: { path: "^src/(app|features|state|domain|platform)/" },
    },
    {
      name: "no-features-cross-import",
      severity: "error",
      comment: "features must not depend on other features directly.",
      from: { path: "^src/features/([^/]+)/" },
      to: {
        path: "^src/features/([^/]+)/",
        pathNot: "^src/features/$1/",
      },
    },
    {
      name: "no-state-to-ui-app-platform-features",
      severity: "error",
      comment: "state owns state and selectors only.",
      from: { path: "^src/state/" },
      to: { path: "^src/(ui|app|platform|features)/" },
    },
    {
      name: "no-domain-to-ui-app-features-state-platform",
      severity: "error",
      comment: "domain must remain framework and environment neutral.",
      from: { path: "^src/domain/" },
      to: { path: "^src/(ui|app|features|state|platform)/" },
    },
    {
      name: "no-domain-to-react",
      severity: "error",
      comment: "domain must not import React or UI frameworks.",
      from: { path: "^src/domain/" },
      to: { path: "^(react|react-dom|react-router|react-i18next)$" },
    },
    {
      name: "no-domain-to-native-browser-vendors",
      severity: "error",
      comment: "domain must not depend on browser/native runtime vendors.",
      from: { path: "^src/domain/" },
      to: { path: "^(@capacitor/|@sentry/|@netlify/|netlify:|workbox|idb|howler)" },
    },
    {
      name: "no-platform-to-ui-app-features-state",
      severity: "error",
      comment: "platform adapts environment details to the rest of the system.",
      from: { path: "^src/platform/" },
      to: { path: "^src/(ui|app|features|state)/" },
    },
    {
      name: "no-infra-to-app-ui-features-state-domain-platform",
      severity: "error",
      comment: "infra provides low-level services; it should not know product structure.",
      from: { path: "^src/infra/" },
      to: { path: "^src/(app|ui|features|state|domain|platform)/" },
    },
    {
      name: "no-content-executable-deps",
      severity: "error",
      comment: "content should stay data-oriented.",
      from: { path: "^src/content/" },
      to: { path: "^src/(app|ui|features|state|domain|platform|infra)/" },
    },
    {
      name: "no-root-modules-folder-dependency",
      severity: "warn",
      comment: "temporary rule while migrating away from legacy modules folder.",
      from: { path: "^src/" },
      to: { path: "^src/modules/index\.ts$" },
    },
    {
      name: "no-root-core-folder-dependency",
      severity: "warn",
      comment: "temporary rule while removing generic core bucket.",
      from: { path: "^src/" },
      to: { path: "^src/modules/core/index\.ts$" },
    },
  ],
};