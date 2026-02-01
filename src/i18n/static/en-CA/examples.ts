import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'ANQR Examples',
  description: 'Five real-world, production-style examples that show where QR codes create measurable value: uplifting a legacy retail counter code, branded retail payments and "scan-to" actions, print scaling from flyers to billboards, animated QR for digital signage, and cross-lingual collaboration using shareable Anchor links. Each example includes images, practical constraints, and a remix link back to the generator.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Open the generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Browse Learn articles', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Open the full User Guide', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Case Study: Retail Counter QR Uplift',
      paragraphs: ['This real-world example follows a small café that had been using the same QR code on their counter for three years. The original code was generated quickly during the pandemic rush, printed on standard paper, and slipped into a plastic stand. It still worked - technically - but customers often needed multiple attempts to scan it, and it did nothing to reinforce the café\'s carefully crafted brand identity.', 'The transformation began with a simple audit: the existing code encoded the café\'s online menu URL, which they wanted to keep. The challenge was making the QR feel like part of the café experience rather than an afterthought utility from 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'A weathered QR code in a plastic stand showing visible wear, fingerprints, and faded printing',
          caption: 'The starting point: three years of counter service had left the original QR barely functional',
        },
      ],
    },
    {
      heading: 'Diagnosing the Original Code\'s Problems',
      paragraphs: ['Testing revealed multiple issues: the original code used Error Correction L (minimum redundancy), had a quiet zone of only 2 modules, and was printed at low resolution. Under the café\'s warm tungsten lighting, the already-faded black modules barely contrasted against the yellowed paper. Older phones struggled; newer phones succeeded but with noticeable delay.', 'Beyond technical issues, the generic black-and-white square communicated nothing about the brand. Customers hesitated before scanning - a subtle trust barrier that reduced engagement with the café\'s carefully designed digital menu.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'A diagnostic overlay showing the original QR\'s technical deficiencies: low ECC, minimal quiet zone, poor contrast',
          caption: 'Technical analysis revealing why the legacy code underperformed in real-world conditions',
        },
      ],
    },
    {
      heading: 'The Uplift Process',
      paragraphs: ['Using ANQR, the café owner recreated the code with the identical menu URL but dramatically improved settings: Error Correction H for maximum resilience, a 6-module quiet zone for reliable boundary detection, and brand colours (deep burgundy modules on cream background) that matched the café\'s interior palette.', 'A small centre overlay featuring the café\'s logo was added - kept deliberately subtle to maintain scannability while providing instant brand recognition. Safety Mode confirmed the new design scanned reliably across test devices before any printing.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'The ANQR interface showing the configuration: brand colours, appropriate ECC, generous quiet zone, subtle logo overlay',
          caption: 'Building the upgraded configuration: every setting chosen to balance brand expression with scan reliability',
        },
      ],
    },
    {
      heading: 'Measurable Results',
      paragraphs: ['After deploying the new QR on professional matte-laminated card stock, the café tracked results over four weeks. Scan success rate improved from an estimated 70% to near-100%. Average scan time dropped from 3-4 seconds to under 1 second. Most significantly, menu engagement increased 40% - customers who previously glanced at the QR and gave up were now scanning confidently.', 'Staff reported fewer customer questions about \'how to use the QR\' and no more instances of manually typing the URL for frustrated customers. The branded appearance also sparked conversations, with customers commenting positively on the cohesive design.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'A before/after comparison with metrics: scan success rate, average scan time, and weekly scan count improvements',
          caption: 'Four weeks of data showing the measurable impact of a thoughtful QR uplift',
        },
      ],
    },
    {
      heading: 'Recreate This Configuration',
      paragraphs: ['The café\'s configuration demonstrates conservative but effective branding: Error Correction H, 6-module quiet zone, high-contrast brand colours, and a minimal centre overlay. This balance works for most retail counter applications where reliability must come first but brand presence still matters.', 'Open the generator with these settings pre-loaded and adapt the colours and overlay to your own brand. The key insight: reliability improvements alone can dramatically increase engagement, even before adding any visual styling.', 'View the related Learn guide on improving existing QR campaigns for the full methodology behind this approach.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Link to the generator pre-configured with the café\'s settings for immediate customisation',
          caption: 'Start with a proven configuration and customise for your brand',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Open the generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Browse Learn articles',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Case Study: Multi-Payment Counter Display',
      paragraphs: ['This example follows a boutique clothing store that had accumulated five different QR codes at their register: bank payment, tips, Instagram, Google reviews, and a hiring link. Each was generated from a different source, printed at different times, and displayed in mismatched stands. The visual chaos was undermining the store\'s carefully curated aesthetic, and staff regularly dealt with customers scanning the wrong code.', 'The solution required separating concerns: payment codes needed maximum reliability with conservative styling, while marketing codes could be more expressive. The unified display system that emerged demonstrates how to balance brand presence against the functional demands of different QR use cases.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'A cluttered register area showing five mismatched QR codes in various stands and printed materials',
          caption: 'The chaotic starting point: five disconnected QR codes competing for attention and causing customer confusion',
        },
      ],
    },
    {
      heading: 'Prioritising the Payment Experience',
      paragraphs: ['The store\'s primary payment method used a regional standard that required strict payload compliance. Testing revealed that even minor styling affected scan speed with certain banking apps. The decision: keep the payment QR completely unmodified except for size optimisation and professional printing on matte card stock.', 'This conservative approach meant the payment code looked less \'branded\' than ideal, but transaction completion rates improved dramatically. The insight: payment moments aren\'t branding opportunities - they\'re reliability moments. Customers appreciate speed and certainty over aesthetics when money is involved.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'A clean, large payment QR code on professional matte card stock, positioned prominently at the register',
          caption: 'The payment QR: sized generously, printed professionally, styled conservatively for instant recognition by banking apps',
        },
      ],
    },
    {
      heading: 'Creating the Secondary Action Display',
      paragraphs: ['For tips, reviews, social, and hiring, the store could be more expressive. These codes were regenerated in ANQR with consistent brand styling: the store\'s signature olive green on cream, rounded module style, and a subtle centre overlay with the store\'s icon. Error Correction H ensured reliability even with the styling.', 'These four codes were arranged in a branded panel positioned beside (not competing with) the payment code. Clear labels in the store\'s typography explained each code\'s purpose. The visual hierarchy was intentional: payment stood alone and prominent; secondary actions grouped together as options.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'A branded panel showing four styled QR codes for tips, reviews, social, and hiring, with clear labels',
          caption: 'The secondary action panel: consistent branding, clear labelling, positioned as options rather than distractions',
        },
      ],
    },
    {
      heading: 'Display System Design',
      paragraphs: ['The physical display solved several problems simultaneously. Both the payment stand and the secondary panel used matte materials to eliminate glare from overhead lighting. Heights were optimised for customers of varying stature. Angles directed toward the customer queue rather than flat on the counter.', 'Critically, the store created spare prints from locked ANQR configuration links. When the tips code eventually got coffee-splashed, staff replaced it within minutes using the stored configuration - no screenshots, no guessing at settings, no quality degradation.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'A diagram showing the physical display layout: heights, angles, materials, and the relationship between payment and secondary displays',
          caption: 'Display system blueprint: physical ergonomics optimised for reliable scanning across customer heights and lighting conditions',
        },
      ],
    },
    {
      heading: 'Operational Improvements',
      paragraphs: ['Six weeks after deployment, the store documented significant improvements: zero customer complaints about \'wrong code\' confusion, faster transaction times, and a 3x increase in tip submissions (customers could now find and scan the tip code without awkwardly asking staff). Google reviews also increased as the dedicated, well-labeled QR removed friction.', 'Staff training became simpler: \'payment code is the big one, everything else is on the panel.\' When payment apps updated and one briefly showed slower scanning, the conservative payment code design meant it still worked - just marginally slower rather than failing entirely.', 'See the Learn guide on QR codes for retail payments for the principles behind this display system design.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'A metrics dashboard showing before/after comparisons: confusion incidents, transaction time, tip frequency, review submissions',
          caption: 'Six weeks of operational data demonstrating the business impact of a thoughtful multi-QR display system',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Open the generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Browse Learn articles',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Case Study: From Business Card to Billboard',
      paragraphs: ['This example follows an event production company preparing for a major conference. They needed the same QR code - linking to the event app - deployed across radically different formats: attendee badge inserts (3cm), table tent cards (8cm), registration desk signage (30cm), wayfinding posters (60cm), and a massive stage backdrop banner (4 metres). Each format had different viewing distances, lighting conditions, and production workflows.', 'The challenge wasn\'t just technical - it was operational. Multiple vendors handled different print jobs, and the company needed to ensure consistent, scannable results regardless of who produced what. Their solution centred on SVG export and rigorous handoff documentation.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'A collage showing the same QR code deployed across five different sizes, from badge to banner',
          caption: 'One QR code, five deployment sizes: the challenge of maintaining scannability from centimetres to metres',
        },
      ],
    },
    {
      heading: 'Why Previous Events Had Problems',
      paragraphs: ['At their last conference, the company had experienced embarrassing failures. The stage banner QR was generated as a small PNG and scaled up in design software - the result looked acceptable from a distance but failed to scan reliably from the audience. Badge QRs were over-styled and too small, frustrating attendees trying to add contacts. Inconsistent settings across formats meant the \'same\' QR actually looked different on each piece.', 'Post-event analysis revealed the root cause: no single source of truth. Each designer had recreated the QR with slightly different settings, and each print vendor had processed files differently. Quality degraded through the telephone game of file handoffs.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Close-up photographs showing scanning failures: pixelated banner modules, undersized badge codes, inconsistent styling across formats',
          caption: 'Forensic analysis of previous event failures: each format had introduced different quality problems',
        },
      ],
    },
    {
      heading: 'The SVG-First Workflow',
      paragraphs: ['For this event, the company established a strict protocol: one master QR generated in ANQR with optimal settings (Error Correction H, generous quiet zone, clean styling), exported as SVG, and stored as the single authoritative source. The ANQR configuration link was documented alongside the SVG file so the code could be regenerated if needed.', 'Every designer and vendor received the same SVG master with explicit instructions: place at required size, do not modify, maintain quiet zone clearance. For vendors requiring raster formats, the company provided pre-rendered PNGs at specific sizes with clear naming conventions indicating intended use.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'A file package showing the SVG master, size-specific PNGs, specification document, and configuration link',
          caption: 'The handoff package: everything vendors needed to produce consistent results without guessing',
        },
      ],
    },
    {
      heading: 'Size-Specific Considerations',
      paragraphs: ['Each format required specific attention. Badge inserts at 3cm needed the QR to occupy maximum available space - scanning distance would be arm\'s length. Table tents at 8cm could include decorative framing outside the quiet zone. The 4-metre banner required calculation: from typical audience distance (15-20 metres), modules needed to be clearly distinguishable by phone cameras, which meant the QR needed to be at least 80cm within the banner design.', 'The company created a sizing guide documenting minimum QR dimensions for each expected scanning distance. This became a reusable asset for future events, removing guesswork from the design process.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'A chart showing the relationship between scanning distance, minimum QR size, and module dimensions for each event format',
          caption: 'The sizing matrix: calculated dimensions ensuring reliable scanning at each format\'s expected viewing distance',
        },
      ],
    },
    {
      heading: 'Production Results',
      paragraphs: ['Conference day validation was systematic: staff tested every deployed QR before doors opened. The badge inserts scanned instantly at arm\'s length. Table tents worked reliably in the variable lighting of breakout rooms. The stage banner - the previous event\'s embarrassment - scanned successfully from the middle of the audience area.', 'Zero scanning complaints were logged across 2,000+ attendees. The operational win was equally significant: when a last-minute sponsor addition required new signage, the production team generated it from the master SVG in minutes, confident it would match everything else.', 'See the Learn guide on print-ready QR codes for the SVG vs PNG decision framework and handoff best practices.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Event photography showing attendees successfully scanning QR codes at various sizes and distances throughout the venue',
          caption: 'Conference day success: reliable scanning across every format, from badge close-ups to stage banner distance shots',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Open the generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Browse Learn articles',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Case Study: Airport Lounge Digital Display',
      paragraphs: ['This example follows an airline lounge that had been using static QR codes on their digital welcome screens. The screens displayed rotating promotional content, but the QR code for lounge check-in sat in a corner, static and easily overlooked. Analytics showed only 15% of eligible guests used the QR check-in despite it being faster than the desk queue. Most guests simply didn\'t notice it.', 'The hypothesis was simple: in a visually busy environment with moving content, a static QR becomes invisible. The solution needed to make the QR noticeable without compromising the reliability required for a check-in flow where failure would mean frustrated travellers and longer desk queues.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'A digital display in an airport lounge showing promotional content with a small, static QR code in the corner',
          caption: 'The original setup: a static QR lost in a sea of dynamic promotional content, achieving only 15% adoption',
        },
      ],
    },
    {
      heading: 'Designing Safe Animation',
      paragraphs: ['The lounge\'s digital signage used large LED panels - a challenging environment where aggressive animation could create scanning problems. The design team started conservatively: a gentle pulse effect that subtly expanded and contracted the QR\'s visual presence without modifying the actual code structure. Frame timing was set slow (250ms) to avoid any flicker issues with the LED refresh rate.', 'Safety Mode validation confirmed every frame remained scannable. Additional testing on the actual LED panels revealed that the pulse needed to be even more subtle than desktop previews suggested - LED brightness and viewing angles affected perceived contrast more than expected.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'The ANQR animation settings panel showing pulse configuration: slow timing, subtle intensity, Safety Mode enabled',
          caption: 'Animation configuration: parameters tuned for LED panel display while maintaining scan reliability in every frame',
        },
      ],
    },
    {
      heading: 'Integration with Signage Content',
      paragraphs: ['The animated QR was positioned in a dedicated \'stable zone\' of the screen layout - an area that remained constant while promotional content rotated in the main display area. This separation was crucial: the QR needed visual stability for scanning even while attracting attention through its subtle animation.', 'A clear call-to-action was added adjacent to the QR: \'Skip the queue - scan to check in.\' The text remained static while the QR pulsed, creating a visual hierarchy that drew the eye to the scanning opportunity without overwhelming the promotional content.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'A screen layout diagram showing the animated QR in a stable zone while promotional content rotates in the main area',
          caption: 'Screen real estate allocation: the animated QR occupies a stable zone separate from rotating promotional content',
        },
      ],
    },
    {
      heading: 'Technical Deployment',
      paragraphs: ['The animated QR was exported as a GIF with optimised settings for the signage CMS. File size considerations mattered - the lounge\'s content management system had upload limits, and overly large files caused playback stuttering. The final export balanced visual quality against file size by limiting the colour palette and optimising frame count.', 'Deployment included a fallback: if the GIF failed to play for any reason, the signage system would display a static PNG backup. This redundancy ensured check-in capability was never lost due to technical issues with the animation.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'A CMS interface showing the animated QR upload with fallback static image configured',
          caption: 'Signage CMS configuration: animated primary with static fallback ensuring check-in capability is never interrupted',
        },
      ],
    },
    {
      heading: 'Measured Impact',
      paragraphs: ['After one month of operation, QR check-in adoption increased from 15% to 24% - a 60% relative improvement. Guest feedback surveys indicated the animated QR was \'easier to notice\' and \'felt more modern.\' Desk queue times decreased measurably during peak periods as more guests self-served via the QR.', 'Importantly, zero scanning failures were reported despite thousands of daily scans. The conservative animation approach had achieved the attention goal without sacrificing the reliability a check-in flow demanded. The lounge subsequently rolled out similar animated QRs to their other locations.', 'See the Learn guide on animated QR codes for digital signage for the technical principles behind safe animation design.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'A dashboard showing adoption rate increase, queue time reduction, and zero-failure scan reliability over the deployment period',
          caption: 'One month of data: 60% adoption increase, reduced queue times, and maintained perfect scan reliability',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Open the generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Browse Learn articles',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Case Study: Global Product Launch QR Campaign',
      paragraphs: ['This example follows a consumer electronics company launching a new product simultaneously in 12 markets across 8 languages. Each regional marketing team needed to produce packaging, retail displays, and promotional materials featuring QR codes linking to localised product pages. Previous launches had resulted in inconsistent QR styling, occasional scanning failures, and a \'telephone game\' of configuration drift as each team recreated codes from screenshots.', 'The solution leveraged ANQR\'s shareable configuration links to establish a single source of truth that every regional team could access, regardless of their interface language. The QR payload used a smart redirect that detected user language, so one code worked globally while delivering localised experiences.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'A world map showing 12 market locations with QR codes, some visually inconsistent with each other',
          caption: 'The challenge: 12 markets, 8 languages, and a history of inconsistent QR implementations across regions',
        },
      ],
    },
    {
      heading: 'Establishing the Master Configuration',
      paragraphs: ['The global brand team created the authoritative QR configuration in ANQR: brand colours matching the product line\'s visual identity, Error Correction H for reliability across all print and digital applications, and styling that would reproduce consistently regardless of local production methods. The configuration was locked and the share link documented in the global campaign brief.', 'Critically, the encoded URL used a language-detecting redirect service. When scanned, users were automatically routed to their local language product page. This meant all 12 markets could use identical QR codes - no per-market payload variations that could introduce errors.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'The ANQR interface showing the master configuration with brand colours, ECC H, and the smart redirect URL',
          caption: 'The master configuration: global brand standards encoded into a single, shareable source of truth',
        },
      ],
    },
    {
      heading: 'Regional Team Workflow',
      paragraphs: ['Each regional marketing team received the configuration link with simple instructions: open the link, verify the preview matches the brand guidelines, export in the required format for your application. The ANQR interface displayed in each team\'s preferred language, but the underlying QR settings remained identical regardless of interface language.', 'When the Japanese team needed SVG for high-end retail displays and the Brazilian team needed PNG for social media, both exported from the same configuration. When the German team\'s print vendor requested specific colour values, they could reference the configuration directly rather than guessing from a screenshot.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Screenshots showing the same configuration link opened in Japanese, Portuguese, and German interfaces',
          caption: 'Same configuration, different interfaces: regional teams work in their preferred language while maintaining global consistency',
        },
      ],
    },
    {
      heading: 'Handling Regional Variations',
      paragraphs: ['Some markets required minor adaptations. The Chinese team needed a version with a WeChat-optimised frame for social sharing. Rather than modifying the master, they created a documented variant with its own configuration link, clearly labeled as \'CN-WeChat variant\' in the campaign asset library. This maintained traceability while allowing necessary localisation.', 'The brand team established a simple rule: any variation from master required a new, documented configuration link. No modifications to exported files, no \'quick fixes\' in design software. This prevented the configuration drift that had plagued previous launches.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'An asset library interface showing the master configuration and approved regional variants, each with its own link',
          caption: 'Campaign asset governance: master configuration plus documented variants, all traceable via configuration links',
        },
      ],
    },
    {
      heading: 'Launch Results',
      paragraphs: ['Product launch day saw QR codes deployed across packaging, retail displays, event materials, and digital campaigns in all 12 markets simultaneously. Quality audits confirmed visual consistency across regions - the QR on Tokyo retail displays matched the QR on São Paulo packaging matched the QR on Berlin event banners.', 'Zero scanning failures were reported across markets. When a post-launch product page URL change was needed, the redirect service handled it invisibly - no reprinting required. The global team estimated the configuration link approach saved 40+ hours of coordination time compared to their previous launch methodology.', 'See the Learn guide on cross-lingual QR collaboration for the workflow principles behind global campaign consistency.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'A grid of photographs showing consistent QR deployment across different markets: Tokyo retail, São Paulo packaging, Berlin events',
          caption: 'Global consistency achieved: identical QR presentation across 12 markets despite different languages, vendors, and formats',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Open the generator',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Browse Learn articles',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Browse Learn articles', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Open the full User Guide', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Open the gallery', type: 'gallery' },
  ],
};
