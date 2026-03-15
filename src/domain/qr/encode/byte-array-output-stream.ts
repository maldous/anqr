/**
 * Byte array output stream
 */
export function byteArrayOutputStream() {
  const _bytes: number[] = [];

  return {
    writeByte: (b: number): void => {
      _bytes.push(b & 0xff);
    },

    writeShort: (i: number): void => {
      _bytes.push(i & 0xff);
      _bytes.push((i >>> 8) & 0xff);
    },

    writeBytes: (b: number[], off: number = 0, len?: number): void => {
      const length = len ?? b.length;
      for (let i = 0; i < length; i += 1) {
        _bytes.push(b[i + off] & 0xff);
      }
    },

    writeString: (s: string): void => {
      for (let i = 0; i < s.length; i += 1) {
        _bytes.push(s.codePointAt(i)! & 0xff);
      }
    },

    toByteArray: (): number[] => _bytes,

    toString: (): string => {
      let s = '[';
      for (let i = 0; i < _bytes.length; i += 1) {
        if (i > 0) s += ',';
        s += _bytes[i];
      }
      s += ']';
      return s;
    },
  };
}
