export function sanitizeCodebuffProbeError(error) {
  const message = error?.message || String(error || 'Codebuff probe error');
  const compact = message.replace(/\s+/g, ' ').trim();
  return new Error(compact);
}
