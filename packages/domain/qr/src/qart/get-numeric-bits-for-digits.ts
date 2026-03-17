export function getNumericBitsForDigits(digits: number): number {
  const fullGroups = Math.floor(digits / 3);
  const rem = digits % 3;
  let remBits: number;
  if (rem === 1) remBits = 4;
  else if (rem === 2) remBits = 7;
  else remBits = 0;
  return fullGroups * 10 + remBits;
}
