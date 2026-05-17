function pickFirstArray(obj, keyA, keyB) {
  if (Array.isArray(obj?.[keyA])) return obj[keyA];
  if (Array.isArray(obj?.[keyB])) return obj[keyB];
  return [];
}

function toolSupportStatus(capabilities, supportedParameters) {
  if (capabilities.function_calling === false) {
    return { status: "unsupported", reason: "capabilities.function_calling=false" };
  }
  if (capabilities.function_calling === true) {
    return { status: "supported", reason: "capabilities.function_calling=true" };
  }
  if (supportedParameters.length > 0) {
    const lower = new Set(supportedParameters.map((item) => String(item).toLowerCase()));
    if (lower.has("tools") || lower.has("tool_choice") || lower.has("tool-choice")) {
      return {
        status: "supported",
        reason: `supported_parameters=${supportedParameters.join(",")}`,
      };
    }
    return {
      status: "unsupported",
      reason: `supported_parameters=${supportedParameters.join(",")}`,
    };
  }
  return { status: "unknown", reason: "catalog has no explicit tool metadata" };
}

export function providerToolSupportHint(providerDef) {
  const capabilities = providerDef?.capabilities || {};
  const supportedParameters = pickFirstArray(providerDef, "supportedParameters", "supported_parameters");
  return toolSupportStatus(capabilities, supportedParameters);
}
