/**
 * QR Code Encoder
 * Main factory function for creating QR codes
 */

import { createLogger } from '../../lib/logger';
import { qrBitBuffer } from './bit-buffer';
import { qr8BitByte, qrAlphaNum, qrKanji, qrNumber } from './data-modes';

const _log = createLogger('ENCODER');

import { qrPolynomial } from './math';
import { createDataURL } from './output';
import { getRSBlocks } from './rs-blocks';
import type {
  QRBitBuffer as QRBitBufferType,
  QRCodeInstance,
  QRDataSegment,
  QRErrorCorrectionLevelChar,
} from './types';
import { QRErrorCorrectionLevel } from './types';
import {
  getBCHTypeInfo,
  getBCHTypeNumber,
  getErrorCorrectPolynomial,
  getLengthInBits,
  getLostPoint,
  getMaskFunction,
  getPatternPosition,
} from './utils';

const PAD0 = 0xec;
const PAD1 = 0x11;

/**
 * Create a QR code instance
 * @param typeNumber QR version (1-40), 0 for auto
 * @param errorCorrectionLevel Error correction level ('L', 'M', 'Q', 'H')
 */
export function qrcode(
  typeNumber: number,
  errorCorrectionLevel: QRErrorCorrectionLevelChar
): QRCodeInstance {
  let _typeNumber = typeNumber;
  const _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
  let _modules: (boolean | null)[][] | null = null;
  let _moduleCount = 0;
  let _dataCache: number[] | null = null;
  const _dataList: QRDataSegment[] = [];

  const makeImpl = (test: boolean, maskPattern: number): void => {
    _moduleCount = _typeNumber * 4 + 17;
    _modules = ((): (boolean | null)[][] => {
      const modules: (boolean | null)[][] = new Array(_moduleCount);
      for (let row = 0; row < _moduleCount; row += 1) {
        modules[row] = new Array(_moduleCount);
        for (let col = 0; col < _moduleCount; col += 1) {
          modules[row][col] = null;
        }
      }
      return modules;
    })();

    setupPositionProbePattern(0, 0);
    setupPositionProbePattern(_moduleCount - 7, 0);
    setupPositionProbePattern(0, _moduleCount - 7);
    setupPositionAdjustPattern();
    setupTimingPattern();
    setupTypeInfo(test, maskPattern);

    if (_typeNumber >= 7) {
      setupTypeNumber(test);
    }

    if (_dataCache == null) {
      _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
    }

    mapData(_dataCache, maskPattern);
  };

  const setupPositionProbePattern = (row: number, col: number): void => {
    for (let r = -1; r <= 7; r += 1) {
      if (row + r <= -1 || _moduleCount <= row + r) continue;

      for (let c = -1; c <= 7; c += 1) {
        if (col + c <= -1 || _moduleCount <= col + c) continue;

        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          _modules![row + r][col + c] = true;
        } else {
          _modules![row + r][col + c] = false;
        }
      }
    }
  };

  const getBestMaskPattern = (): number => {
    let minLostPoint = 0;
    let pattern = 0;

    for (let i = 0; i < 8; i += 1) {
      makeImpl(true, i);

      const lostPoint = getLostPoint(_this);

      if (i === 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = i;
      }
    }

    return pattern;
  };

  const setupTimingPattern = (): void => {
    for (let r = 8; r < _moduleCount - 8; r += 1) {
      if (_modules![r][6] != null) continue;
      _modules![r][6] = r % 2 === 0;
    }

    for (let c = 8; c < _moduleCount - 8; c += 1) {
      if (_modules![6][c] != null) continue;
      _modules![6][c] = c % 2 === 0;
    }
  };

  const setupPositionAdjustPattern = (): void => {
    const pos = getPatternPosition(_typeNumber);

    for (let i = 0; i < pos.length; i += 1) {
      for (let j = 0; j < pos.length; j += 1) {
        const row = pos[i];
        const col = pos[j];

        if (_modules![row][col] != null) continue;

        for (let r = -2; r <= 2; r += 1) {
          for (let c = -2; c <= 2; c += 1) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
              _modules![row + r][col + c] = true;
            } else {
              _modules![row + r][col + c] = false;
            }
          }
        }
      }
    }
  };

  const setupTypeNumber = (test: boolean): void => {
    const bits = getBCHTypeNumber(_typeNumber);

    for (let i = 0; i < 18; i += 1) {
      const mod = !test && ((bits >> i) & 1) === 1;
      _modules![Math.floor(i / 3)][(i % 3) + _moduleCount - 8 - 3] = mod;
    }

    for (let i = 0; i < 18; i += 1) {
      const mod = !test && ((bits >> i) & 1) === 1;
      _modules![(i % 3) + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  };

  const setupTypeInfo = (test: boolean, maskPattern: number): void => {
    const data = (_errorCorrectionLevel << 3) | maskPattern;
    const bits = getBCHTypeInfo(data);

    // vertical
    for (let i = 0; i < 15; i += 1) {
      const mod = !test && ((bits >> i) & 1) === 1;

      if (i < 6) {
        _modules![i][8] = mod;
      } else if (i < 8) {
        _modules![i + 1][8] = mod;
      } else {
        _modules![_moduleCount - 15 + i][8] = mod;
      }
    }

    // horizontal
    for (let i = 0; i < 15; i += 1) {
      const mod = !test && ((bits >> i) & 1) === 1;

      if (i < 8) {
        _modules![8][_moduleCount - i - 1] = mod;
      } else if (i < 9) {
        _modules![8][15 - i - 1 + 1] = mod;
      } else {
        _modules![8][15 - i - 1] = mod;
      }
    }

    // fixed module
    _modules![_moduleCount - 8][8] = !test;
  };

  const mapData = (data: number[], maskPattern: number): void => {
    let inc = -1;
    let row = _moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    const maskFunc = getMaskFunction(maskPattern);

    for (let col = _moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col -= 1;

      while (true) {
        for (let c = 0; c < 2; c += 1) {
          if (_modules![row][col - c] == null) {
            let dark = false;

            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
            }

            const mask = maskFunc(row, col - c);

            if (mask) {
              dark = !dark;
            }

            _modules![row][col - c] = dark;
            bitIndex -= 1;

            if (bitIndex === -1) {
              byteIndex += 1;
              bitIndex = 7;
            }
          }
        }

        row += inc;

        if (row < 0 || _moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  };

  const createBytes = (
    buffer: QRBitBufferType,
    rsBlocks: ReturnType<typeof getRSBlocks>
  ): number[] => {
    let offset = 0;

    let maxDcCount = 0;
    let maxEcCount = 0;

    const dcdata: number[][] = new Array(rsBlocks.length);
    const ecdata: number[][] = new Array(rsBlocks.length);

    for (let r = 0; r < rsBlocks.length; r += 1) {
      const dcCount = rsBlocks[r].dataCount;
      const ecCount = rsBlocks[r].totalCount - dcCount;

      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);

      dcdata[r] = new Array(dcCount);

      for (let i = 0; i < dcdata[r].length; i += 1) {
        dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
      }
      offset += dcCount;

      const rsPoly = getErrorCorrectPolynomial(ecCount);
      const rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

      const modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Array(rsPoly.getLength() - 1);
      for (let i = 0; i < ecdata[r].length; i += 1) {
        const modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
      }
    }

    let totalCodeCount = 0;
    for (let i = 0; i < rsBlocks.length; i += 1) {
      totalCodeCount += rsBlocks[i].totalCount;
    }

    const data = new Array<number>(totalCodeCount);
    let index = 0;

    for (let i = 0; i < maxDcCount; i += 1) {
      for (let r = 0; r < rsBlocks.length; r += 1) {
        if (i < dcdata[r].length) {
          data[index] = dcdata[r][i];
          index += 1;
        }
      }
    }

    for (let i = 0; i < maxEcCount; i += 1) {
      for (let r = 0; r < rsBlocks.length; r += 1) {
        if (i < ecdata[r].length) {
          data[index] = ecdata[r][i];
          index += 1;
        }
      }
    }

    return data;
  };

  const createData = (
    typeNumber: number,
    errorCorrectionLevel: number,
    dataList: QRDataSegment[]
  ): number[] => {
    const rsBlocks = getRSBlocks(typeNumber, errorCorrectionLevel);

    const buffer = qrBitBuffer();

    for (let i = 0; i < dataList.length; i += 1) {
      const data = dataList[i];
      buffer.put(data.getMode(), 4);
      buffer.put(data.getLength(), getLengthInBits(data.getMode(), typeNumber));
      data.write(buffer);
    }

    // calc num max data
    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i += 1) {
      totalDataCount += rsBlocks[i].dataCount;
    }

    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error(`code length overflow. (${buffer.getLengthInBits()}>${totalDataCount * 8})`);
    }

    // end code
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }

    // padding
    while (buffer.getLengthInBits() % 8 !== 0) {
      buffer.putBit(false);
    }

    // padding
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }
      buffer.put(PAD0, 8);

      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }
      buffer.put(PAD1, 8);
    }

    return createBytes(buffer, rsBlocks);
  };

  const escapeXml = (s: string): string => {
    let escaped = '';
    for (let i = 0; i < s.length; i += 1) {
      const c = s.charAt(i);
      switch (c) {
        case '<':
          escaped += '&lt;';
          break;
        case '>':
          escaped += '&gt;';
          break;
        case '&':
          escaped += '&amp;';
          break;
        case '"':
          escaped += '&quot;';
          break;
        default:
          escaped += c;
          break;
      }
    }
    return escaped;
  };

  const _createHalfASCII = (margin?: number): string => {
    const cellSize = 1;
    const marginVal = typeof margin === 'undefined' ? cellSize * 2 : margin;

    const size = _moduleCount * cellSize + marginVal * 2;
    const min = marginVal;
    const max = size - marginVal;

    const blocks: Record<string, string> = {
      '██': '█',
      '█ ': '▀',
      ' █': '▄',
      '  ': ' ',
    };

    const blocksLastLineNoMargin: Record<string, string> = {
      '██': '▀',
      '█ ': '▀',
      ' █': ' ',
      '  ': ' ',
    };

    let ascii = '';
    for (let y = 0; y < size; y += 2) {
      const r1 = Math.floor((y - min) / cellSize);
      const r2 = Math.floor((y + 1 - min) / cellSize);
      for (let x = 0; x < size; x += 1) {
        let p = '█';

        if (
          min <= x &&
          x < max &&
          min <= y &&
          y < max &&
          _this.isDark(r1, Math.floor((x - min) / cellSize))
        ) {
          p = ' ';
        }

        if (
          min <= x &&
          x < max &&
          min <= y + 1 &&
          y + 1 < max &&
          _this.isDark(r2, Math.floor((x - min) / cellSize))
        ) {
          p += ' ';
        } else {
          p += '█';
        }

        ascii += marginVal < 1 && y + 1 >= max ? blocksLastLineNoMargin[p] : blocks[p];
      }

      ascii += '\n';
    }

    if (size % 2 && marginVal > 0) {
      return ascii.substring(0, ascii.length - size - 1) + Array(size + 1).join('▀');
    }

    return ascii.substring(0, ascii.length - 1);
  };

  const _this: QRCodeInstance = {
    addData: (data: string, mode?: string): void => {
      const modeVal = mode || 'Byte';

      let newData: QRDataSegment | null = null;

      switch (modeVal) {
        case 'Numeric':
          newData = qrNumber(data);
          break;
        case 'Alphanumeric':
          newData = qrAlphaNum(data);
          break;
        case 'Byte':
          newData = qr8BitByte(data);
          break;
        case 'Kanji':
          newData = qrKanji(data);
          break;
        default:
          throw new Error(`mode:${modeVal}`);
      }

      _dataList.push(newData);
      _dataCache = null;
    },

    isDark: (row: number, col: number): boolean => {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw new Error(`${row},${col}`);
      }
      return _modules![row][col] === true;
    },

    getModuleCount: () => _moduleCount,

    make: (maskPattern?: number): void => {
      if (_typeNumber < 1) {
        let typeNum = 1;

        for (; typeNum < 40; typeNum++) {
          const rsBlocks = getRSBlocks(typeNum, _errorCorrectionLevel);
          const buffer = qrBitBuffer();

          for (let i = 0; i < _dataList.length; i++) {
            const data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), getLengthInBits(data.getMode(), typeNum));
            data.write(buffer);
          }

          let totalDataCount = 0;
          for (let i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNum;
      }

      // Use specified mask pattern (0-7) or auto-select best one
      const finalMaskPattern =
        typeof maskPattern === 'number' && maskPattern >= 0 && maskPattern <= 7
          ? maskPattern
          : getBestMaskPattern();
      makeImpl(false, finalMaskPattern);
    },

    createTableTag: (cellSize?: number, margin?: number): string => {
      const cellSizeVal = cellSize || 2;
      const marginVal = typeof margin === 'undefined' ? cellSizeVal * 4 : margin;

      let qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ` padding: 0px; margin: ${marginVal}px;`;
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (let r = 0; r < _this.getModuleCount(); r += 1) {
        qrHtml += '<tr>';

        for (let c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ` width: ${cellSizeVal}px;`;
          qrHtml += ` height: ${cellSizeVal}px;`;
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c) ? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    },

    createSvgTag: (
      cellSize?:
        | number
        | {
            cellSize?: number;
            margin?: number;
            alt?: unknown;
            title?: unknown;
            scalable?: boolean;
          },
      margin?: number,
      alt?: unknown,
      title?: unknown
    ): string => {
      let opts: {
        cellSize?: number;
        margin?: number;
        alt?: unknown;
        title?: unknown;
        scalable?: boolean;
      } = {};
      if (typeof cellSize === 'object') {
        opts = cellSize;
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      const cellSizeVal = cellSize || 2;
      const marginVal = typeof margin === 'undefined' ? cellSizeVal * 4 : margin;

      // Compose alt property surrogate
      let altObj: { text: string | null; id: string | null } = { text: null, id: null };
      if (typeof alt === 'string') {
        altObj = { text: alt, id: alt ? 'qrcode-description' : null };
      } else if (alt && typeof alt === 'object') {
        altObj = alt as { text: string | null; id: string | null };
      }
      altObj.text = altObj.text || null;
      altObj.id = altObj.text ? altObj.id || 'qrcode-description' : null;

      // Compose title property surrogate
      let titleObj: { text: string | null; id: string | null } = { text: null, id: null };
      if (typeof title === 'string') {
        titleObj = { text: title, id: title ? 'qrcode-title' : null };
      } else if (title && typeof title === 'object') {
        titleObj = title as { text: string | null; id: string | null };
      }
      titleObj.text = titleObj.text || null;
      titleObj.id = titleObj.text ? titleObj.id || 'qrcode-title' : null;

      const size = _this.getModuleCount() * cellSizeVal + marginVal * 2;
      const rect = `l${cellSizeVal},0 0,${cellSizeVal} -${cellSizeVal},0 0,-${cellSizeVal}z `;

      let qrSvg = '';
      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ` width="${size}px" height="${size}px"` : '';
      qrSvg += ` viewBox="0 0 ${size} ${size}" `;
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg +=
        titleObj.text || altObj.text
          ? ` role="img" aria-labelledby="${escapeXml([titleObj.id, altObj.id].join(' ').trim())}"`
          : '';
      qrSvg += '>';
      qrSvg += titleObj.text
        ? `<title id="${escapeXml(titleObj.id || '')}">${escapeXml(titleObj.text)}</title>`
        : '';
      qrSvg += altObj.text
        ? `<description id="${escapeXml(altObj.id || '')}">${escapeXml(altObj.text)}</description>`
        : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (let r = 0; r < _this.getModuleCount(); r += 1) {
        const mr = r * cellSizeVal + marginVal;
        for (let c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c)) {
            const mc = c * cellSizeVal + marginVal;
            qrSvg += `M${mc},${mr}${rect}`;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    },

    createDataURL: (cellSize?: number, margin?: number): string => {
      const cellSizeVal = cellSize || 2;
      const marginVal = typeof margin === 'undefined' ? cellSizeVal * 4 : margin;

      const size = _this.getModuleCount() * cellSizeVal + marginVal * 2;
      const min = marginVal;
      const max = size - marginVal;

      return createDataURL(size, size, (x, y) => {
        if (min <= x && x < max && min <= y && y < max) {
          const c = Math.floor((x - min) / cellSizeVal);
          const r = Math.floor((y - min) / cellSizeVal);
          return _this.isDark(r, c) ? 0 : 1;
        } else {
          return 1;
        }
      });
    },

    createImgTag: (cellSize?: number, margin?: number, alt?: string): string => {
      const cellSizeVal = cellSize || 2;
      const marginVal = typeof margin === 'undefined' ? cellSizeVal * 4 : margin;

      const size = _this.getModuleCount() * cellSizeVal + marginVal * 2;

      let img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSizeVal, marginVal);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    },

    createASCII: (cellSize?: number, margin?: number): string => {
      const cellSizeVal = cellSize || 1;

      if (cellSizeVal < 2) {
        return _createHalfASCII(margin);
      }

      const cs = cellSizeVal - 1;
      const marginVal = typeof margin === 'undefined' ? cs * 2 : margin;

      const size = _moduleCount * cs + marginVal * 2;
      const min = marginVal;
      const max = size - marginVal;

      const white = Array(cs + 1).join('██');
      const black = Array(cs + 1).join('  ');

      let ascii = '';
      for (let y = 0; y < size; y += 1) {
        const r = Math.floor((y - min) / cs);
        let line = '';
        for (let x = 0; x < size; x += 1) {
          let p = 1;

          if (
            min <= x &&
            x < max &&
            min <= y &&
            y < max &&
            _this.isDark(r, Math.floor((x - min) / cs))
          ) {
            p = 0;
          }

          line += p ? white : black;
        }

        for (let i = 0; i < cs; i += 1) {
          ascii += `${line}\n`;
        }
      }

      return ascii.substring(0, ascii.length - 1);
    },

    renderTo2dContext: (context: CanvasRenderingContext2D, cellSize?: number): void => {
      const cellSizeVal = cellSize || 2;
      const length = _this.getModuleCount();
      for (let row = 0; row < length; row++) {
        for (let col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(col * cellSizeVal, row * cellSizeVal, cellSizeVal, cellSizeVal);
        }
      }
    },

    // Debug/test helper to access interleaved data bytes
    getDataCache: (): number[] => {
      if (_typeNumber < 1) {
        throw new Error('QR code not initialized: call make() before getDataCache()');
      }
      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }
      return _dataCache;
    },
  };

  return _this;
}
