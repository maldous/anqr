/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  allowedSeverity: "error",
  allowed: [
    {
      from: { path: "^packages/contracts/" },
      to: {
        path: [
          "^packages/contracts/",
          "^node_modules/tslib/",
        ],
      },
    },
  ],
  forbidden: [
    {
      name: "not-to-unresolvable",
      severity: "error",
      comment: "Contract imports must resolve cleanly.",
      from: {},
      to: { couldNotResolve: true },
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
  ],
  options: {
    includeOnly: {
      path: "^packages/contracts/",
    },
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
  },
};
