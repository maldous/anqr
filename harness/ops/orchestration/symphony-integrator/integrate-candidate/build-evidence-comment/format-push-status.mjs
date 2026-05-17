export function formatPushStatus(push) {
  if (push?.success === true) return "passed";
  if (push?.success === false) return "failed";
  return "unknown";
}
