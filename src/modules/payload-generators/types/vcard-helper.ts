import type { VCardVersion } from './vcard-version';

export interface VCardHelper {
  version: VCardVersion;
  fn?: string;
  n?: string;
  org?: string;
  title?: string;
  tel?: string[];
  email?: string[];
  url?: string;
  adr?: string[];
  note?: string;
  photo?: string;
  bday?: string;
  role?: string;
  impp?: string;
  uid?: string;
}
