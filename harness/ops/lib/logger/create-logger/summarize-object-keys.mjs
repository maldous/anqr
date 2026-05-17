export function summarizeObjectKeys(value, maxKeys = 20) {
  return Object.keys(value || {}).slice(0, maxKeys);
}
