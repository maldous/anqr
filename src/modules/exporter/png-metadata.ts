export {
  calculateCrc32,
  createPngPhysChunk,
  createPngTextChunk,
  embedPngDpi,
  embedPngMetadata,
} from '../../domain/render/export/png-metadata';

export interface PngMetadata {
  title?: string;
  author?: string;
  description?: string;
  copyright?: string;
  creationTime?: string;
  software?: string;
  comment?: string;
  [key: string]: string | undefined;
}
