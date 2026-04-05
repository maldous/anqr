export function isProviderLeaseExempt(provider) {
  const name = typeof provider === "string" ? provider : provider?.name;
  return name === "codex" || name === "codebuff";
}
