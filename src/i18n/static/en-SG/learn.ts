import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Learn with ANQR',
  description: 'Practical, business-first guides for turning QR codes into real marketing assets - not just functional squares. Learn how to upgrade legacy point-of-sale codes, create compliant payment QR signage, prepare print-ready exports, use animation safely on digital displays, and share locked-in configurations across multilingual teams using ANQR ("anchor") links.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Open the generator', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'View QR examples', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Open the full User Guide', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Improving Existing QR Campaigns',
      paragraphs: ['Most businesses have QR codes scattered across their operations - on menus, counter stands, packaging, and promotional materials. Many of these codes were created years ago with basic generators, resulting in generic black-and-white squares that fail to inspire confidence or match your brand identity. This comprehensive guide walks you through a systematic approach to auditing, upgrading, and optimising your existing QR infrastructure without disrupting the customer journeys you\'ve already established.', 'The strategic advantage of upgrading rather than replacing your QR codes lies in preserving continuity. Your customers have already learned to expect certain destinations when they scan your codes. By keeping the encoded URLs identical while dramatically improving the visual presentation, scan reliability, and brand alignment, you create a seamless transition that enhances trust without requiring any changes to your digital infrastructure or analytics tracking.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'A side-by-side comparison showing a faded, generic QR code next to a modern branded version encoding the same URL',
          caption: 'Before and after: The same destination URL transformed from a dated generic code to a professional branded asset',
        },
      ],
    },
    {
      heading: 'Why Legacy QR Codes Underperform',
      paragraphs: ['QR codes created during the early adoption phase - particularly during 2020-2021 when businesses rushed to implement contactless solutions - often suffer from several critical issues. Low error correction settings make them fragile when printed on textured surfaces or viewed under challenging lighting. Insufficient quiet zones cause scanning failures when codes are placed near other visual elements. Generic styling fails to communicate brand legitimacy, leading to hesitation and reduced scan rates.', 'Beyond technical limitations, legacy codes often represent missed branding opportunities. Every QR code is a touchpoint with your customer - a moment where they\'re actively engaged and willing to take action. A professionally styled code that matches your brand colours, includes appropriate safety margins, and features optional branded elements transforms this utility into a marketing asset that reinforces your identity at every interaction.'],
    },
    {
      heading: 'Conducting a QR Code Audit',
      paragraphs: ['Begin your upgrade project by creating a comprehensive inventory of every QR code currently deployed across your business. Document the physical location, the encoded destination, the current condition of the printed material, and the typical scanning environment including lighting conditions and viewing angles. Test each code with multiple devices - older smartphones and budget devices often reveal reliability issues that premium phones mask.', 'Pay particular attention to codes in high-stakes locations: payment points, check-in areas, and promotional displays where scan failure directly impacts revenue or customer experience. These should be prioritised for immediate upgrade. Also note codes that appear in photography or video content, as these will require coordination with your marketing team to update visual assets.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'A checklist interface showing QR audit categories: location, condition, scan reliability, and priority rating',
          caption: 'Systematic QR audit template for documenting and prioritising your upgrade candidates',
        },
      ],
    },
    {
      heading: 'The Safe Upgrade Strategy',
      paragraphs: ['The cardinal rule of QR upgrades is destination preservation. Extract the exact URL from each existing code and encode it identically in your new version. This ensures all existing analytics, redirect logic, and customer expectations remain intact. If you need destination flexibility for future updates, this is the ideal time to introduce a branded short URL or redirect service - but implement this as a separate project to avoid compounding changes.', 'For the visual upgrade, apply improvements in layers: first ensure technical reliability (appropriate error correction and quiet zone), then add brand styling (colours, module shapes), and finally consider optional enhancements (centre overlays, frames). Each layer should be validated through testing before proceeding. ANQR\'s Safety Mode helps enforce these priorities by warning when styling choices might compromise scannability.'],
    },
    {
      heading: 'Adding Brand Identity Without Compromising Reliability',
      paragraphs: ['Effective QR branding balances visual impact against scan reliability. Start with colour: replace the default black foreground with your primary brand colour, ensuring sufficient contrast against your background. For most brands, dark colours on light backgrounds work best. Avoid low-contrast combinations, gradients that reduce edge clarity, or colours that appear similar under common lighting conditions.', 'Module shape customisation offers another branding opportunity with minimal reliability impact. Rounded modules create a softer, more approachable appearance while maintaining excellent scannability. Dot-style modules work well for modern, tech-forward brands. Connected modules suit industrial or corporate identities. Whatever style you choose, maintain consistency across all your QR deployments for instant brand recognition.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'A colour wheel diagram showing optimal QR colour combinations with contrast ratio indicators',
          caption: 'Brand colour selection guide showing high-contrast combinations that maintain scan reliability',
        },
      ],
    },
    {
      heading: 'Testing and Validation Protocol',
      paragraphs: ['Never deploy upgraded QR codes without rigorous testing. Print a physical proof at the exact size and on the same material as your final deployment. Test in the actual location where the code will live, at different times of day to account for lighting variations. Use at least three different devices: a current flagship phone, a mid-range device, and an older or budget smartphone.', 'Record scan times and success rates for each test. A well-optimised code should scan within 1-2 seconds on any reasonably modern device. If you\'re seeing consistent delays or failures, reduce styling intensity - remove or shrink overlays, increase quiet zone size, or switch to a higher error correction level. Reliability always takes precedence over visual sophistication.'],
    },
    {
      heading: 'Locking Your Configuration for Consistency',
      paragraphs: ['Once you\'ve validated an optimal configuration, preserve it using ANQR\'s shareable links. This creates a permanent record of every setting used to generate your approved code - colours, module style, error correction, sizing, and any overlays. Share this link with your design team, print vendors, and anyone who might need to reproduce the code in future.', 'This configuration lock prevents the gradual degradation that plagues many QR deployments. Without it, staff members recreate codes from screenshots, designers rebuild settings from memory, and print vendors make \'helpful\' adjustments. Each variation introduces potential issues. With a locked configuration link, every reproduction is identical to your tested, approved original.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'A diagram showing configuration drift: screenshots leading to recreations leading to variants, versus a single source-of-truth link',
          caption: 'Prevent configuration drift by establishing a single authoritative source for all QR reproductions',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Open the generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'View QR examples',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'QR Codes for Retail Payments',
      paragraphs: ['Payment QR codes operate in the most demanding environment in retail: the moment of transaction. Customers are ready to pay, often with a queue forming behind them, and every second of delay creates friction. Yet this high-pressure moment is also prime real estate for brand reinforcement. This guide explains how to create payment QR codes that scan instantly on banking apps while still presenting a professional, branded appearance that builds customer trust.', 'The fundamental principle for payment QR codes is reliability over aesthetics. A beautifully designed code that fails to scan on one customer\'s banking app will cost you far more in abandoned transactions and frustrated customers than a conservative design ever could. Start with compliance, add reliability, then carefully layer in branding only where it doesn\'t compromise the primary function.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'A retail counter display showing a payment QR code being scanned by a smartphone with a banking app',
          caption: 'Payment QR codes must work instantly with banking and wallet apps under real-world counter conditions',
        },
      ],
    },
    {
      heading: 'Understanding Payment QR Standards',
      paragraphs: ['Payment QR codes typically follow regional standards that dictate the payload format. In Singapore, PayNow QR uses specific formatting. In India, UPI codes follow BharatQR or UPI deep link standards. European SEPA payments use EPC QR codes. Each standard exists to ensure banking apps can instantly recognise and process the payment information. Deviating from these standards - even slightly - can cause payment apps to reject codes that generic camera scanners read without issue.', 'ANQR includes templates for major payment standards that automatically format your merchant details into compliant payloads. Always use these templates rather than manually constructing payment strings, as even minor formatting errors can cause transaction failures. If your region\'s payment standard isn\'t available as a template, consult your payment provider\'s technical documentation for exact formatting requirements.'],
    },
    {
      heading: 'Sizing and Placement for Counter Displays',
      paragraphs: ['Counter-top QR codes face unique physical challenges. Customers scan at arm\'s length, often at an angle, sometimes through sneeze guards or display cases. Overhead lighting creates glare spots. The code competes with other counter clutter for attention and clear sightlines. Size your payment QR generously - a minimum of 4-5cm is recommended for most counter applications, scaling up if the code sits behind glass or in a dimly lit area.', 'Position matters as much as size. Place the code where customers can comfortably hold their phone without blocking the queue or reaching awkwardly. Angle the display toward the customer rather than laying it flat. If possible, use matte lamination or non-reflective display materials to minimise glare from overhead lighting. Test the final placement at different times of day to catch lighting issues.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'A diagram showing optimal QR placement heights and angles for different counter configurations',
          caption: 'Counter placement guide: optimal heights, angles, and distances for reliable payment scanning',
        },
      ],
    },
    {
      heading: 'Conservative Branding for Payment Codes',
      paragraphs: ['Payment apps are less forgiving than generic camera scanners. Many banking apps use older, simpler QR reading algorithms optimised for speed rather than flexibility. This means styling that works perfectly with a phone camera may fail with specific payment apps. Keep branding conservative: use your brand colour for the foreground if it maintains strong contrast, but avoid gradients, heavy overlays, or decorative elements that could interfere with recognition.', 'If you want a centre logo or overlay, keep it extremely small - no more than 10-15% of the QR area - and test extensively with every payment app your customers might use. Many businesses opt for no overlay on payment codes specifically, reserving that styling for marketing QR codes where reliability requirements are less stringent. The payment code\'s job is to process transactions, not to impress visually.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'A comparison showing acceptable vs risky branding levels for payment QR codes',
          caption: 'Payment QR branding spectrum: from safe conservative styling to risky decorative approaches',
        },
      ],
    },
    {
      heading: 'Material and Print Considerations',
      paragraphs: ['The physical display material significantly impacts scan reliability. Glossy lamination reflects overhead lights directly into the customer\'s camera. Textured materials can distort module edges. Cheap printing can blur fine details. For payment QR codes, invest in quality: use matte or satin lamination, ensure high-resolution printing, and replace displays before they show wear. A scratched or faded payment code costs you transactions.', 'Consider the display\'s durability and replaceability. Counter displays get touched, moved, splashed, and occasionally knocked over. Design your display system so that the QR insert can be easily replaced without replacing the entire stand. Keep spare prints ready, generated from your locked configuration link, so worn codes can be swapped immediately.'],
    },
    {
      heading: 'Testing with Real Payment Apps',
      paragraphs: ['Generic camera scanners will decode almost any reasonably formatted QR code. Payment apps are pickier. Before deploying any payment QR code, test it with every payment app your customers might use. In multi-payment environments, this might mean testing with multiple banking apps, digital wallets, and payment platforms. Document which apps you\'ve tested and their versions - payment apps update frequently, and an update could change scanning behaviour.', 'Test under realistic conditions: the actual display, actual lighting, actual scanning distance. A code that scans instantly on your desk might struggle on the counter at 5pm when the afternoon sun creates glare. Test with the oldest, cheapest smartphone you can find - if it works reliably on a budget device, it will work on everything. Flag any scan time over 2 seconds for investigation and potential redesign.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'A testing checklist showing various payment apps, device types, and environmental conditions to verify',
          caption: 'Comprehensive payment QR testing matrix covering apps, devices, and environmental factors',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Open the generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'View QR examples',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Print-Ready QR Codes: SVG vs PNG',
      paragraphs: ['The difference between a QR code that scans perfectly and one that fails often comes down to how it was exported and handled in the print workflow. This guide explains the critical distinctions between vector (SVG) and raster (PNG) formats, when to use each, and how to hand off QR artwork to designers and print vendors in ways that preserve scan reliability from business cards to billboard-sized signage.', 'Print production introduces variables that don\'t exist on screen: ink spread, substrate texture, finishing processes, and the cumulative effect of multiple file conversions. A QR code that looks perfect in your design software can emerge from the printer with softened edges, reduced contrast, or subtly distorted modules. Understanding format selection and workflow best practices prevents these silent failures.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'A magnified view comparing vector QR modules with crisp edges versus raster modules showing pixel artifacts',
          caption: 'Vector vs raster at print scale: the precision difference that determines scan reliability',
        },
      ],
    },
    {
      heading: 'Why Vector (SVG) Is Preferred for Print',
      paragraphs: ['SVG files describe QR codes as mathematical shapes rather than grids of pixels. This means the code can be scaled to any size - from a 1cm label to a 10-metre banner - without any loss of edge sharpness. The printer\'s RIP (Raster Image Processor) renders the vectors at the output device\'s native resolution, ensuring each module edge is as crisp as the hardware allows. There\'s no interpolation, no anti-aliasing artifacts, no accumulated blur from multiple resize operations.', 'Beyond scalability, SVG files are more robust in professional workflows. They survive round-trips through design software without degradation. They can be colour-corrected without resampling. They embed cleanly into PDF files for press-ready output. For any print application where quality matters, SVG should be your default export format.'],
    },
    {
      heading: 'When PNG Is Acceptable',
      paragraphs: ['PNG becomes necessary when your workflow or destination platform doesn\'t support vector formats. Some web platforms, signage CMS systems, and legacy print workflows require raster images. In these cases, PNG can work well - but only if you follow strict rules: export at the final physical size and resolution, never scale up after export, and avoid any lossy compression or format conversion.', 'The critical rule for PNG is to calculate your required pixel dimensions before exporting. If your QR will print at 5cm and your printer operates at 300 DPI, you need approximately 590 pixels. Export at this size or larger, then scale down if needed - never up. Include this information in your filename or metadata so future users don\'t accidentally misuse a size-specific export.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'A calculator interface showing the relationship between physical size, DPI, and required pixel dimensions',
          caption: 'Print resolution calculator: determining the minimum pixel dimensions for your target output size',
        },
      ],
    },
    {
      heading: 'ANQR Export Options Explained',
      paragraphs: ['ANQR offers several SVG export modes to suit different workflows. True Vector mode produces pure path-based output ideal for print and professional design tools. When you\'ve added raster overlays or certain effects, ANQR can embed these while maintaining vector modules, or you can export a fully rasterised version at your specified resolution. Understanding these options helps you choose the right export for each use case.', 'For PNG exports, ANQR lets you specify exact dimensions and includes options for transparent backgrounds. The DPI setting helps you calculate appropriate sizes for print, though remember that DPI is metadata - what matters for print is having enough pixels for your physical size. When in doubt, export larger than you think you need; scaling down preserves quality while scaling up destroys it.'],
    },
    {
      heading: 'Preparing Files for Handoff',
      paragraphs: ['When passing QR artwork to designers or print vendors, include clear specifications: the intended physical size, minimum quiet zone requirements, and any colour space considerations. For critical applications, provide both an SVG master and a high-resolution PNG backup, clearly labeled with their intended uses. Include your ANQR configuration link so the code can be regenerated if needed.', 'Anticipate common mistakes in the handoff process. Explicitly state that the QR should not be scaled, rotated, skewed, or have effects applied. Specify that the quiet zone must remain clear - no crop marks, registration marks, or design elements intruding. If the QR will be placed on a coloured or photographic background, provide a version with an opaque backing shape to ensure adequate contrast.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'A file package diagram showing SVG master, PNG backup, specifications document, and configuration link',
          caption: 'Professional QR handoff package: everything a designer or print vendor needs for accurate reproduction',
        },
      ],
    },
    {
      heading: 'Verifying Print Proofs',
      paragraphs: ['Never approve a print run without scanning a physical proof. Request a proof printed on the actual substrate with the actual finishing that will be used in production. Scan the proof under lighting conditions similar to where the final piece will be displayed. Test with multiple devices, including older smartphones that might struggle with marginal quality.', 'If the proof scans slowly or inconsistently, investigate before approving. Common issues include insufficient contrast on coloured substrates, quiet zone violations from trimming, ink spread softening module edges, or lamination creating glare. Any of these can be addressed before committing to a full print run - but only if you catch them at the proof stage.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'A proof review checklist with scan test results, contrast measurements, and approval signatures',
          caption: 'Print proof verification workflow: systematic testing before committing to production quantities',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Open the generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'View QR examples',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Creating Animated QR Codes',
      paragraphs: ['Animated QR codes combine the functionality of standard QR codes with eye-catching motion that dramatically increases engagement rates. In digital signage, social media, and interactive displays, animation transforms a static utility into a compelling visual element that draws the eye and invites interaction. This guide covers the principles, techniques, and practical constraints of creating animated QR codes that scan reliably while delivering visual impact.', 'The fundamental challenge of animated QR codes is balancing visual interest against scan reliability. Every frame must be individually scannable - a scanner might capture the code at any point in the animation cycle. This constraint shapes every design decision: which elements can move, how much they can change, and what must remain stable throughout the animation.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'A digital signage display showing an animated QR code capturing viewer attention in a public space',
          caption: 'Animated QR codes in digital signage: motion that attracts attention and encourages scanning',
        },
      ],
    },
    {
      heading: 'How Animation Affects Scannability',
      paragraphs: ['QR scanners work by capturing a single frame and analysing the pattern of light and dark modules. For an animated code to work, every frame must contain the complete, valid QR pattern. This rules out animations that morph the code structure, dissolve modules, or significantly alter the contrast pattern. The data-carrying modules - the seemingly random pattern in the centre - must remain visually stable throughout.', 'Safe animation approaches modify elements that don\'t carry data: backgrounds, colours, decorative frames, and overlay elements. The structural components - finder patterns (the large corner squares), timing patterns (the alternating lines), and alignment patterns (smaller squares in larger codes) - must maintain their positions and proportions. Working within these constraints still allows for surprisingly dynamic and engaging animations.'],
    },
    {
      heading: 'Animation Techniques That Work',
      paragraphs: ['Colour cycling animates the foreground and background colours through a palette while maintaining sufficient contrast at every step. This creates a vibrant, attention-grabbing effect with minimal scan risk - as long as contrast never drops below readable levels. ANQR\'s colour cycle presets are designed to maintain scannability throughout the cycle.', 'Animated overlays place moving imagery behind a semi-transparent QR pattern. The code remains stable while the background animates - perhaps a looping video, animated brand elements, or abstract motion graphics. This technique requires careful intensity management to prevent the background from overwhelming the QR pattern, but creates the most visually striking results.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'A diagram showing the layered structure of an animated QR: stable code layer over animated background layer',
          caption: 'Animation layering principle: the QR pattern remains constant while background elements animate beneath',
        },
      ],
    },
    {
      heading: 'Configuring Animation Parameters',
      paragraphs: ['Frame rate affects both visual smoothness and file size. For most applications, 10-15 frames per second provides smooth-looking motion without excessive file sizes. Higher frame rates offer diminishing visual returns while significantly increasing file sizes. Consider your delivery context - a large digital sign can handle bigger files than a mobile ad placement.', 'Loop behaviour determines how the animation cycles. Seamless loops create continuous motion ideal for signage and ambient displays. Ping-pong (forward-then-reverse) loops work well for simple animations. For attention-grabbing pulses, consider animations with holds - periods of stillness punctuated by movement that draws the eye without constant motion fatigue.'],
    },
    {
      heading: 'Creating Animated Overlays',
      paragraphs: ['When using animated images (GIFs, animated WebPs, or video) as overlays, ANQR extracts frames and composites them with your QR code. The overlay intensity setting controls how much of the animation shows through - lower values prioritise scannability while higher values favour visual impact. Test your chosen intensity across multiple frames to ensure consistent scannability.', 'Source material quality significantly impacts results. Use overlays with clear subjects and good contrast. Avoid source animations with rapid flashing or extreme brightness changes that could create occasional low-contrast frames. Preview the full animation cycle before exporting to catch any problematic frames that might fail to scan.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'A frame-by-frame view of an animated overlay showing contrast levels maintained across the sequence',
          caption: 'Frame analysis: verifying consistent scannability across the entire animation cycle',
        },
      ],
    },
    {
      heading: 'Export and Delivery Considerations',
      paragraphs: ['GIF remains the most widely supported animated format, playing automatically in most contexts without requiring video player support. However, GIF\'s 256-colour palette limits colour fidelity. For colour-critical animations, consider animated WebP where supported, or fall back to video formats for the highest quality. ANQR\'s GIF export includes dithering options to maximise quality within palette limitations.', 'File size matters for delivery. Digital signage systems, email clients, and social platforms often impose size limits. If your animation exceeds these limits, reduce frame count, dimensions, or colour depth. Sometimes splitting a complex animation into a shorter loop achieves better results than aggressive compression that degrades every frame.'],
    },
    {
      heading: 'Testing Animated QR Codes',
      paragraphs: ['Testing animated codes requires scanning at multiple points in the animation cycle. Don\'t just scan once and assume success - scan repeatedly, at different moments, to verify that every frame is readable. Pay particular attention to frames at colour cycle extremes or overlay intensity peaks where contrast might be lowest.', 'Test on the actual display hardware where possible. Monitor colour calibration, viewing angle, and ambient lighting all affect how the animation appears and scans. A bright animation that scans perfectly on your monitor might wash out on an outdoor screen or become unreadable at oblique viewing angles.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'A testing matrix showing scan success rates across different frames, devices, and display conditions',
          caption: 'Animated QR testing protocol: systematic verification across frames, devices, and viewing conditions',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Open the generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'View QR examples',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'QR Safety and Compliance Best Practices',
      paragraphs: ['A beautifully designed QR code that fails to scan is worse than useless - it frustrates customers, damages brand perception, and wastes every resource invested in its creation and distribution. This guide covers the technical and practical factors that determine whether a QR code will scan reliably, and how to use ANQR\'s safety features to catch potential problems before they reach production.', 'QR code reliability isn\'t binary. A code might scan perfectly on flagship phones but fail on budget devices. It might work in ideal lighting but struggle in dim restaurants or bright sunlight. Understanding the factors that affect scannability helps you make informed tradeoffs between visual styling and real-world reliability.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'A reliability spectrum showing QR codes ranging from highly scannable to marginally readable',
          caption: 'The scannability spectrum: from bulletproof codes to styling that pushes reliability limits',
        },
      ],
    },
    {
      heading: 'Understanding Error Correction Levels',
      paragraphs: ['QR codes include built-in redundancy that allows them to be read even when partially damaged or obscured. The error correction level - L (7%), M (15%), Q (25%), or H (30%) - determines how much of the code can be missing while still decoding correctly. Higher error correction creates larger codes but provides a safety margin for overlays, printing imperfections, and environmental damage.', 'For codes with image overlays, error correction level H is essential - the overlay physically obscures part of the code, and you need that 30% redundancy to maintain reliability. For clean, unstyled codes in controlled environments, level M often suffices. Level L should be reserved for situations where code size is critically constrained and you can guarantee pristine conditions.'],
    },
    {
      heading: 'The Critical Quiet Zone',
      paragraphs: ['The quiet zone is the blank margin surrounding every QR code. Scanners use this boundary to identify where the code begins and ends. The ISO standard specifies a minimum quiet zone of four modules (four times the width of the smallest square in the code). Violating this space - with design elements, trim edges, or adjacent content - is one of the most common causes of scan failures.', 'ANQR\'s quiet zone enforcement helps maintain this critical spacing, but you must also ensure it\'s preserved in your final designs. When handing off QR artwork, explicitly specify the quiet zone requirements. When placing codes in layouts, verify that no elements intrude into this space. A few millimetres of clear space can mean the difference between reliable scanning and frustrated customers.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'A diagram showing correct quiet zone spacing versus common violations that cause scan failures',
          caption: 'Quiet zone requirements: the invisible margin that determines scan success',
        },
      ],
    },
    {
      heading: 'Contrast and Colour Safety',
      paragraphs: ['QR scanners detect the pattern of light and dark modules. Any styling that reduces this contrast - light foregrounds, dark backgrounds, gradient effects, or low-opacity overlays - makes the code harder to read. ANQR calculates contrast ratios and warns when your colour choices approach dangerous levels, but the final arbiter is always real-world testing.', 'Colour perception varies with lighting conditions. A colour combination that appears high-contrast on your monitor might become difficult to distinguish under warm incandescent lighting or cool fluorescent tubes. If your code will be deployed in varying lighting conditions, test under multiple light sources, and consider more conservative contrast ratios as a safety margin.'],
    },
    {
      heading: 'Module Size and Viewing Distance',
      paragraphs: ['The physical size of individual modules determines the maximum distance from which a code can be scanned. Smaller modules mean smaller codes but require closer scanning distances. The general rule is that each module should be at least 0.5mm at the intended scanning distance, scaling up proportionally for greater distances. A code on a billboard needs much larger modules than a code on a business card.', 'When calculating module size, consider the worst-case scenario: the customer with an older phone, in imperfect lighting, scanning at the maximum likely distance. Design for this user, and everyone else will have an even better experience. ANQR\'s size recommendations factor in these real-world variables to suggest appropriate dimensions for your intended use.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'A chart relating module size, print dimensions, and maximum effective scanning distance',
          caption: 'Scanning distance guide: matching module size to your deployment requirements',
        },
      ],
    },
    {
      heading: 'Using ANQR Safety Mode',
      paragraphs: ['ANQR\'s Safety Mode provides real-time feedback on scan reliability. It monitors contrast ratios, quiet zone compliance, overlay intensity, and other factors that affect scannability. When any parameter approaches risky levels, you\'ll see warnings with specific guidance on how to improve reliability. For professional deployments where failure is costly, keep Safety Mode active throughout the design process.', 'Safety Mode also includes a scan verification feature that attempts to decode your generated code and reports success or failure. While this in-app verification can\'t replicate every real-world condition, it catches many common issues before you invest in printing or distribution. Treat successful verification as a minimum bar, not a guarantee - real-world testing remains essential.'],
    },
    {
      heading: 'Real-World Testing Protocols',
      paragraphs: ['No amount of software verification replaces physical testing. Print your code at the intended size on representative material. Test it in the actual deployment environment with lighting conditions that match real use. Scan with multiple devices - not just your flagship phone, but budget Android devices, older iPhones, and any specific devices your audience commonly uses.', 'Document your testing systematically. Record which devices were tested, under what conditions, with what results. If you\'re deploying codes at scale, establish acceptance criteria: perhaps 95% success rate across your device test pool, or successful scans within 2 seconds on all tested devices. These standards help make go/no-go decisions objective rather than hoping for the best.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'A comprehensive testing checklist covering devices, conditions, and acceptance criteria',
          caption: 'QR deployment testing protocol: systematic verification before production commitment',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Open the generator',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'View QR examples',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'View QR examples', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Open the full User Guide', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Open the gallery', type: 'gallery' },
  ],
};
