import { tools } from "./tools.mjs";

export function filterToolsByTier(nameSet) {
  const filtered = {};
  for (const name of nameSet) {
    if (tools[name]) {
      filtered[name] = tools[name];
    }
  }
  return filtered;
}
