export function initErrorMatrix(moduleCount: number): number[][] {
  const errors: number[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    errors[row] = Array.from({ length: moduleCount }, () => 0);
  }
  return errors;
}
