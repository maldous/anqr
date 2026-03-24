import { chatCompletionRequestSchema, chatCompletionResponseSchema } from "./harness-bridge";

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
