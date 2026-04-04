export function getStatusCode(err) {
  if (err?.statusCode) return err.statusCode;
  let current = err;
  const seen = new Set();
  while (current?.cause && !seen.has(current.cause)) {
    seen.add(current.cause);
    current = current.cause;
    if (current?.statusCode) return current.statusCode;
  }
  return null;
}
