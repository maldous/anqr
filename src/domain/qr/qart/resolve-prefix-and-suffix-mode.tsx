import { log } from "./log";

export function resolvePrefixAndSuffixMode(
  data: string,
  suffixMode: "auto" | "numeric" | "byte",
): { resolvedSuffixMode: "numeric" | "byte"; prefix: string } {
  const isUrlLike = /^https?:\/\//i.test(data);
  const resolvedSuffixMode: "numeric" | "byte" =
    suffixMode === "auto" ? (isUrlLike ? "numeric" : "byte") : suffixMode;

  const hashIndex = data.indexOf("#");
  const baseUrl = hashIndex >= 0 ? data.slice(0, hashIndex) : data;
  if (resolvedSuffixMode === "numeric" && hashIndex >= 0) {
    log.warn("Numeric suffix mode: dropping existing fragment and regenerating numeric suffix", {
      originalData: data.length > 60 ? `${data.slice(0, 60)}...` : data,
    });
  }

  const prefix = resolvedSuffixMode === "numeric" ? `${baseUrl}#` : data;
  return { resolvedSuffixMode, prefix };
}
