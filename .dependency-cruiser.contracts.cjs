/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  allowedSeverity: "error",
  allowed: [
    {
      from: { path: "^packages/contracts/([^/]+)/" },
      to: {
        path: [
          "^packages/contracts/$1/",
          "^packages/contracts/[^/]+/(index|src/index)\\.",
          "^node_modules/tslib/",
          "^node_modules/zod/",
          "^node_modules/@ts-rest/",
        ],
      },
    },
    {
      comment:
        "Allow analyze contracts to import from generator contracts for shared types (e.g., ecc-level). " +
        "This is the only cross-contract dependency permitted.",
      from: { path: "^packages/contracts/analyze/" },
      to: { path: "^packages/contracts/generator/(index|src/index)\\." },
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
