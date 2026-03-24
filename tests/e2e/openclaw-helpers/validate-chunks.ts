export function validateStreamChunks(chunks: string[]): {
  valid: boolean;
  errors: string[];
  hasDone: boolean;
} {
  const errors: string[] = [];
  let hasDone = false;
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i] === "[DONE]") {
      hasDone = true;
      continue;
    }
    try {
      const parsed = JSON.parse(chunks[i]);
      if (typeof parsed.id !== "string") errors.push(`Chunk ${i}: missing or non-string 'id'`);
      if (parsed.object !== "chat.completion.chunk")
        errors.push(`Chunk ${i}: object='${parsed.object}', expected 'chat.completion.chunk'`);
      if (!Array.isArray(parsed.choices)) errors.push(`Chunk ${i}: missing 'choices' array`);
      if (typeof parsed.created !== "number")
        errors.push(`Chunk ${i}: missing or non-number 'created'`);
    } catch {
      errors.push(`Chunk ${i}: invalid JSON`);
    }
  }
  return { valid: errors.length === 0, errors, hasDone };
}
