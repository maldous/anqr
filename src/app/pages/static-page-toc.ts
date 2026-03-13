import type { PageSection } from '@/i18n/static';
import type { StaticPageType } from './StaticPage.types';
import type { TocGroup } from './static-page-types';

function buildGuideToc(sections: PageSection[], t: (key: string) => string): TocGroup[] {
  const groups: TocGroup[] = [
    { key: 'guide-0', title: t('nav.guide'), id: '', items: [] },
    { key: 'guide-1', title: t('tiers.basic'), id: '', items: [] },
    { key: 'guide-2', title: t('tiers.advanced'), id: '', items: [] },
    { key: 'guide-3', title: t('tiers.professional'), id: '', items: [] },
    { key: 'guide-4', title: 'API', id: '', items: [] },
    { key: 'guide-5', title: t('payload.other'), id: '', items: [] },
  ];

  const getGroupIndex = (sectionIndex: number): number => {
    if (sectionIndex <= 1) return 0;
    if (sectionIndex <= 4) return 1;
    if (sectionIndex <= 40) return 2;
    if (sectionIndex <= 56) return 3;
    if (sectionIndex <= 69) return 4;
    return 5;
  };

  for (const [index, section] of sections.entries()) {
    if (!section.heading) continue;
    const id = `section-${index}`;
    const groupIndex = getGroupIndex(index);
    if (!groups[groupIndex].id) {
      groups[groupIndex].id = id;
    }
    groups[groupIndex].items.push({ id, title: section.heading });
  }

  return groups.filter((group) => group.items.length > 0);
}

function buildLearnToc(sections: PageSection[]): TocGroup[] {
  const groups: TocGroup[] = [];
  const guideStartIndices = new Set([0, 7, 13, 19, 26]);

  for (const [index, section] of sections.entries()) {
    if (!section.heading) continue;
    const id = `section-${index}`;

    if (guideStartIndices.has(index)) {
      groups.push({ key: `learn-${groups.length}`, title: section.heading, id, items: [] });
    } else if (groups.length > 0) {
      groups[groups.length - 1].items.push({ id, title: section.heading });
    }
  }

  return groups.filter((group) => group.items.length > 0);
}

function buildExamplesToc(sections: PageSection[]): TocGroup[] {
  const groups: TocGroup[] = [];
  const exampleStartIndices = new Set([0, 5, 10, 15, 20]);

  for (const [index, section] of sections.entries()) {
    if (!section.heading) continue;
    const id = `section-${index}`;

    if (exampleStartIndices.has(index)) {
      groups.push({ key: `example-${groups.length}`, title: section.heading, id, items: [] });
    } else if (groups.length > 0) {
      groups[groups.length - 1].items.push({ id, title: section.heading });
    }
  }

  return groups.filter((group) => group.items.length > 0);
}

export function buildToc(
  page: StaticPageType,
  sections: PageSection[],
  t: (key: string) => string
): TocGroup[] {
  switch (page) {
    case 'guide':
      return buildGuideToc(sections, t);
    case 'learn':
      return buildLearnToc(sections);
    case 'examples':
      return buildExamplesToc(sections);
    default:
      return [];
  }
}
