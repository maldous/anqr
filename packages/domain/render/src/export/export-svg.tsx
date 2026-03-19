import type { ExportConfig, ExportResult } from "../exporter/types";
import { escapeXml } from "../exporter/utils";
import { canvasToPngDataUrl } from "./canvas-to-png-data-url";
import { resolveExportConfig } from "./resolve-export-config";

/**
 * Export canvas as SVG (embedded raster)
 */
export async function exportSvg(
  canvas: HTMLCanvasElement,
  config: Partial<ExportConfig> = {},
): Promise<ExportResult> {
  const opts = resolveExportConfig(config, {
    width: canvas.width,
    height: canvas.height,
    format: "svg",
  });

  const dataUrl = await canvasToPngDataUrl(canvas);

  let metadata = "";
  if (opts.includeMetadata && opts.metadata) {
    const m = opts.metadata;
    if (m.title) metadata += `  <title>${escapeXml(m.title)}</title>\n`;
    if (m.description) metadata += `  <desc>${escapeXml(m.description)}</desc>\n`;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${opts.outputWidth}" height="${opts.outputHeight}"
     viewBox="0 0 ${opts.outputWidth} ${opts.outputHeight}">
${metadata}  <image width="${opts.outputWidth}" height="${opts.outputHeight}" xlink:href="${dataUrl}"/>
</svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const filename = `${opts.filename}.svg`;
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    filename,
    format: "svg",
    width: opts.outputWidth,
    height: opts.outputHeight,
  };
}
