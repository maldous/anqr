export function isServerError(errStr) {
  return (
    errStr.includes("internal server error") ||
    errStr.includes("bad gateway") ||
    errStr.includes("service unavailable") ||
    errStr.includes("gateway timeout")
  );
}
