// Generated from ../../../scripts/ops/reporting/harness-report.mjs:370

import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";

import { PINNED_MODEL } from "./pinned-model.mjs";
import { ROOT } from "./root.mjs";

export function checkLitellmRouting() {
  const configPath = resolve(ROOT, "harness/ops/integrations/model/litellm-config.yaml");
  if (!existsSync(configPath)) {
    return { pass: false, detail: "integrations/model/litellm-config.yaml missing" };
  }

  const content = readFileSync(configPath, "utf-8");

  if (!content.includes("symphony-local")) {
    return {
      pass: false,
      detail: "integrations/model/litellm-config.yaml missing symphony-local alias",
    };
  }

  if (!content.includes(PINNED_MODEL)) {
    return {
      pass: false,
      detail: `integrations/model/litellm-config.yaml does not reference pinned model ${PINNED_MODEL}`,
    };
  }

  const proxyPath = resolve(ROOT, "harness/ops/model-injector-proxy.py");
  if (!existsSync(proxyPath)) {
    return { pass: false, detail: "model-injector-proxy.py missing" };
  }

  return {
    pass: true,
    detail:
      "Integration-owned LiteLLM config is valid, symphony-local alias present, injector proxy exists",
  };
}
