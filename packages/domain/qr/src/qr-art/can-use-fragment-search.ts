export function canUseFragmentSearch(content: string): boolean {
  try {
    if (content.startsWith("http://") || content.startsWith("https://")) {
      new URL(content);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
