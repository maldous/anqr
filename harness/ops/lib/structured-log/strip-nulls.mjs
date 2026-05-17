export function stripNulls(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) result[key] = value;
  }
  return result;
}
