export interface PngMetadata {
  title?: string;
  author?: string;
  description?: string;
  copyright?: string;
  license?: string;
  creationTime?: string;
  software?: string;
  // Caller-provided extra key/value pairs. Each becomes its own iTXt
  // chunk in the PNG. PNG spec restricts keywords to 1-79 ASCII chars
  // and no leading/trailing whitespace — the embedder sanitises.
  custom?: Array<{ k: string; v: string }>;
}
