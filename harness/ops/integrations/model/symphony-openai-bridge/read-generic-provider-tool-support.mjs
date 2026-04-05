export function readGenericProviderToolSupport(entry) {
  if (typeof entry?.supports_tools === "boolean") {
    return {
      status: entry.supports_tools ? "supported" : "unsupported",
      reason: `supports_tools=${entry.supports_tools}`,
    };
  }
  if (typeof entry?.supportsTools === "boolean") {
    return {
      status: entry.supportsTools ? "supported" : "unsupported",
      reason: `supportsTools=${entry.supportsTools}`,
    };
  }
  if (typeof entry?.capabilities?.function_calling === "boolean") {
    return {
      status: entry.capabilities.function_calling ? "supported" : "unsupported",
      reason: `capabilities.function_calling=${entry.capabilities.function_calling}`,
    };
  }
  if (typeof entry?.capabilities?.tools === "boolean") {
    return {
      status: entry.capabilities.tools ? "supported" : "unsupported",
      reason: `capabilities.tools=${entry.capabilities.tools}`,
    };
  }
  if (typeof entry?.tool_calling === "boolean") {
    return {
      status: entry.tool_calling ? "supported" : "unsupported",
      reason: `tool_calling=${entry.tool_calling}`,
    };
  }
  if (Array.isArray(entry?.supported_parameters)) {
    const supportsTools =
      entry.supported_parameters.includes("tools") ||
      entry.supported_parameters.includes("tool_choice");
    return {
      status: supportsTools ? "supported" : "unsupported",
      reason: `supported_parameters=${entry.supported_parameters.join(",")}`,
    };
  }
  if (Array.isArray(entry?.supported_features)) {
    const supportsTools =
      entry.supported_features.includes("tools") ||
      entry.supported_features.includes("tool_choice") ||
      entry.supported_features.includes("function_calling");
    return {
      status: supportsTools ? "supported" : "unsupported",
      reason: `supported_features=${entry.supported_features.join(",")}`,
    };
  }
  return { status: "unknown", reason: "catalog has no explicit tool metadata" };
}
