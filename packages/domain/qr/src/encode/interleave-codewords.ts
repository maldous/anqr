export function interleaveCodewords(
  dcdata: number[][],
  ecdata: number[][],
  maxDcCount: number,
  maxEcCount: number,
  totalCodeCount: number,
): number[] {
  const data = Array.from<number>({ length: totalCodeCount });
  let index = 0;

  for (let i = 0; i < maxDcCount; i += 1) {
    for (const dc of dcdata) {
      if (i < dc.length) {
        data[index] = dc[i];
        index += 1;
      }
    }
  }

  for (let i = 0; i < maxEcCount; i += 1) {
    for (const ec of ecdata) {
      if (i < ec.length) {
        data[index] = ec[i];
        index += 1;
      }
    }
  }

  return data;
}
