/**
 * QR Output Helpers
 * GIF generation, base64 encoding, and data URL creation
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ENCODER');

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

/**
 * Base64 encode output stream
 */
export function base64EncodeOutputStream() {
  let _buffer = 0;
  let _buflen = 0;
  let _length = 0;
  let _base64 = '';

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
          _base64 += '=';
        }
      }
    },

    toString: (): string => _base64,
  };
}

/**
 * GIF image generator (black & white)
 */
export function gifImage(width: number, height: number) {
  const _data = new Array<number>(width * height);

  const lzwTable = () => {
    const _map: Record<string, number> = {};
    let _size = 0;

    return {
      add: (key: string): void => {
        if (typeof _map[key] !== 'undefined') {
          throw new Error(`dup key:${key}`);
        }
        _map[key] = _size;
        _size += 1;
      },
      size: () => _size,
      indexOf: (key: string) => _map[key],
      contains: (key: string) => typeof _map[key] !== 'undefined',
    };
  };

  const bitOutputStream = (out: ReturnType<typeof byteArrayOutputStream>) => {
    let _bitLength = 0;
    let _bitBuffer = 0;

    return {
      write: (data: number, length: number): void => {
        if (data >>> length !== 0) {
          throw new Error('length over');
        }

        while (_bitLength + length >= 8) {
          out.writeByte(0xff & ((data << _bitLength) | _bitBuffer));
          length -= 8 - _bitLength;
          data >>>= 8 - _bitLength;
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      },

      flush: (): void => {
        if (_bitLength > 0) {
          out.writeByte(_bitBuffer);
        }
      },
    };
  };

  const getLZWRaster = (lzwMinCodeSize: number): number[] => {
    const clearCode = 1 << lzwMinCodeSize;
    const endCode = (1 << lzwMinCodeSize) + 1;
    let bitLength = lzwMinCodeSize + 1;

    // Setup LZWTable
    const table = lzwTable();

    for (let i = 0; i < clearCode; i += 1) {
      table.add(String.fromCodePoint(i));
    }
    table.add(String.fromCodePoint(clearCode));
    table.add(String.fromCodePoint(endCode));

    const byteOut = byteArrayOutputStream();
    const bitOut = bitOutputStream(byteOut);

    // clear code
    bitOut.write(clearCode, bitLength);

    let dataIndex = 0;

    let s = String.fromCodePoint(_data[dataIndex]);
    dataIndex += 1;

    while (dataIndex < _data.length) {
      const c = String.fromCodePoint(_data[dataIndex]);
      dataIndex += 1;

      if (table.contains(s + c)) {
        s = s + c;
      } else {
        bitOut.write(table.indexOf(s), bitLength);

        if (table.size() < 0xfff) {
          if (table.size() === 1 << bitLength) {
            bitLength += 1;
          }

          table.add(s + c);
        }

        s = c;
      }
    }

    bitOut.write(table.indexOf(s), bitLength);

    // end code
    bitOut.write(endCode, bitLength);

    bitOut.flush();

    return byteOut.toByteArray();
  };

  return {
    setPixel: (x: number, y: number, pixel: number): void => {
      _data[y * width + x] = pixel;
    },

    write: (out: ReturnType<typeof byteArrayOutputStream>): void => {
      // GIF Signature
      out.writeString('GIF87a');

      // Screen Descriptor
      out.writeShort(width);
      out.writeShort(height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      // Global Color Map
      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      // Image Descriptor
      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(width);
      out.writeShort(height);
      out.writeByte(0);

      // Raster Data
      const lzwMinCodeSize = 2;
      const raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      let offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      // GIF Terminator
      out.writeString(';');
    },
  };
}

/**
 * Create a data URL from pixel data
 */
export function createDataURL(
  width: number,
  height: number,
  getPixel: (x: number, y: number) => number
): string {
  const gif = gifImage(width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      gif.setPixel(x, y, getPixel(x, y));
    }
  }

  const b = byteArrayOutputStream();
  gif.write(b);

  const base64 = base64EncodeOutputStream();
  const bytes = b.toByteArray();
  for (let i = 0; i < bytes.length; i += 1) {
    base64.writeByte(bytes[i]);
  }
  base64.flush();

  return `data:image/gif;base64,${base64.toString()}`;
}
