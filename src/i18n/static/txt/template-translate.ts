import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const translate: PageDefinition = {
  title: '1179',
  description: '1180',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: '1181', type: 'external' },
    { href: '/?lang=${lang}', label: '1182', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: '1183', type: 'external' },
    { href: '/contact?lang=${lang}', label: '1184', type: 'external' },
  ],
  sections: [
    {
      heading: '1185',
      paragraphs: ['1186', '1187'],
    },
    {
      heading: '1188',
      paragraphs: ['1189'],
      bullets: ['1190', '1191', '1192', '1193'],
    },
    {
      heading: '1194',
      paragraphs: ['1195'],
      bullets: ['1196', '1197', '1198', '1199', '1200'],
    },
    {
      heading: '1201',
      paragraphs: ['1202', '1203'],
    },
    {
      heading: '1204',
      paragraphs: ['1205'],
      bullets: ['1206', '1207', '1208'],
    },
    {
      heading: '1209',
      paragraphs: ['1210', '1211'],
    },
    {
      heading: '1212',
      paragraphs: ['1213'],
    },
  ],
};

export default translate;
