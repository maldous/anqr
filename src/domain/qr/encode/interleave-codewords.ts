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
    for (let r = 0; r < dcdata.length; r += 1) {
      if (i < dcdata[r].length) {
        data[index] = dcdata[r][i];
        index += 1;
      }
    }
  }

  for (let i = 0; i < maxEcCount; i += 1) {
    for (let r = 0; r < ecdata.length; r += 1) {
      if (i < ecdata[r].length) {
        data[index] = ecdata[r][i];
        index += 1;
      }
    }
  }

  return data;
}
