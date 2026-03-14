export function initErrorMatrix(moduleCount: number): number[][] {
  const errors: number[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    errors[row] = new Array(moduleCount).fill(0);
  }
  return errors;
}
