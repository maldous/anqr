import { readSchema } from "./read-schema.mjs";

export function getToolPropertyNames(tool) {
  const schema = readSchema(tool);
  const properties = schema.properties || schema.input?.properties || {};
  return new Set(Object.keys(properties || {}));
}
