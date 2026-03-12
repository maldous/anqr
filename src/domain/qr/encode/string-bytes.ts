/**
 * String to Bytes Conversion
 * Functions for converting strings to byte arrays for QR encoding
 */

import { createLogger } from '../../../infra/logging/logger';

const _log = createLogger('ENCODER');

// Default stringToBytes function - can be replaced for different encodings
let _stringToBytes = stringToBytes;

/**
 * Get current stringToBytes function
 */
export function stringToBytesFn(s: string): number[] {
  return _stringToBytes(s);
}

/**
 * Get the current stringToBytes implementation function.
 * Useful for temporarily overriding encoding and then restoring it safely.
 */
export function getStringToBytes(): (s: string) => number[] {
  return _stringToBytes;
}

/**
 * Set the stringToBytes function (for different encodings)
 */
export function setStringToBytes(fn: (s: string) => number[]): void {
  _stringToBytes = fn;
}

/**
 * Reset to default stringToBytes
 */
export function resetStringToBytes(): void {
  _stringToBytes = (s: string): number[] => {
    const bytes: number[] = [];
    for (let i = 0; i < s.length; i += 1) {
      const c = s.codePointAt(i)!;
      bytes.push(c & 0xff);
    }
    return bytes;
  };
}

/**
 * Base64 decode input stream for createStringToBytes
 */
function base64DecodeInputStream(str: string) {
  let _pos = 0;
  let _buffer = 0;
  let _buflen = 0;

  const decode = (c: number): number => {
    if (0x41 <= c && c <= 0x5a) {
      return c - 0x41;
    } else if (0x61 <= c && c <= 0x7a) {
      return c - 0x61 + 26;
    } else if (0x30 <= c && c <= 0x39) {
      return c - 0x30 + 52;
    } else if (c === 0x2b) {
      return 62;
    } else if (c === 0x2f) {
      return 63;
    } else {
      throw new Error(`c:${c}`);
    }
  };

  return {
    read: (): number => {
      while (_buflen < 8) {
        if (_pos >= str.length) {
          if (_buflen === 0) {
            return -1;
          }
          throw new Error(`unexpected end of file./${_buflen}`);
        }

        const c = str.charAt(_pos);
        _pos += 1;

        if (c === '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/)) {
          // ignore whitespace
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.codePointAt(0)!);
        _buflen += 6;
      }

      const n = (_buffer >>> (_buflen - 8)) & 0xff;
      _buflen -= 8;
      return n;
    },
  };
}

/**
 * Create a custom stringToBytes function from unicode data
 * Used for encodings like Shift-JIS
 *
 * @param unicodeData base64 string of byte array: [16bit Unicode],[16bit Bytes], ...
 * @param numChars expected number of characters
 */
export function createStringToBytes(
  unicodeData: string,
  numChars: number
): (s: string) => number[] {
  // Create conversion map
  const unicodeMap: Record<string, number> = {};

  const bin = base64DecodeInputStream(unicodeData);
  const read = (): number => {
    const b = bin.read();
    if (b === -1) throw new Error('eof');
    return b;
  };

  let count = 0;
  while (true) {
    const b0 = bin.read();
    if (b0 === -1) break;
    const b1 = read();
    const b2 = read();
    const b3 = read();
    const k = String.fromCodePoint((b0 << 8) | b1);
    const v = (b2 << 8) | b3;
    unicodeMap[k] = v;
    count += 1;
  }

  if (count !== numChars) {
    throw new Error(`${count} != ${numChars}`);
  }

  const unknownChar = '?'.codePointAt(0)!;

  return (s: string): number[] => {
    const bytes: number[] = [];
    for (let i = 0; i < s.length; i += 1) {
      const c = s.codePointAt(i)!;
      if (c < 128) {
        bytes.push(c);
      } else {
        const b = unicodeMap[s.charAt(i)];
        if (typeof b === 'number') {
          if ((b & 0xff) === b) {
            // 1 byte
            bytes.push(b);
          } else {
            // 2 bytes
            bytes.push(b >>> 8);
            bytes.push(b & 0xff);
          }
        } else {
          bytes.push(unknownChar);
        }
      }
    }
    return bytes;
  };
}

/**
 * Default string to bytes (Latin-1 / ISO-8859-1)
 */
export function stringToBytes(s: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i += 1) {
    const c = s.codePointAt(i)!;
    bytes.push(c & 0xff);
  }
  return bytes;
}
