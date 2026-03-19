export interface QRMetadataOptions {
  title: string;
  author: string;
  copyright: string;
  license: string;
  description: string;
  creationTime: boolean;
  customKv: Array<{ k: string; v: string }>;
}
