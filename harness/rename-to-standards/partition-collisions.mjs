export const partitionCollisions = (plan) => {
  const seen = new Map();
  for (const item of plan) {
    const bucket = seen.get(item.newRelativePath) ?? [];
    bucket.push(item);
    seen.set(item.newRelativePath, bucket);
  }
  const accepted = [];
  const skipped = [];
  for (const items of seen.values()) {
    if (items.length === 1) {
      accepted.push(items[0]);
      continue;
    }
    skipped.push(...items.map((item) => ({ ...item, reason: `${item.reason};collision` })));
  }
  accepted.sort((a, b) => a.oldRelativePath.localeCompare(b.oldRelativePath));
  skipped.sort((a, b) => a.oldRelativePath.localeCompare(b.oldRelativePath));
  return { accepted, skipped };
};
