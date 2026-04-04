import { getToolPropertyNames } from "./get-tool-property-names.mjs";

export function supportsToolProperty(tool, propertyName) {
  return getToolPropertyNames(tool).has(propertyName);
}
