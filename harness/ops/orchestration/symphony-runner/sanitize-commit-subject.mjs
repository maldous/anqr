// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:462

export function sanitizeCommitSubject(title) {
  let subject = title.trim();
  while (subject.endsWith(".")) subject = subject.slice(0, -1);
  if (subject.length > 0) subject = subject[0].toLowerCase() + subject.slice(1);
  return subject;
}
