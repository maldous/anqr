import type { StaticPageType } from './StaticPage.types';

export interface StaticPageProps {
  page: StaticPageType;
}

export type TocGroup = {
  key: string;
  title: string;
  id?: string;
  items: { id: string; title: string }[];
};
