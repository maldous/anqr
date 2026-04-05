export function extractToolProbeAnswer(result) {
  const steps = Array.isArray(result?.steps) ? result.steps : [];
  for (const step of steps) {
    const results = Array.isArray(step?.toolResults) ? step.toolResults : [];
    for (const toolResult of results) {
      const candidates = [toolResult?.output, toolResult?.result, toolResult?.content];
      for (const candidate of candidates) {
        if (candidate === undefined || candidate === null) continue;
        const text = typeof candidate === "string" ? candidate.trim() : JSON.stringify(candidate);
        if (text) return text;
      }
    }
  }
  const text = String(result?.text || "").trim();
  if (!text) return "";
  const finalNumber = text.match(/(?:^|\n|\s)(-?\d+(?:\.\d+)?)\s*$/);
  if (finalNumber?.[1]) return finalNumber[1];
  const embeddedNumber = text.match(/\b(-?\d+(?:\.\d+)?)\b/g);
  if (embeddedNumber?.length === 1) return embeddedNumber[0];
  return text;
}
