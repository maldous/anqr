import { extractErrorString } from "./extract-error-string.mjs";

export function parseContextErrorDetails(err) {
  const errStr = extractErrorString(err);

  const limitMatch = errStr.match(/limit\s+(\d+)/i);
  const requestedMatch = errStr.match(/requested\s+(\d+)/i);
  const contextLenMatch = errStr.match(/maximum context length is (\d+)/i);
  const youRequestedMatch = errStr.match(/you requested (\d+)/i);
  const maxSizeMatch = errStr.match(/max size[:\s]+(\d+)/i);
  const isTpmRelated = /tokens per minute|tpm/i.test(errStr);

  let reportedLimit = null;
  if (limitMatch) {
    reportedLimit = Number.parseInt(limitMatch[1], 10);
  } else if (contextLenMatch) {
    reportedLimit = Number.parseInt(contextLenMatch[1], 10);
  } else if (maxSizeMatch) {
    reportedLimit = Number.parseInt(maxSizeMatch[1], 10);
  }

  let requestedTokens = null;
  if (requestedMatch) {
    requestedTokens = Number.parseInt(requestedMatch[1], 10);
  } else if (youRequestedMatch) {
    requestedTokens = Number.parseInt(youRequestedMatch[1], 10);
  }

  return {
    reportedLimit,
    requestedTokens,
    isTpmRelated,
    tpmLimit: isTpmRelated && reportedLimit ? reportedLimit : null,
  };
}
