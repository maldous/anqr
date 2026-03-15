export const OPEN_SECTIONS_STORAGE_KEY = 'anqr:ui:open-sections';
export const DEFAULT_OPEN_SECTIONS = ['payload', 'render'];

export function loadStoredOpenSections(validSectionIds: Set<string>): string[] {
  if (!('sessionStorage' in globalThis)) return DEFAULT_OPEN_SECTIONS;
  try {
    const raw = globalThis.sessionStorage.getItem(OPEN_SECTIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_OPEN_SECTIONS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_OPEN_SECTIONS;
    const validSections = parsed.filter(
      (sectionId): sectionId is string =>
        typeof sectionId === 'string' && validSectionIds.has(sectionId)
    );
    return validSections.length > 0 ? validSections : DEFAULT_OPEN_SECTIONS;
  } catch {
    return DEFAULT_OPEN_SECTIONS;
  }
}
