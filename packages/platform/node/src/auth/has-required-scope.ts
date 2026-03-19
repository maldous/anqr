export function hasRequiredScope(scopeClaim: unknown, requiredScope: string | undefined): boolean {
  if (!requiredScope) return true;
  if (typeof scopeClaim !== "string") return false;
  return scopeClaim.split(/\s+/).includes(requiredScope);
}
