export function isProbablyBinaryContent(content) {
  return content.includes("\0");
}
