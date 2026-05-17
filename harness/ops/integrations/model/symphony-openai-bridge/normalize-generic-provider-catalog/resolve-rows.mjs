export function resolveRows(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.models)) return payload.models;
  return Array.isArray(payload) ? payload : [];
}
