export function getCompatibleMode(content: string, requestedMode: string): string {
  if (requestedMode === "auto") {
    if (/^\d+$/.test(content)) return "numeric";
    if (/^[0-9A-Z $%*+\-./:']+$/.test(content)) return "alphanumeric";
    return "byte";
  }

  switch (requestedMode) {
    case "numeric":
      if (/^\d+$/.test(content)) return "numeric";
      break;
    case "alphanumeric":
      if (/^[0-9A-Z $%*+\-./:']+$/.test(content)) return "alphanumeric";
      break;
    case "kanji":
      return "kanji";
    case "byte":
      return "byte";
  }

  return "byte";
}
