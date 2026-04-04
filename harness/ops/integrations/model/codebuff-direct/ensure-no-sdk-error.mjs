import { isRecoverableError } from "./is-recoverable-error.mjs";

export function ensureNoSdkError(resultOutput) {
  const str = typeof resultOutput === "string" ? resultOutput : JSON.stringify(resultOutput);
  if (str.includes("Symbol(vercel.ai.error)")) {
    const match = str.match(/"message":"([^"]+)"/);
    throw new Error(match ? match[1] : "Codebuff SDK error");
  }
  if (isRecoverableError(str)) {
    throw new Error(str);
  }
}
