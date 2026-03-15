import { languages } from './languages';

export function isRtlLanguage(langCode: string): boolean {
  const lang =
    languages.find((l) => l.code === langCode) ||
    languages.find((l) => l.code === langCode.split('-')[0]);
  return lang?.rtl ?? false;
}
