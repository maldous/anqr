import { createQRInstance } from "@/domain/qr/encode";
import type { BasicServerQRRequest } from "./basic-server-qr-request.types";

export function renderSvgServerQROutput(
  input: BasicServerQRRequest,
): { outputBuffer: Buffer; contentType: string } {
  const data = input.data;
  const size = input.size ?? 400;
  const ec = input.errorCorrection ?? "H";
  const fg = input.foreground ?? "000000";
  const bg = input.background ?? "ffffff";
  const margin = input.margin ?? 4;

  const qr = createQRInstance(data, ec);
  const moduleCount = qr.getModuleCount();
  const totalUnits = moduleCount + margin * 2;
  const moduleSize = Math.max(1, Math.floor(size / totalUnits));
  const actualSize = moduleSize * totalUnits;
  const marginPx = moduleSize * margin;

  let modules = "";
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        const x = marginPx + col * moduleSize;
        const y = marginPx + row * moduleSize;
        modules += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}"/>`;
      }
    }
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${actualSize} ${actualSize}" width="${actualSize}" height="${actualSize}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#${bg}"/><g fill="#${fg}">${modules}</g></svg>`;

  return { outputBuffer: Buffer.from(svg, "utf-8"), contentType: "image/svg+xml" };
}
