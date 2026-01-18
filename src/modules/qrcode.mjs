/**
 * DEPRECATED: This file is kept for backward compatibility only.
 * Please use src/modules/qr-encoder/ instead.
 *
 * Original QR Code Generator for JavaScript
 * Copyright (c) 2009 Kazuhiko Arase
 * Licensed under the MIT license
 */

// Re-export everything from the new modular qr-encoder
import qrcode, {
  stringToBytes,
  createStringToBytes,
  setStringToBytes,
  resetStringToBytes,
} from './qr-encoder/index.ts';

// Legacy: attach stringToBytes methods to qrcode for backward compatibility
// Some code may do: qrcode.stringToBytes = customFn
Object.defineProperty(qrcode, 'stringToBytes', {
  get: () => stringToBytes,
  set: (fn) => setStringToBytes(fn),
  configurable: true,
});

qrcode.createStringToBytes = createStringToBytes;

export { qrcode, stringToBytes };
export default qrcode;
