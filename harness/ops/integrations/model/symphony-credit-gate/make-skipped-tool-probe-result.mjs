export function makeSkippedToolProbeResult(provider, result) {
  return {
    name: provider.name,
    status: 'skipped',
    toolStatus: 'skipped',
    reason: 'skipped-after-access-failure',
    detail: result?.reason || 'tool probe skipped after provider access failure',
  };
}
