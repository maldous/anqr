/**
 * Get compatible encoding mode for content
 * Validates that the requested mode can encode the content, falls back to 'byte' if not
 */
export function getCompatibleMode(content: string, requestedMode: string): string {
  if (requestedMode === "auto") {
    // Auto-detect the best mode
    if (/^\d+$/.test(content)) return "numeric";
    if (/^[0-9A-Z $%*+\-./:']+$/.test(content)) return "alphanumeric";
    return "byte";
  }

  // Validate that requested mode can encode the content
  switch (requestedMode) {
    case "numeric":
      if (/^\d+$/.test(content)) return "numeric";
      break;
    case "alphanumeric":
      if (/^[0-9A-Z $%*+\-./:']+$/.test(content)) return "alphanumeric";
      break;
    case "kanji":
      // For kanji, fall through to byte if content has non-kanji chars
      return "kanji";
    case "byte":
      return "byte";
  }

  // Fall back to byte mode if requested mode can't encode content
  return "byte";
}
