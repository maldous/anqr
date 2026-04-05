import { extractSdkMessage } from "./extract-sdk-message.mjs";
import { isRecoverableError } from "./is-recoverable-error.mjs";

export function ensureNoSdkError(resultOutput) {
  const message = extractSdkMessage(resultOutput);
  if (message.includes("Symbol(vercel.ai.error)")) {
    throw new Error("Codebuff SDK error");
  }
  if (isRecoverableError(message) || message.includes("AI_RetryError") || message.includes("Too Many Requests")) {
    throw new Error(message);
  }
}
