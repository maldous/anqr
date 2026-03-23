/**
 * Contract test helpers for harness bridge HTTP interfaces
 *
 * Following the testing-strategy-anqr-1.0.md specification:
 * - Contract tests verify both sides of a boundary obey the same schema
 * - Use zod for schema validation
 * - Fixture corpora live in packages/testing/fixtures
 */

// Symphony Bridge OpenAI-compatible contract

import { z } from "zod";

// GET /v1/models response
export const symphonyModelsResponseSchema = z.object({
  object: z.literal("list"),
  data: z.array(
    z.object({
      id: z.string(),
      object: z.literal("model"),
      owned_by: z.string(),
      created: z.number(),
    }),
  ),
});

// POST /v1/chat/completions request
export const chatCompletionRequestSchema = z.object({
  model: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant", "tool"]),
      content: z.union([z.string(), z.array(z.unknown())]),
      name: z.string().optional(),
    }),
  ),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  max_tokens: z.number().optional(),
  stream: z.boolean().optional(),
  tools: z
    .array(
      z.object({
        type: z.literal("function"),
        function: z.object({
          name: z.string(),
          description: z.string(),
          parameters: z.record(z.unknown()),
        }),
      }),
    )
    .optional(),
});

// Non-streaming response
export const chatCompletionResponseSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.literal("assistant"),
        content: z.string().nullable(),
      }),
      finish_reason: z.string(),
    }),
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
  // Symphony-specific extensions
  _symphony_provider: z.string().optional(),
  _symphony_attempts: z.number().optional(),
  _symphony_tried: z.array(z.string()).optional(),
  _symphony_duration_ms: z.number().optional(),
});

// Streaming chunk
export const streamingChunkSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion.chunk"),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      delta: z.object({
        role: z.string().optional(),
        content: z.string().nullable().optional(),
      }),
      finish_reason: z.string().nullable(),
    }),
  ),
});

// Health check response
export const healthResponseSchema = z.object({
  status: z.string(),
  model: z.string(),
  providersConfigured: z.number().optional(),
  rankedProviders: z
    .array(
      z.object({
        name: z.string(),
        score: z.number().nullable(),
      }),
    )
    .optional(),
  tools: z.array(z.string()).optional(),
});

// Metrics response
export const metricsResponseSchema = z.object({
  bridge: z.object({
    totalRequests: z.number(),
    streamingRequests: z.number(),
    nonStreamingRequests: z.number(),
    totalFallbacks: z.number(),
    totalErrors: z.number(),
    avgResponseTimeMs: z.number(),
    minResponseTimeMs: z.number().nullable(),
    maxResponseTimeMs: z.number().nullable(),
    totalTokensIn: z.number(),
    totalTokensOut: z.number(),
    totalToolCalls: z.number(),
    requestsByProvider: z.record(z.number()),
    errorsByType: z.record(z.number()),
    uptimeSeconds: z.number().optional(),
  }),
  creditGate: z.record(z.unknown()),
});

// Stats response
export const statsResponseSchema = z.object({
  rankedProviders: z.array(
    z.object({
      name: z.string(),
      score: z.number().nullable(),
      rank: z.number().optional(),
    }),
  ),
  providerStats: z.record(z.unknown()),
});

// Codebuff Bridge contract

export const codebuffModelsResponseSchema = symphonyModelsResponseSchema;

export const codebuffHealthResponseSchema = z.object({
  status: z.string(),
  model: z.string(),
  apiKeysConfigured: z.number(),
  paidAccounts: z.number(),
  freeAccounts: z.number(),
});

// Tool definitions that should be available
export const availableTools = ["exec", "read", "glob"] as const;
export type ToolName = (typeof availableTools)[number];

// Helper to validate a complete chat completion round-trip
export function validateContract(
  request: unknown,
  response: unknown,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate request
  const requestResult = chatCompletionRequestSchema.safeParse(request);
  if (!requestResult.success) {
    errors.push(`Request validation failed: ${requestResult.error.message}`);
  }

  // Validate response
  const responseResult = chatCompletionResponseSchema.safeParse(response);
  if (!responseResult.success) {
    errors.push(`Response validation failed: ${responseResult.error.message}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate streaming response format
export function validateStreamingContract(
  chunks: unknown[],
): { valid: boolean; errors: string[]; finalChunkFound: boolean } {
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