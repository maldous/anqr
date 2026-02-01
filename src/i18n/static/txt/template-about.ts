import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const about: PageDefinition = {
  title: '1',
  description: '2',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: '684', type: 'generator' },
    { href: '/learn?lang=${lang}', label: '682', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: '374', type: 'external' },
    { href: '/terms?lang=${lang}', label: '443', type: 'external' },
  ],
  sections: [
    {
      heading: '3',
      paragraphs: ['4', '5'],
    },
    {
      heading: '6',
      bullets: ['7', '8', '9', '10', '11', '12', '501'],
    },
    {
      heading: '13',
      paragraphs: ['14', '502', '15', '16'],
    },
    {
      heading: '17',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: '20',
      paragraphs: ['21', '22', '23'],
    },
    {
      heading: '24',
      paragraphs: ['25'],
    },
    {
      heading: '26',
      paragraphs: ['27'],
    },
    {
      heading: '28',
      paragraphs: ['29'],
    },
  ],
};

export default about;
