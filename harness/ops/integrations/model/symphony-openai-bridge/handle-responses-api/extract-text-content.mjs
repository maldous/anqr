export function extractTextContent(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content))
    return typeof content === "object" ? JSON.stringify(content) : String(content || "");

  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part.type === "input_text" || part.type === "text") return part.text || "";
      if (part.type === "output_text") return part.text || "";
      if (part.type === "refusal") return part.refusal || "";
      return "";
    })
    .join("");
}
