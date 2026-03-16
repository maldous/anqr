import { byteArrayOutputStream } from "./byte-array-output-stream";

/**
 * GIF image generator (black & white)
 */
export function gifImage(width: number, height: number) {
  const _data = Array.from<number>({ length: width * height });

  const lzwTable = () => {
    const _map: Record<string, number> = {};
    let _size = 0;

    return {
      add: (key: string): void => {
        if (_map[key] !== undefined) {
          throw new TypeError(`dup key:${key}`);
        }
        _map[key] = _size;
        _size += 1;
      },
      size: () => _size,
      indexOf: (key: string) => _map[key],
      contains: (key: string) => _map[key] !== undefined,
    };
  };

  const bitOutputStream = (out: ReturnType<typeof byteArrayOutputStream>) => {
    let _bitLength = 0;
    let _bitBuffer = 0;

    return {
      write: (data: number, length: number): void => {
        if (data >>> length !== 0) {
          throw new Error("length over");
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
      out.writeString("GIF87a");

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
      out.writeString(",");
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
      out.writeString(";");
    },
  };
}
