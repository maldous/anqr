export function isProviderToolConfirmed(entry) {
  return entry?.toolProbe?.toolStatus === "capable";
}
