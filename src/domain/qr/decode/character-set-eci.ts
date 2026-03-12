/**
 * Character set ECI (Extended Channel Interpretation)
 */
export class CharacterSetECI {
  private static readonly VALUE_TO_ECI = new Map<number, CharacterSetECI>();
  private static readonly NAME_TO_ECI = new Map<string, CharacterSetECI>();

  static readonly Cp437 = new CharacterSetECI([0, 2], 'Cp437');
  static readonly ISO8859_1 = new CharacterSetECI([1, 3], 'ISO-8859-1', 'ISO8859_1');
  static readonly ISO8859_2 = new CharacterSetECI([4], 'ISO-8859-2', 'ISO8859_2');
  static readonly ISO8859_3 = new CharacterSetECI([5], 'ISO-8859-3', 'ISO8859_3');
  static readonly ISO8859_4 = new CharacterSetECI([6], 'ISO-8859-4', 'ISO8859_4');
  static readonly ISO8859_5 = new CharacterSetECI([7], 'ISO-8859-5', 'ISO8859_5');
  static readonly ISO8859_6 = new CharacterSetECI([8], 'ISO-8859-6', 'ISO8859_6');
  static readonly ISO8859_7 = new CharacterSetECI([9], 'ISO-8859-7', 'ISO8859_7');
  static readonly ISO8859_8 = new CharacterSetECI([10], 'ISO-8859-8', 'ISO8859_8');
  static readonly ISO8859_9 = new CharacterSetECI([11], 'ISO-8859-9', 'ISO8859_9');
  static readonly ISO8859_10 = new CharacterSetECI([12], 'ISO-8859-10', 'ISO8859_10');
  static readonly ISO8859_11 = new CharacterSetECI([13], 'ISO-8859-11', 'ISO8859_11');
  static readonly ISO8859_13 = new CharacterSetECI([15], 'ISO-8859-13', 'ISO8859_13');
  static readonly ISO8859_14 = new CharacterSetECI([16], 'ISO-8859-14', 'ISO8859_14');
  static readonly ISO8859_15 = new CharacterSetECI([17], 'ISO-8859-15', 'ISO8859_15');
  static readonly ISO8859_16 = new CharacterSetECI([18], 'ISO-8859-16', 'ISO8859_16');
  static readonly SJIS = new CharacterSetECI([20], 'SJIS', 'Shift_JIS');
  static readonly Cp1250 = new CharacterSetECI([21], 'Cp1250', 'windows-1250');
  static readonly Cp1251 = new CharacterSetECI([22], 'Cp1251', 'windows-1251');
  static readonly Cp1252 = new CharacterSetECI([23], 'Cp1252', 'windows-1252');
  static readonly Cp1256 = new CharacterSetECI([24], 'Cp1256', 'windows-1256');
  static readonly UnicodeBigUnmarked = new CharacterSetECI(
    [25],
    'UnicodeBigUnmarked',
    'UTF-16BE',
    'UnicodeBig'
  );
  static readonly UTF8 = new CharacterSetECI([26], 'UTF-8', 'UTF8');
  static readonly ASCII = new CharacterSetECI([27, 170], 'ASCII', 'US-ASCII');
  static readonly Big5 = new CharacterSetECI([28], 'Big5');
  static readonly GB18030 = new CharacterSetECI([29], 'GB18030', 'GB2312', 'EUC_CN', 'GBK');
  static readonly EUC_KR = new CharacterSetECI([30], 'EUC-KR', 'EUC_KR');

  private constructor(
    private readonly values: number[],
    private readonly name: string,
    ...otherNames: string[]
  ) {
    for (const value of values) {
      CharacterSetECI.VALUE_TO_ECI.set(value, this);
    }
    CharacterSetECI.NAME_TO_ECI.set(name, this);
    for (const otherName of otherNames) {
      CharacterSetECI.NAME_TO_ECI.set(otherName, this);
    }
  }

  getName(): string {
    return this.name;
  }

  getValue(): number {
    return this.values[0];
  }

  equals(other: CharacterSetECI): boolean {
    if (!other) return false;
    return this.name === other.name;
  }

  static getCharacterSetECIByValue(value: number): CharacterSetECI | null {
    if (value < 0 || value >= 900) return null;
    return CharacterSetECI.VALUE_TO_ECI.get(value) || null;
  }

  static getCharacterSetECIByName(name: string): CharacterSetECI | null {
    return CharacterSetECI.NAME_TO_ECI.get(name) || null;
  }
}
