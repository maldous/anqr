export function pickFirstArray(obj, keyA, keyB) {
  if (Array.isArray(obj?.[keyA])) return obj[keyA];
  if (Array.isArray(obj?.[keyB])) return obj[keyB];
  return [];
}
