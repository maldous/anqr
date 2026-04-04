export function errorToString(err) {
  if (err instanceof Error) return String(err);
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    if (err.message) return `${err.type || err.name || "Error"}: ${err.message}`;
    try {
      return JSON.stringify(err).slice(0, 300);
    } catch {
      return "[unserializable error]";
    }
  }
  return String(err);
}
