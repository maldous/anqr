// Generated from ../../../scripts/ops/reporting/harness-report.mjs:538

import { checkAstDensity } from "./check-ast-density.mjs";
import { checkCspellCoverage } from "./check-cspell-coverage.mjs";
import { checkDepcruise } from "./check-depcruise.mjs";
import { checkDocsFreshness } from "./check-docs-freshness.mjs";
import { checkLinearRagPipeline } from "./check-linear-rag-pipeline.mjs";
import { checkLint } from "./check-lint.mjs";
import { checkLitellmRouting } from "./check-litellm-routing.mjs";
import { checkOllamaHealth } from "./check-ollama-health.mjs";
import { checkPipelineLatency } from "./check-pipeline-latency.mjs";
import { checkRepoStructure } from "./check-repo-structure.mjs";
import { checkSonarAudit } from "./check-sonar-audit.mjs";
import { checkTestUnit } from "./check-test-unit.mjs";
import { checkTypecheck } from "./check-typecheck.mjs";

export const CHECKS = {
  "repo-structure": { fn: checkRepoStructure, async: false },
  typecheck: { fn: checkTypecheck, async: false },
  lint: { fn: checkLint, async: false },
  "test-unit": { fn: checkTestUnit, async: false },
  depcruise: { fn: checkDepcruise, async: false },
  "docs-freshness": { fn: checkDocsFreshness, async: false },
  "ollama-health": { fn: checkOllamaHealth, async: true },
  "litellm-routing": { fn: checkLitellmRouting, async: false },
  "cspell-coverage": { fn: checkCspellCoverage, async: false },
  "ast-density": { fn: checkAstDensity, async: false },
  "sonar-audit": { fn: checkSonarAudit, async: true },
  "pipeline-latency": { fn: checkPipelineLatency, async: true },
  "linear-rag-pipeline": { fn: checkLinearRagPipeline, async: true },
};
