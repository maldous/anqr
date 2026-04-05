export function isOpenrouterTextToolModel(modelEntry) {
  const supported = Array.isArray(modelEntry?.supported_parameters)
    ? modelEntry.supported_parameters
    : [];
  const outputs = Array.isArray(modelEntry?.architecture?.output_modalities)
    ? modelEntry.architecture.output_modalities
    : [];
  const inputs = Array.isArray(modelEntry?.architecture?.input_modalities)
    ? modelEntry.architecture.input_modalities
    : [];
  const supportsTools = supported.includes("tools") || supported.includes("tool_choice");
  const outputsText = outputs.length === 0 || outputs.includes("text");
  const acceptsText = inputs.length === 0 || inputs.includes("text");
  return supportsTools && outputsText && acceptsText;
}
