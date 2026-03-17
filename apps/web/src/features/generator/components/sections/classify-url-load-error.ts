export function classifyUrlLoadError(err: unknown): string {
  if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
    return "Cannot load: CORS blocked or invalid URL";
  }
  return err instanceof Error ? err.message : "Failed to load image";
}
