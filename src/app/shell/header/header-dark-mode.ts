export function getInitialDarkMode(): boolean {
  const stored = localStorage.getItem("darkMode");
  if (stored !== null) return stored === "true";
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
}
