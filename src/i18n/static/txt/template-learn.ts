import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: '640',
  description: '641',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: '684', type: 'generator' },
    { href: '/examples?lang=${lang}', label: '683', type: 'example' },
    { href: '/guide?lang=${lang}', label: '681', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: '900',
      paragraphs: ['902', '903'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: '904',
          caption: '905',
        },
      ],
    },
    {
      heading: '906',
      paragraphs: ['907', '908'],
    },
    {
      heading: '909',
      paragraphs: ['910', '911'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: '912',
          caption: '913',
        },
      ],
    },
    {
      heading: '914',
      paragraphs: ['915', '916'],
    },
    {
      heading: '917',
      paragraphs: ['918', '919'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: '920',
          caption: '921',
        },
      ],
    },
    {
      heading: '922',
      paragraphs: ['923', '924'],
    },
    {
      heading: '925',
      paragraphs: ['926', '927'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: '928',
          caption: '929',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: '684',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: '683',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: '930',
      paragraphs: ['932', '933'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: '934',
          caption: '935',
        },
      ],
    },
    {
      heading: '936',
      paragraphs: ['937', '938'],
    },
    {
      heading: '939',
      paragraphs: ['940', '941'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: '942',
          caption: '943',
        },
      ],
    },
    {
      heading: '944',
      paragraphs: ['945', '946'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: '947',
          caption: '948',
        },
      ],
    },
    {
      heading: '949',
      paragraphs: ['950', '951'],
    },
    {
      heading: '952',
      paragraphs: ['953', '954'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: '955',
          caption: '956',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '684',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: '683',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: '957',
      paragraphs: ['959', '960'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: '961',
          caption: '962',
        },
      ],
    },
    {
      heading: '963',
      paragraphs: ['964', '965'],
    },
    {
      heading: '966',
      paragraphs: ['967', '968'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: '969',
          caption: '970',
        },
      ],
    },
    {
      heading: '971',
      paragraphs: ['972', '973'],
    },
    {
      heading: '974',
      paragraphs: ['975', '976'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: '977',
          caption: '978',
        },
      ],
    },
    {
      heading: '979',
      paragraphs: ['980', '981'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: '982',
          caption: '983',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: '684',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: '683',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: '984',
      paragraphs: ['986', '987'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: '988',
          caption: '989',
        },
      ],
    },
    {
      heading: '990',
      paragraphs: ['991', '992'],
    },
    {
      heading: '993',
      paragraphs: ['994', '995'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: '996',
          caption: '997',
        },
      ],
    },
    {
      heading: '998',
      paragraphs: ['999', '1000'],
    },
    {
      heading: '1001',
      paragraphs: ['1002', '1003'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: '1004',
          caption: '1005',
        },
      ],
    },
    {
      heading: '1006',
      paragraphs: ['1007', '1008'],
    },
    {
      heading: '1009',
      paragraphs: ['1010', '1011'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: '1012',
          caption: '1013',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: '684',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: '683',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: '1014',
      paragraphs: ['1016', '1017'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: '1018',
          caption: '1019',
        },
      ],
    },
    {
      heading: '1020',
      paragraphs: ['1021', '1022'],
    },
    {
      heading: '1023',
      paragraphs: ['1024', '1025'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: '1026',
          caption: '1027',
        },
      ],
    },
    {
      heading: '1028',
      paragraphs: ['1029', '1030'],
    },
    {
      heading: '1031',
      paragraphs: ['1032', '1033'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: '1034',
          caption: '1035',
        },
      ],
    },
    {
      heading: '1036',
      paragraphs: ['1037', '1038'],
    },
    {
      heading: '1039',
      paragraphs: ['1040', '1041'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: '1042',
          caption: '1043',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: '684',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: '683',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: '683', type: 'example' },
    { href: '/guide?lang=${lang}', label: '681', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: '899', type: 'gallery' },
  ],
};
