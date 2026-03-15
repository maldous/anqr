/**
 * Error correction block
 */
export class ECB {
  constructor(
    private readonly count: number,
    private readonly dataCodewords: number
  ) {}

  getCount(): number {
    return this.count;
  }

  getDataCodewords(): number {
    return this.dataCodewords;
  }
}
