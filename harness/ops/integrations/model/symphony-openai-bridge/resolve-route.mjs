import { ADVERTISED_MODELS } from "./advertised-models.mjs";
import { BRIDGE_PROVIDER_BLOCKLIST } from "./bridge-provider-blocklist.mjs";
import { MODEL_ID } from "./model-id.mjs";
import { normalizeModelId } from "./normalize-model-id.mjs";

export function resolveRoute(modelId) {
  const normalizedModelId = normalizeModelId(modelId);
  const advertised =
    ADVERTISED_MODELS.find((entry) => entry.id === normalizedModelId) ||
    ADVERTISED_MODELS.find((entry) => entry.id === MODEL_ID);

  const allowedNames = (advertised?.allowedNames || null)?.filter(
    (name) => !BRIDGE_PROVIDER_BLOCKLIST.has(name),
  );

  return {
    requestedModelId: modelId || MODEL_ID,
    normalizedModelId,
    responseModelId: advertised?.id || MODEL_ID,
    allowedNames,
  };
}
