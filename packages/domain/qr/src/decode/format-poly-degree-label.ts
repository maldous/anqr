export function formatPolyDegreeLabel(degree: number): string {
  if (degree === 0) return "";
  if (degree === 1) return "x";
  return `x^${degree}`;
}
