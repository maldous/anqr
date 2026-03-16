/**
 * Decoded bit stream result
 */
export class DecoderResult {
  private numBits: number;
  private errorsCorrected: number | null = null;
  private erasures: number | null = null;
  private other: unknown = null;
  private structuredAppendParity: number = -1;
  private structuredAppendSequenceNumber: number = -1;
  private symbologyModifier: number = 0;
  private version: number | null = null;
  private maskPattern: number | null = null;

  constructor(
    private readonly rawBytes: Uint8Array,
    private readonly text: string,
    private readonly byteSegments: Uint8Array[] | null,
    private readonly ecLevel: string | null,
    numBits?: number
  ) {
    this.numBits = numBits ?? (rawBytes == null ? 0 : 8 * rawBytes.length);
  }

  getRawBytes(): Uint8Array {
    return this.rawBytes;
  }

  getNumBits(): number {
    return this.numBits;
  }

  setNumBits(numBits: number): void {
    this.numBits = numBits;
  }

  getText(): string {
    return this.text;
  }

  getByteSegments(): Uint8Array[] | null {
    return this.byteSegments;
  }

  getECLevel(): string | null {
    return this.ecLevel;
  }

  getErrorsCorrected(): number | null {
    return this.errorsCorrected;
  }

  setErrorsCorrected(errorsCorrected: number): void {
    this.errorsCorrected = errorsCorrected;
  }

  getErasures(): number | null {
    return this.erasures;
  }

  setErasures(erasures: number): void {
    this.erasures = erasures;
  }

  getOther(): unknown {
    return this.other;
  }

  setOther(other: unknown): void {
    this.other = other;
  }

  hasStructuredAppend(): boolean {
    return this.structuredAppendParity >= 0 && this.structuredAppendSequenceNumber >= 0;
  }

  getStructuredAppendParity(): number {
    return this.structuredAppendParity;
  }

  getStructuredAppendSequenceNumber(): number {
    return this.structuredAppendSequenceNumber;
  }

  setStructuredAppendParity(parity: number): void {
    this.structuredAppendParity = parity;
  }

  setStructuredAppendSequenceNumber(sequenceNumber: number): void {
    this.structuredAppendSequenceNumber = sequenceNumber;
  }

  getSymbologyModifier(): number {
    return this.symbologyModifier;
  }

  setSymbologyModifier(modifier: number): void {
    this.symbologyModifier = modifier;
  }

  getVersion(): number | null {
    return this.version;
  }

  setVersion(version: number): void {
    this.version = version;
  }

  getMaskPattern(): number | null {
    return this.maskPattern;
  }

  setMaskPattern(maskPattern: number): void {
    this.maskPattern = maskPattern;
  }
}
