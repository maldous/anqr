export function extractToolProbeAnswer(result) {
  const texts = [];
  const steps = Array.isArray(result?.steps) ? result.steps : [];
  for (const step of steps) {
    const toolResults = Array.isArray(step?.toolResults) ? step.toolResults : [];
    for (const toolResult of toolResults) {
      const output = toolResult?.output ?? toolResult?.result ?? toolResult?.content ?? toolResult;
      if (typeof output === 'string') texts.push(output.trim());
      else if (typeof output === 'number') texts.push(String(output));
      else if (output && typeof output === 'object') {
        const candidate = output.text ?? output.content ?? output.result ?? output.output;
        if (typeof candidate === 'string') texts.push(candidate.trim());
        else if (typeof candidate === 'number') texts.push(String(candidate));
      }
    }
  }

  for (const text of texts) {
    if (/^-?\d+(?:\.\d+)?$/.test(text)) return text;
  }

  const text = String(result?.text || '').trim();
  if (!text) return '';
  if (/^-?\d+(?:\.\d+)?$/.test(text)) return text;
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (/^-?\d+(?:\.\d+)?$/.test(lines[i])) return lines[i];
  }
  const matches = [...text.matchAll(/\b-?\d+(?:\.\d+)?\b/g)];
  return matches.length > 0 ? matches[matches.length - 1][0] : '';
}
