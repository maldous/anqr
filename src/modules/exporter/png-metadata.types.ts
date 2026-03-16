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
