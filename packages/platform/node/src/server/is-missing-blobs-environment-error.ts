export function isMissingBlobsEnvironmentError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeErr = error as { name?: string; message?: string };
  return (
    maybeErr.name === "MissingBlobsEnvironmentError" ||
    String(maybeErr.message || "").includes(
      "The environment has not been configured to use Netlify Blobs",
    )
  );
}
