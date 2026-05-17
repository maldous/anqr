import {
  shouldRetryProvider,
  recordProviderHealthFailure,
  recordProviderHealthSuccess,
} from "../../symphony-provider-health.mjs";

import { probeProviderDetailed } from "../probe-provider-detailed.mjs";

export async function probeSingleProvider(
  provider,
  excludeSet,
  respectHealthState,
  recordHealthFailures,
) {
  if (excludeSet.has(provider.name)) {
    return {
      name: provider.name,
      model: provider.model,
      status: "excluded",
      available: false,
      durationMs: 0,
    };
  }

  if (respectHealthState && !shouldRetryProvider(provider.name)) {
    return {
      name: provider.name,
      model: provider.model,
      status: "cooling_down",
      available: false,
      durationMs: 0,
    };
  }

  try {
    const result = await probeProviderDetailed(provider);
    if (result.available) recordProviderHealthSuccess(provider.name);
    else if (recordHealthFailures) recordProviderHealthFailure(provider.name, result.status);
    return {
      name: provider.name,
      model: provider.model,
      status: result.available ? "available" : result.status,
      available: result.available,
      durationMs: result.durationMs || 0,
    };
  } catch {
    if (recordHealthFailures) recordProviderHealthFailure(provider.name, "probe_error");
    return {
      name: provider.name,
      model: provider.model,
      status: "probe_error",
      available: false,
      durationMs: 0,
    };
  }
}
