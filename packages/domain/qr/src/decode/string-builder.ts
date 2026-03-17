import { CharacterSetECI } from "./character-set-eci";
import { StringUtils } from "./string-utils";

/**
 * StringBuilder for string building operations
 */
export class StringBuilder {
  private value: string;
  private encoding: CharacterSetECI | null = null;

  constructor(value: string = "") {
    this.value = value;
  }

  enableDecoding(encoding: CharacterSetECI): this {
    this.encoding = encoding;
    return this;
  }

  append(s: string | number): this {
    if (typeof s === "string") {
      this.value += s;
    } else if (this.encoding) {
      this.value += StringUtils.castAsNonUtf8Char(s, this.encoding);
    } else {
      this.value += String.fromCodePoint(s);
    }
    return this;
  }

  appendChars(str: string[], offset: number, len: number): this {
    for (let i = offset; i < offset + len; i++) {
      this.append(str[i]);
    }
    return this;
  }

  length(): number {
    return this.value.length;
  }

  charAt(n: number): string {
    return this.value.charAt(n);
  }

  deleteCharAt(n: number): void {
    this.value = this.value.substring(0, n) + this.value.substring(n + 1);
  }

  setCharAt(n: number, c: string): void {
    this.value = this.value.substring(0, n) + c + this.value.substring(n + 1);
  }

  substring(start: number, end: number): string {
    return this.value.substring(start, end);
  }

  setLengthToZero(): void {
    this.value = "";
  }

  toString(): string {
    return this.value;
  }

  insert(n: number, c: string): void {
    this.value = this.value.substring(0, n) + c + this.value.substring(n);
  }
}
