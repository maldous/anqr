import type { VectorSvgConfig } from '../../../modules/exporter/types';
import { escapeXml } from '../../../modules/exporter/utils';

export function buildSvgMetadata(metadata: VectorSvgConfig['metadata']): string {
  if (!metadata) return '';
  const m = metadata;
  let content = '';
  if (m.title) {
    content += `  <title>${escapeXml(m.title)}</title>\n`;
  }
  if (m.description) {
    content += `  <desc>${escapeXml(m.description)}</desc>\n`;
  }
  const dcElements: string[] = [];
  if (m.author) {
    dcElements.push(`        <dc:creator>${escapeXml(m.author)}</dc:creator>`);
  }
  if (m.copyright) {
    dcElements.push(`        <dc:rights>${escapeXml(m.copyright)}</dc:rights>`);
  }
  if (m.creationTime) {
    dcElements.push(`        <dc:date>${new Date().toISOString()}</dc:date>`);
  }
  if (m.software) {
    dcElements.push(`        <dc:source>${escapeXml(m.software)}</dc:source>`);
  }
  if (dcElements.length > 0) {
    content += `  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:dc="http://purl.org/dc/elements/1.1/">
      <rdf:Description>
${dcElements.join('\n')}
      </rdf:Description>
    </rdf:RDF>
  </metadata>\n`;
  }
  return content;
}
