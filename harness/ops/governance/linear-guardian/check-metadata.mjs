// Generated from ../../../scripts/ops/governance/linear-guardian.mjs:53

import { LABELS } from "../../linear-client.mjs";

export const CHECK_METADATA = {
  "repo-structure": {
    summary: "Repository structure violation detected",
    priority: 2,
    extraLabels: [],
  },
  typecheck: {
    summary: "TypeScript typecheck failure",
    priority: 2,
    extraLabels: [],
  },
  lint: {
    summary: "Lint violations detected (oxlint)",
    priority: 3,
    extraLabels: [],
  },
  "test-unit": {
    summary: "Unit test failure (vitest)",
    priority: 1,
    extraLabels: [LABELS.bug],
  },
  depcruise: {
    summary: "Dependency graph violation (dependency-cruiser)",
    priority: 2,
    extraLabels: [],
  },
  "docs-freshness": {
    summary: "Documentation freshness check failed",
    priority: 4,
    extraLabels: [],
  },
  "ollama-health": {
    summary: "Ollama model health check failed",
    priority: 2,
    extraLabels: [],
  },
  "litellm-routing": {
    summary: "LiteLLM routing configuration invalid",
    priority: 2,
    extraLabels: [],
  },
};
