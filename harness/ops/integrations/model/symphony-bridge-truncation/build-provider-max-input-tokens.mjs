import { buildDynamicCatalogLimits } from "./build-dynamic-catalog-limits.mjs";
import { STATIC_CONTEXT_WINDOWS } from "./static-context-windows.mjs";
import { STATIC_INPUT_BUDGETS } from "./static-input-budgets.mjs";
import { toInputBudget } from "./to-input-budget.mjs";

export function buildProviderMaxInputTokens() {
  // External providers: convert raw context windows to safe input budgets (60%).
  /** @type {Record<string, number>} */
  const externalBudgets = {};
  for (const [name, contextLength] of Object.entries(STATIC_CONTEXT_WINDOWS)) {
    externalBudgets[name] = toInputBudget(contextLength) || contextLength;
  }

  // Dynamic catalog limits (from /v1/models) override static fallbacks.
  // These are already converted to input budgets by buildDynamicCatalogLimits.
  /** @type {Record<string, number>} */
  const dynamicLimits = buildDynamicCatalogLimits();
  return {
    ...externalBudgets,
    ...STATIC_INPUT_BUDGETS,
    ...dynamicLimits,
  };
}
