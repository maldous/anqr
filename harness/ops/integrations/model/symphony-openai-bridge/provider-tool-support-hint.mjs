import { pickFirstArray } from "./provider-tool-support-hint/pick-first-array.mjs";
import { toolSupportStatus } from "./provider-tool-support-hint/tool-support-status.mjs";

export function providerToolSupportHint(providerDef) {
  const capabilities = providerDef?.capabilities || {};
  const supportedParameters = pickFirstArray(providerDef, "supportedParameters", "supported_parameters");
  return toolSupportStatus(capabilities, supportedParameters);
}
