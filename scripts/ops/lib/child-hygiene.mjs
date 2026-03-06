const CLOSED_STATE_TYPES = new Set(['completed', 'canceled']);

function isOpenState(state) {
  return !CLOSED_STATE_TYPES.has((state?.type || '').toLowerCase());
}

function isChildIssue(issue) {
  return (issue?.title || '').startsWith('[CHILD]');
}

export function computeChildHygiene(issues) {
  const openChildren = issues.filter((issue) => isOpenState(issue.state) && isChildIssue(issue));
  const orphanChildren = openChildren
    .filter((issue) => !issue.parent?.id)
    .map((issue) => ({
      identifier: issue.identifier,
      title: issue.title,
      url: issue.url || null,
      state: issue.state?.name || null,
    }));

  return {
    openChildCount: openChildren.length,
    orphanCount: orphanChildren.length,
    orphans: orphanChildren,
    ok: orphanChildren.length === 0,
  };
}

export function buildOrphanChildReport(hygiene) {
  if (hygiene.orphanCount === 0) {
    return ['[hygiene] orphan [CHILD] issues: 0'];
  }

  return [
    `[hygiene] orphan [CHILD] issues: ${hygiene.orphanCount}`,
    ...hygiene.orphans.map((issue) => ` - ${issue.identifier}: ${issue.title}`),
  ];
}
