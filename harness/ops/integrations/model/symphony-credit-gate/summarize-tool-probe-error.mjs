export function summarizeToolProbeError(error) {
  const raw = error?.message || String(error || 'unknown tool probe error');
  return raw.replace(/\s+/g, ' ').trim().slice(0, 200);
}
