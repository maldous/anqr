export function analyzeUrlEfficiency(url: string): {
  byteModeBits: number;
  mixedModeBits: number;
  savings: number;
  savingsPercent: number;
} {
  const hashIndex = url.indexOf("#");
  const numericFragment = hashIndex >= 0 ? url.slice(hashIndex + 1) : "";
  const isAllNumeric = /^\d+$/.test(numericFragment);
  const byteModeBits = url.length * 8 + 4 + 16;

  let mixedModeBits = 0;
  if (hashIndex >= 0 && isAllNumeric && numericFragment.length >= 4) {
    const prefixLen = hashIndex + 1;
    mixedModeBits += 4 + 16 + prefixLen * 8;
    const numLen = numericFragment.length;
    const rem = numLen % 3;
    let remBits: number;
    if (rem === 2) remBits = 7;
    else if (rem === 1) remBits = 4;
    else remBits = 0;
    const numBits = Math.floor(numLen / 3) * 10 + remBits;
    mixedModeBits += 4 + 14 + numBits;
  } else {
    mixedModeBits = byteModeBits;
  }

  const savings = byteModeBits - mixedModeBits;
  const savingsPercent = (savings / byteModeBits) * 100;
  return { byteModeBits, mixedModeBits, savings, savingsPercent };
}
