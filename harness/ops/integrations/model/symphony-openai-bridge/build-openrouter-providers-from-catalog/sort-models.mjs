export function sortModels(a, b) {
  const aTools = Array.isArray(a?.supportedParameters) ? a.supportedParameters.length : 0;
  const bTools = Array.isArray(b?.supportedParameters) ? b.supportedParameters.length : 0;
  const aContext = Number(a?.contextLength || 0);
  const bContext = Number(b?.contextLength || 0);
  return (
    bTools - aTools ||
    bContext - aContext ||
    String(a?.model || "").localeCompare(String(b?.model || ""))
  );
}
