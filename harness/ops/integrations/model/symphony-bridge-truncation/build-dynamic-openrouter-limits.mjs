import { getCachedContextWindowByProviderName } from "../symphony-openai-bridge/get-cached-context-window-by-provider-name.mjs";
import { toInputBudget } from "./to-input-budget.mjs";

export function buildDynamicOpenrouterLimits() {
  const limits = {};
  for (const name of ["openrouter-free", "openrouter"]) {
    const budget = toInputBudget(getCachedContextWindowByProviderName(name));
    if (budget) limits[name] = budget;
  }
  return limits;
}
