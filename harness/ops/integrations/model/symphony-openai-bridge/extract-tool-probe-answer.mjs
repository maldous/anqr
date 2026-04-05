export function extractToolProbeAnswer(result) {
  if (result?.text) return result.text;
  const steps = Array.isArray(result?.steps) ? result.steps : [];
  for (const step of steps) {
    const results = Array.isArray(step?.toolResults) ? step.toolResults : [];
    for (const toolResult of results) {
      if (typeof toolResult?.output === "string" && toolResult.output.trim())
        return toolResult.output.trim();
      if (typeof toolResult?.result === "string" && toolResult.result.trim())
        return toolResult.result.trim();
      if (typeof toolResult?.content === "string" && toolResult.content.trim())
        return toolResult.content.trim();
    }
  }
  return "";
}
