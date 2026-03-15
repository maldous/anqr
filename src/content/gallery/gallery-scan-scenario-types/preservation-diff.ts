export interface PreservationDiff {
  id: string;
  title: string;
  description: string;
  heroPriority: number;
  intensity: number;
  finders: boolean;
  timing: boolean;
  alignment: boolean;
  formatInfo: boolean;
  versionInfo: boolean;
  finderDither: number;
  blendPres: boolean;
  blendMode?: 'overlay' | 'dither';
}
