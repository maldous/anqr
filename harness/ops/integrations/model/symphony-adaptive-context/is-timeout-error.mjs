export function isTimeoutError(errStr) {
  return (
    errStr.includes("timeout") ||
    errStr.includes("timed out") ||
    errStr.includes("etimedout") ||
    errStr.includes("econnaborted")
  );
}
