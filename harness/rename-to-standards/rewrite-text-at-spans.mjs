// Generated from ../scripts/rename-to-standards.mjs:310

export const rewriteTextAtSpans = (text, edits) => {
  const ordered = [...edits].sort((a, b) => b.start - a.start);
  let next = text;
  for (const edit of ordered) {
    next = `${next.slice(0, edit.start)}${edit.value}${next.slice(edit.end)}`;
  }
  return next;
};
