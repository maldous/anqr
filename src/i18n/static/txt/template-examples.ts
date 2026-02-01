import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: '671',
  description: '672',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: '684', type: 'generator' },
    { href: '/learn?lang=${lang}', label: '682', type: 'learn' },
    { href: '/guide?lang=${lang}', label: '681', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: '1044',
      paragraphs: ['1046', '1047'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: '1048',
          caption: '1049',
        },
      ],
    },
    {
      heading: '1050',
      paragraphs: ['1051', '1052'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: '1053',
          caption: '1054',
        },
      ],
    },
    {
      heading: '1055',
      paragraphs: ['1056', '1057'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: '1058',
          caption: '1059',
        },
      ],
    },
    {
      heading: '1060',
      paragraphs: ['1061', '1062'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: '1063',
          caption: '1064',
        },
      ],
    },
    {
      heading: '1065',
      paragraphs: ['1066', '1067', '1070'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: '1068',
          caption: '1069',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: '684',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: '682',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: '1071',
      paragraphs: ['1073', '1074'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: '1075',
          caption: '1076',
        },
      ],
    },
    {
      heading: '1077',
      paragraphs: ['1078', '1079'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: '1080',
          caption: '1081',
        },
      ],
    },
    {
      heading: '1082',
      paragraphs: ['1083', '1084'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: '1085',
          caption: '1086',
        },
      ],
    },
    {
      heading: '1087',
      paragraphs: ['1088', '1089'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: '1090',
          caption: '1091',
        },
      ],
    },
    {
      heading: '1092',
      paragraphs: ['1093', '1094', '1097'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: '1095',
          caption: '1096',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '684',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: '682',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: '1098',
      paragraphs: ['1100', '1101'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: '1102',
          caption: '1103',
        },
      ],
    },
    {
      heading: '1104',
      paragraphs: ['1105', '1106'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: '1107',
          caption: '1108',
        },
      ],
    },
    {
      heading: '1109',
      paragraphs: ['1110', '1111'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: '1112',
          caption: '1113',
        },
      ],
    },
    {
      heading: '1114',
      paragraphs: ['1115', '1116'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: '1117',
          caption: '1118',
        },
      ],
    },
    {
      heading: '1119',
      paragraphs: ['1120', '1121', '1124'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: '1122',
          caption: '1123',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: '684',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: '682',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: '1125',
      paragraphs: ['1127', '1128'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: '1129',
          caption: '1130',
        },
      ],
    },
    {
      heading: '1131',
      paragraphs: ['1132', '1133'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: '1134',
          caption: '1135',
        },
      ],
    },
    {
      heading: '1136',
      paragraphs: ['1137', '1138'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: '1139',
          caption: '1140',
        },
      ],
    },
    {
      heading: '1141',
      paragraphs: ['1142', '1143'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: '1144',
          caption: '1145',
        },
      ],
    },
    {
      heading: '1146',
      paragraphs: ['1147', '1148', '1151'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: '1149',
          caption: '1150',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: '684',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: '682',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: '1152',
      paragraphs: ['1154', '1155'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: '1156',
          caption: '1157',
        },
      ],
    },
    {
      heading: '1158',
      paragraphs: ['1159', '1160'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: '1161',
          caption: '1162',
        },
      ],
    },
    {
      heading: '1163',
      paragraphs: ['1164', '1165'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: '1166',
          caption: '1167',
        },
      ],
    },
    {
      heading: '1168',
      paragraphs: ['1169', '1170'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: '1171',
          caption: '1172',
        },
      ],
    },
    {
      heading: '1173',
      paragraphs: ['1174', '1175', '1178'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: '1176',
          caption: '1177',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: '684',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: '682',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: '682', type: 'learn' },
    { href: '/guide?lang=${lang}', label: '681', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: '899', type: 'gallery' },
  ],
};
