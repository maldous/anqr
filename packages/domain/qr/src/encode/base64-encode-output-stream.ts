/**
 * Base64 encode output stream
 */
export function base64EncodeOutputStream() {
  let _buffer = 0;
  let _buflen = 0;
  let _length = 0;
  let _base64 = "";

  const encode = (n: number): number => {
    if (n < 0) {
      throw new Error(`n:${n}`);
    } else if (n < 26) {
      return 0x41 + n;
    } else if (n < 52) {
      return 0x61 + (n - 26);
    } else if (n < 62) {
      return 0x30 + (n - 52);
    } else if (n === 62) {
      return 0x2b;
    } else if (n === 63) {
      return 0x2f;
    } else {
      throw new Error(`n:${n}`);
    }
  };

  const writeEncoded = (b: number): void => {
    _base64 += String.fromCodePoint(encode(b & 0x3f));
  };

  return {
    writeByte: (n: number): void => {
      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6));
        _buflen -= 6;
      }
    },

    flush: (): void => {
      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen));
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 !== 0) {
        // padding
        const padlen = 3 - (_length % 3);
        for (let i = 0; i < padlen; i += 1) {
          _base64 += "=";
        }
      }
    },

    toString: (): string => _base64,
  };
}
