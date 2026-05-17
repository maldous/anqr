export function resolveModalities(raw, field) {
  if (Array.isArray(raw?.architecture?.[`${field}_modalities`])) return raw.architecture[`${field}_modalities`];
  if (Array.isArray(raw?.[`${field}_modalities`])) return raw[`${field}_modalities`];
  return [];
}
