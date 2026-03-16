export function checkContrastCompliance(ratio: number): {
  level: "AAA" | "AA" | "AA-Large" | "Fail";
  passes: boolean;
} {
  if (ratio >= 7) return { level: "AAA", passes: true };
  if (ratio >= 4.5) return { level: "AA", passes: true };
  if (ratio >= 3) return { level: "AA-Large", passes: true };
  return { level: "Fail", passes: false };
}
