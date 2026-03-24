import { z } from "zod";

const streamingChunkSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion.chunk"),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      delta: z.object({ role: z.string().optional(), content: z.string().nullable().optional() }),
      finish_reason: z.string().nullable(),
    }),
  ),
});

export function validateStreamingContract(chunks: string[]) {
  const errors: string[] = [];
  let finalChunkFound = false;
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i] === "[DONE]") {
      finalChunkFound = true;
      continue;
    }
    try {
      const parsed = JSON.parse(chunks[i]);
      const result = streamingChunkSchema.safeParse(parsed);
      if (!result.success) errors.push(`Chunk ${i} validation failed: ${result.error.message}`);
    } catch {
      errors.push(`Chunk ${i} is not valid JSON`);
    }
  }
  return { valid: errors.length === 0, errors, finalChunkFound };
}
