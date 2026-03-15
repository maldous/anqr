import type { useTranslation } from 'react-i18next';

export type PlusCodeDisplayProps = Readonly<{
  lat: number;
  lon: number;
  t: ReturnType<typeof useTranslation>['t'];
}>;
