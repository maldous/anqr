export function extractTextContent(bodyParts) {
  // notmuch JSON body uses numeric string keys: body['0'], body['1'], etc.
  const parts = Array.isArray(bodyParts) ? bodyParts : Object.values(bodyParts || {});
  for (const part of parts) {
    if (part["content-type"] === "text/plain" && typeof part.content === "string")
      return part.content;
    if (part.content && typeof part.content === "object") {
      const text = extractTextContent(part.content);
      if (text) return text;
    }
  }
  for (const part of parts) {
    if (part["content-type"] === "text/html" && typeof part.content === "string") {
      return part.content
        .replaceAll(/<[^>]*>/g, " ")
        .replaceAll(/\s+/g, " ")
        .trim();
    }
  }
  return "";
}
