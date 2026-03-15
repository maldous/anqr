import type { LinkType } from './link-type';

export type PageLink = {
  href: string;
  label: string;
  type?: LinkType;
};
