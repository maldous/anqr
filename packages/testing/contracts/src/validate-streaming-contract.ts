import { streamingChunkSchema } from "./harness-bridge";

export function validateStreamingContract(chunks: unknown[]): {
  valid: boolean;
  errors: string[];
  finalChunkFound: boolean;
} {
  const errors: string[] = [];
  let finalChunkFound = false;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    // Check for [DONE] sentinel
    if (chunk === "[DONE]") {
      finalChunkFound = true;
      continue;
    }

    // Parse and validate chunk
    const parsed = typeof chunk === "string" ? JSON.parse(chunk) : chunk;
    const result = streamingChunkSchema.safeParse(parsed);

    if (!result.success) {
      errors.push(`Chunk ${i} validation failed: ${result.error.message}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    finalChunkFound,
  };
}
