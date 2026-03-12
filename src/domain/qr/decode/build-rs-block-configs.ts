/**
 * Build flat list of block configurations from RS block groups.
 */
export function buildRSBlockConfigs(rsBlocks: number[][]): Array<{ dataCount: number; eccCount: number }> {
  const configs: Array<{ dataCount: number; eccCount: number }> = [];
  for (const blockGroup of rsBlocks) {
    const numBlocks = blockGroup[0];
    const totalCount = blockGroup[1];
    const dataCount = blockGroup[2];
    const eccCount = totalCount - dataCount;
    for (let i = 0; i < numBlocks; i++) {
      configs.push({ dataCount, eccCount });
    }
  }
  return configs;
}
