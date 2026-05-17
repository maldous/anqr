export function getContentText(content) {
  if (Array.isArray(content)) {
    return content.map((part) => (typeof part === "string" ? part : part?.text || "")).join("\n");
  }
  return typeof content === "string" ? content : "";
}
