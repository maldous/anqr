import { trimString } from "./trim-string.mjs";

export function getResponseBodySummary(responseBody) {
  if (typeof responseBody === "string") {
    return trimString(responseBody, 300);
  }
  if (responseBody && typeof responseBody === "object") {
    return { keys: Object.keys(responseBody).slice(0, 8) };
  }
  return undefined;
}
