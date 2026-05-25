// Encode → render-as-modules → decode roundtrip safety net (E-R3 / S1).
//
// For each (ECC level × payload kind) combination, encode a short string,
// rasterize the resulting module matrix to ImageData as plain
// black/white squares (the lowest common denominator of the QR render
// pipeline — every more-elaborate module style still has dark cells in
// the centre of each dark module, which is what the decoder samples),
// run decodeQR, assert the decoded payload equals what we encoded.
//
// Hard-enforces scan correctness across all four ECC levels and the
// most common encoding modes (numeric, alphanumeric, byte/UTF-8).
// Catches the entire class of "render change broke decoding" regressions
// without needing a real canvas implementation in CI — we synthesize
// the ImageData directly from the matrix.
import { describe, expect, it } from "vitest";
import { generateQR } from "./encode/generate-qr";
import { decodeQR } from "./decode/decoder-adapter";

type Ecc = "L" | "M" | "Q" | "H";

const PIXELS_PER_MODULE = 8;
const QUIET_ZONE_MODULES = 4;

interface MatrixLike {
  modules: boolean[][];
  size: number;
}

function rasterizeMatrixToImageData(qr: MatrixLike): ImageData {
  const moduleSize = qr.size;
  const pxPerModule = PIXELS_PER_MODULE;
  const quietPx = QUIET_ZONE_MODULES * pxPerModule;
  const dim = moduleSize * pxPerModule + 2 * quietPx;

  // Allocate buffer + fill with white background (quiet zone + light modules).
  const data = new Uint8ClampedArray(dim * dim * 4);
  data.fill(0xff); // Sets R, G, B, A = 255 across all pixels.

  // Stamp dark modules as solid black squares. The decoder's grid sampler
  // looks at the centre of each module, so plain squares are the strictest
  // test of encoding correctness without the renderer in the loop.
  for (let row = 0; row < moduleSize; row++) {
    for (let col = 0; col < moduleSize; col++) {
      if (!qr.modules[row][col]) continue;
      const y0 = quietPx + row * pxPerModule;
      const x0 = quietPx + col * pxPerModule;
      for (let dy = 0; dy < pxPerModule; dy++) {
        for (let dx = 0; dx < pxPerModule; dx++) {
          const idx = ((y0 + dy) * dim + (x0 + dx)) * 4;
          data[idx] = 0; // R
          data[idx + 1] = 0; // G
          data[idx + 2] = 0; // B
          // Alpha stays at 0xff from the initial fill.
        }
      }
    }
  }

  return { data, width: dim, height: dim, colorSpace: "srgb" } as ImageData;
}

const ECC_LEVELS: Ecc[] = ["L", "M", "Q", "H"];

// One payload per encoding mode so we exercise numeric, alphanumeric,
// byte/UTF-8, and longer text. UTF-8 multi-byte characters are
// intentionally NOT included — the current decoder treats QR byte
// segments as ISO-8859-1 (the QR spec default) and doesn't auto-detect
// UTF-8 via ECI, so `café` round-trips as `caf?`. That's a real decoder
// limitation worth its own ADR + fix, but it's a separate concern from
// "did a render change break scannability of an existing payload" —
// which is what this safety net is for. Add UTF-8 cases here once
// ECI auto-detect lands in the decoder.
const PAYLOADS: Array<{ label: string; payload: string }> = [
  { label: "numeric short", payload: "01234567" },
  { label: "numeric medium", payload: "1234567890123456789012345678" },
  { label: "numeric long", payload: "1234567890123456789012345678901234567890" },
  { label: "alphanumeric short", payload: "HTTPS://ANQR.LINK" },
  { label: "alphanumeric long", payload: "HELLO WORLD 1234567890 -.$%*+/:" },
  { label: "byte ASCII URL", payload: "https://anqr.link/?x=1&y=2" },
  {
    label: "byte ASCII long URL",
    payload: "https://example.com/very/long/path/with/many/segments?query=1&extra=2",
  },
  {
    label: "vcard-like",
    payload: "BEGIN:VCARD\nVERSION:3.0\nFN:Jane Doe\nTEL:+1234567890\nEMAIL:j@d.com\nEND:VCARD",
  },
  { label: "wifi-like", payload: "WIFI:T:WPA;S:MyNetwork;P:abc123pass;;" },
  { label: "tel:", payload: "tel:+61234567890" },
  { label: "geo:", payload: "geo:-33.8688,151.2093?q=Sydney" },
  { label: "sms:", payload: "smsto:+1234567890:Hi there from QR" },
  { label: "single char alphanumeric", payload: "Q" },
  { label: "alphanumeric URL", payload: "WWW.ANQR.LINK/Q" },
  { label: "byte mixed punctuation", payload: "Order #1234: ship to 1 Main St!" },
];

describe("QR encode→render→decode roundtrip", () => {
  for (const ecc of ECC_LEVELS) {
    for (const { label, payload } of PAYLOADS) {
      it(`ECC=${ecc} · ${label}: encodes and decodes to the same payload`, () => {
        const qr = generateQR(payload, { errorCorrectionLevel: ecc });
        const imageData = rasterizeMatrixToImageData(qr);
        const result = decodeQR(imageData);
        expect(result, `decode failed for ECC=${ecc}, payload=${label}`).not.toBeNull();
        expect(result?.data).toBe(payload);
      });
    }
  }
});
