export function toolSupportStatus(capabilities, supportedParameters) {
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
