import { log } from "./log";

export function handleUserProvidedSuffix(
  suffix: string,
  resolvedSuffixMode: "numeric" | "byte",
  prefix: string,
  data: string,
  originalDataLength: number,
): {
  resolvedSuffixMode: "numeric" | "byte";
  actualSuffix: string;
  encodedData: string;
  originalData: string;
  originalDataLength: number;
} {
  let actualSuffix = "";
  let encodedData = "";
  let currentMode = resolvedSuffixMode;
  let currentOriginalData = prefix;
  let currentOriginalDataLength = originalDataLength;

  if (currentMode === "numeric") {
    const normalized = suffix.startsWith("#") ? suffix.slice(1) : suffix;
    if (/^\d*$/.test(normalized)) {
      actualSuffix = normalized;
      encodedData = prefix + actualSuffix;
      log.info("Using user-provided numeric suffix", {
        originalDataLength,
        suffixLength: actualSuffix.length,
        suffixPreview: actualSuffix.slice(0, 20) + (actualSuffix.length > 20 ? "..." : ""),
      });
    } else {
      log.warn("Numeric suffix mode requires digits only; falling back to byte suffix mode", {
        providedSuffix: suffix,
      });
      currentMode = "byte";
      currentOriginalData = data;
      currentOriginalDataLength = data.length;
    }
  }

  if (currentMode === "byte") {
    actualSuffix = suffix;
    encodedData = data + suffix;
    log.info("Using user-provided suffix", {
      originalDataLength: currentOriginalDataLength,
      suffixLength: suffix.length,
      suffixPreview: suffix.slice(0, 20) + (suffix.length > 20 ? "..." : ""),
    });
  }

  return {
    resolvedSuffixMode: currentMode,
    actualSuffix,
    encodedData,
    originalData: currentOriginalData,
    originalDataLength: currentOriginalDataLength,
  };
}
