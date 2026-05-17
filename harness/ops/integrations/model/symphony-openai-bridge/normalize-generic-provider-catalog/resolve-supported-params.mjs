export function resolveSupportedParams(entry) {
  if (Array.isArray(entry?.supported_parameters)) return entry.supported_parameters;
  if (Array.isArray(entry?.supportedParameters)) return entry.supportedParameters;
  return [];
}
