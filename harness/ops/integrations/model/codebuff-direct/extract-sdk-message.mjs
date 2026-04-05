export function extractSdkMessage(resultOutput) {
  const text = typeof resultOutput === "string" ? resultOutput : JSON.stringify(resultOutput);
  const messageMatch = text.match(/"message":"([^"]+)/);
  if (messageMatch) return messageMatch[1];
  const retryMatch = text.match(/Failed after \d+ attempts\. Last error: [^\n"]+/);
  if (retryMatch) return retryMatch[0];
  return text;
}
