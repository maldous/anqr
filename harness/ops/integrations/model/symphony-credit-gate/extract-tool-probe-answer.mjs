export function extractToolProbeAnswer(result) {
  const text = String(result?.text || "").trim();
  if (text) return text;
  for (const step of result?.steps || []) {
    for (const toolResult of step?.toolResults || []) {
      const value = toolResult?.result;
      if (value === undefined || value === null) continue;
      const str = typeof value === "string" ? value.trim() : JSON.stringify(value);
      if (str) return str;
    }
  }
  return "";
}
