import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'ANQR User Guide',
  description: 'Complete guide to using ANQR for creating QR codes.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Open the generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Browse Learn articles', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'View QR examples', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Getting Started',
      paragraphs: [
        'ANQR is a QR code generator with a client-first approach. By default, QR codes are generated locally in your browser - no account required and your data stays private. For professional embedding, you can also use the server-side API.',
        'The interface has three interface levels: Basic, Advanced, and Professional. Select your level using the tabs in the header. Each level unlocks additional features while keeping the interface focused on what you need.',
      ],
      bullets: [
        'Basic: Simple QR code creation with plain text/URL content and image overlay.',
        'Advanced: QR encoding options, rendering styles, animation, output formats, extended content types, and overlay customization.',
        'Professional: Watermarks, metadata, sharing, safety analysis, payment QR codes, and enterprise features.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'Open the generator', type: 'generator' }],
    },
    {
      heading: 'Quick Start',
      paragraphs: ['To create your first QR code:'],
      bullets: [
        '1. Select a content type (URL, text, WiFi, etc.) from the Content Type dropdown.',
        '2. Enter your data in the provided fields.',
        '3. Optionally customize colors, styles, and add an overlay image.',
        '4. Click Export to download your QR code as PNG, GIF, WebP, or SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Basic Features',
      paragraphs: [
        'The Basic level provides a streamlined interface for creating QR codes with payload content and image overlays. This is the simplest way to get started.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Content Types (Basic)',
      paragraphs: [
        'Plain Text: Encode any text up to the QR code capacity limit. Ideal for short messages, codes, or identifiers.',
        'URL: Encode web addresses. The QR code will open the URL when scanned. Supports http:// and https:// protocols.',
      ],
    },
    {
      heading: 'Image Overlay (Basic)',
      paragraphs: [
        'Upload an image (JPG, PNG, GIF, WebP) to blend with your QR code. Basic overlay features include:',
      ],
      bullets: [
        'Upload from file: Select an image from your device.',
        'Load from URL: Enter an image URL (must allow CORS).',
        'Center Logo: Places image in the center, relying on error correction.',
        'Blend: Simple alpha blending of image with QR pattern.',
        'Intensity: Controls how strongly the overlay affects the QR code (0-100%).',
        'Color Mode: Full Color, Grayscale, or Black & White.',
        'Preserve Finder Patterns: Keeps corner patterns unmodified for reliable scanning.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'See related guides and examples',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Advanced Features',
      paragraphs: [
        'The Advanced level unlocks QR encoding options, rendering styles, animation, output formats, extended content types, and advanced overlay customization.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'QR Encoding Settings',
      paragraphs: [
        'Version: QR codes come in versions 1-40, with higher versions holding more data but being larger. Set to 0 (Auto) to let ANQR choose the smallest version that fits your content.',
        'Error Correction: Determines how much damage a QR code can sustain while remaining scannable.',
      ],
      bullets: [
        'L (Low): 7% error correction - smallest size, least redundancy.',
        'M (Medium): 15% error correction - balanced option.',
        'Q (Quartile): 25% error correction - good for printed codes.',
        'H (High): 30% error correction - best for codes with overlays or in harsh conditions.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Quiet Zone (Margin)',
      paragraphs: [
        'The quiet zone is the white space around the QR code. Scanners need this margin to detect where the code starts. The standard recommends at least 4 modules. Reducing below 4 may cause scanning issues.',
      ],
    },
    {
      heading: 'Module Style',
      paragraphs: [
        'Modules are the individual squares that make up a QR code. ANQR offers five styles:',
      ],
      bullets: [
        'Square: Classic QR appearance with sharp corners.',
        'Rounded: Softened corners for a friendlier look.',
        'Dots: Circular modules for a modern aesthetic.',
        'Diamond: 45° rotated squares for a distinctive pattern.',
        'Connected: Modules merge when adjacent, creating organic shapes.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Finder Pattern Style',
      paragraphs: [
        'Finder patterns are the three large squares in QR corners that help scanners orient the code. Available styles:',
      ],
      bullets: [
        'Square: Standard square corners.',
        'Rounded: Softened corners matching rounded module style.',
        'Circle: Circular finder patterns for dot-style codes.',
      ],
    },
    {
      heading: 'Alignment & Timing Patterns',
      paragraphs: [
        'Alignment patterns appear in larger QR codes (version 2+) to help correct distortion. Timing patterns are the alternating lines connecting finder patterns.',
      ],
      bullets: [
        'Alignment Style: Match Finder, Square, Rounded, or Circle.',
        'Timing Style: Match Module, Solid, or Dashed.',
      ],
    },
    {
      heading: 'Colors',
      paragraphs: [
        'Foreground: The color of the QR modules. Black (#000000) is standard but any dark color works.',
        'Background: The background color. White (#ffffff) is standard. Ensure sufficient contrast with the foreground.',
        'Transparent Background: Remove the background entirely for use on colored surfaces. Ensure the surface provides adequate contrast.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Module Size & Gap',
      paragraphs: [
        'Module Size: Controls how large each module is rendered in pixels. Larger values create bigger, easier-to-scan codes.',
        'Module Gap: Adds space between modules as a percentage. Small gaps (5-15%) can improve scannability in some conditions but excessive gaps reduce reliability.',
      ],
    },
    {
      heading: 'Output Settings',
      paragraphs: ['Format: Choose your export format based on use case.'],
      bullets: [
        'PNG: Lossless raster format, ideal for most uses. Best for print and digital.',
        'WebP: Modern format with smaller file sizes. Good for web use.',
        'GIF: Required for animated QR codes. Supports transparency.',
        'SVG: Vector format that scales infinitely. Best for large print or when you need to edit the code.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'See related guides and examples',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Output Dimensions',
      paragraphs: [
        'Width/Height: Set the output size in pixels. For print, calculate based on DPI (e.g., 300 DPI at 1 inch = 300px). Larger sizes scan more reliably at distance.',
      ],
    },
    {
      heading: 'Animation Settings (Advanced)',
      paragraphs: ['Control animated QR code behavior:'],
      bullets: [
        'Speed: Animation frame rate in milliseconds.',
        'Loop: Continuous or single-play animation.',
        'Bounce: Ping-pong animation direction.',
        'Start Frame: Begin animation from specific frame.',
        'Max Frames: Limit total frames in animation.',
        'Frame Step: Skip frames for faster animation.',
        'Interpolation: None, Crossfade, or Morph between frames.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'See related guides and examples',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Content Types (Advanced)',
      paragraphs: ['Advanced level unlocks additional payload formats:'],
      bullets: [
        'Phone Number (tel:): Creates a callable phone link.',
        'Email (mailto:): Opens email client with optional subject and body.',
        'SMS: Pre-filled text message to a phone number.',
        'vCard: Full contact card with name, organization, phone, email, address.',
        'MeCard: Compact contact format popular in Japan.',
        'BizCard: Legacy business card format.',
        'Geo Location: GPS coordinates that open in maps.',
        'WiFi: Network credentials for automatic connection (SSID, password, security type).',
        'Calendar Event: iCalendar format with title, location, date/time.',
        'Event RSVP: Link to event registration page.',
        'Calendar Subscribe: Subscribe to an ICS/WebCal feed.',
        'File/Document URL: Direct link to downloadable files.',
        'Cloud Storage Link: Links to Google Drive, Dropbox, OneDrive, etc.',
        'Social Profile: Links to LinkedIn, Twitter, Instagram, etc.',
        'Messaging Link: WhatsApp, Telegram, Signal deep links.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Advanced Overlay Features',
      paragraphs: ['Additional overlay capabilities:'],
      bullets: [
        'Crop: Enable cropping to select a square region of your image.',
        'Halftone: Classic print-style dot pattern based on image brightness.',
        'Dithered: Error-diffusion dithering for detailed reproduction.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Overlay Blend Modes (Advanced)',
      paragraphs: ['Additional blend modes in Advanced level:'],
      bullets: [
        'Subpixel: Divides each module into subpixels for higher detail.',
        'Blue Noise: Uses blue noise dithering for artifact-free patterns.',
        'Mosaic: Tile-based effect preserving image structure.',
        'Gap Fill: Places image in gaps between modules.',
        'Brightness: Varies module size based on image brightness.',
        'Duotone: Maps image to two colors for striking contrast.',
      ],
    },
    {
      heading: 'Overlay Intensity',
      paragraphs: [
        'Controls how strongly the overlay affects the QR code (0-100%). Higher values show more image detail but may reduce scannability. Start around 70% and adjust based on testing.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'See related guides and examples',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Color Mode',
      paragraphs: ['How the overlay image is processed:'],
      bullets: [
        'Full Color: Preserves original image colors.',
        'Grayscale: Converts to black and white tones.',
        'Black & White: High contrast binary conversion.',
      ],
    },
    {
      heading: 'Preserve Finder Patterns',
      paragraphs: [
        'When enabled, keeps the three corner finder patterns unmodified by the overlay. Strongly recommended for reliable scanning.',
      ],
    },
    {
      heading: 'Image Preprocessing',
      paragraphs: [
        'Apply filters to your overlay image before blending. These adjustments can improve how the image appears in the final QR code.',
      ],
      bullets: [
        'Brightness (-100 to +100): Lighten or darken the image.',
        'Contrast (-100 to +100): Increase or decrease tonal range.',
        'Gamma (0.2 to 3.0): Non-linear brightness adjustment. Values below 1 lighten midtones, above 1 darken them.',
        'Saturation (-100 to +100): Color intensity. -100 is grayscale, +100 is oversaturated.',
        'Hue Rotate (0-360°): Shift all colors around the color wheel.',
        'Blur (0-20px): Soften image details.',
        'Sharpen (0-100%): Enhance edges and details.',
        'Posterize (0-16 levels): Reduce color levels for a poster effect.',
        'Threshold (0-255): Convert to binary black/white at cutoff point.',
        'Edge Detection: Sobel or Canny algorithms to show only edges.',
        'Invert: Reverse all colors.',
      ],
    },
    {
      heading: 'Fit Mode',
      paragraphs: ['How the overlay image fits the QR code area:'],
      bullets: [
        'Cover: Image fills entire area, cropping if needed.',
        'Contain: Entire image visible, may have margins.',
        'Stretch: Image distorts to fill exactly.',
      ],
    },
    {
      heading: 'Transform Options',
      paragraphs: [
        'Rotation: Rotate overlay in 90° increments.',
        'Flip X/Y: Mirror the image horizontally or vertically.',
      ],
    },
    {
      heading: 'Dithering Algorithms',
      paragraphs: [
        'Dithering converts continuous-tone images to patterns that QR codes can represent. Available when using Dithered, Blue Noise, or True Dither blend modes.',
      ],
      bullets: [
        'Error Diffusion: Classic Floyd-Steinberg style. Spreads quantization error to neighboring pixels.',
        'Ordered (Bayer): Uses a threshold matrix for regular patterns.',
        'Clustered Dot: Simulates halftone printing.',
        'Void & Cluster: Optimized ordered dithering.',
        'Blue Noise: Visually pleasant random-looking pattern.',
        'Blue Noise Threshold: Threshold dithering with blue noise texture.',
        'White Noise: Random threshold dithering.',
        'Gaussian/Triangular Noise: Noise with different distributions.',
        'Blue Noise + Error Diffusion: Hybrid combining both techniques.',
        'Screened Blue Noise: Screen-like blue noise pattern.',
        'Perceptual: Luminance-weighted for better visual results.',
        'Edge-Aware: Preserves image edges during dithering.',
        'Adaptive Threshold: Locally-adaptive thresholding.',
        'Temporal Blue Noise: For animated GIFs, varies pattern per frame.',
      ],
    },
    {
      heading: 'Diffusion Kernels',
      paragraphs: ['When using Error Diffusion dithering, choose how error is distributed:'],
      bullets: [
        'Floyd-Steinberg: Classic 4-neighbor diffusion. Good general choice.',
        'Jarvis-Judice-Ninke: 12-neighbor, smoother but slower.',
        'Stucki: Similar to JJN with different weights.',
        'Burkes: Simplified JJN, faster.',
        'Sierra: Family of kernels balancing quality and speed.',
        'Atkinson: Light diffusion, preserves detail but can be grainy.',
      ],
    },
    {
      heading: 'Dither Strength',
      paragraphs: [
        'Controls how much dithering is applied (0-100%). Lower values preserve more of the original pattern, higher values show more image detail.',
      ],
    },
    {
      heading: 'Subpixel Settings',
      paragraphs: ['When using Subpixel blend mode:'],
      bullets: [
        'Grid Size: 2×2, 3×3, or 4×4 subpixels per module. Higher = more detail.',
        'Center Rule: Strict requires center subpixel to match module. Halftone Center allows variation.',
        'Neutral Color: Color used for undetermined subpixels.',
        'Finder Override: How finder patterns are rendered (Solid or Stylized).',
      ],
    },
    {
      heading: 'Halftone Settings',
      paragraphs: ['When using Halftone blend mode:'],
      bullets: [
        'Cell Size: Per Module or N×N grid.',
        'Dot Shape: Circle, Square, or Line.',
        'Brightness Curve: Linear, S-Curve, or Gamma.',
      ],
    },
    {
      heading: 'Duotone Colors',
      paragraphs: [
        'When using Duotone blend mode, set the Shadow color (dark areas) and Highlight color (bright areas).',
      ],
    },
    {
      heading: 'GIF Animation Settings',
      paragraphs: ['When using animated GIF overlays:'],
      bullets: [
        'Use Frame Delays: Respect original GIF timing.',
        'Max FPS: Limit frame rate (1-60 fps).',
        'Disposal Handling: Respect or Simplify frame disposal methods.',
      ],
    },
    {
      heading: 'Advanced Rendering Options',
      paragraphs: ['Additional rendering controls:'],
      bullets: [
        'Gap Mode: None, Inset, Stroke, or Negative Space gap styling.',
        'Corner Radius: Rounded corners percentage for modules.',
        'Gradient: None, Linear, Radial, or Conic gradient on modules.',
        'Eye Outer/Inner Style: Independent styling for finder pattern rings.',
        'Dot Rotation: Rotate diamond/dot modules.',
        'Eye Scale: Size adjustment for finder patterns.',
        'Frame Style: Add decorative frames (Rounded Frame, Sticker, Tag).',
        'Frame Text: Add text like "Scan Me!" to frames.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Advanced QR Encoding',
      paragraphs: ['Fine-tune QR encoding:'],
      bullets: [
        'Encoding Mode: Auto, Numeric, Alphanumeric, Byte/UTF-8, or Kanji.',
        'Enforce Min Quiet Zone: Ensure at least 4 module margin.',
        'Mask Pattern: Auto (optimal), or manually select patterns 0-7 to control module distribution. Different patterns create different visual appearances while encoding the same data.',
        "Character Encoding: ISO-8859-1 (Latin-1 default), UTF-8 (full Unicode including emoji), or Shift-JIS (Japanese). Choose based on your content's character requirements.",
      ],
    },
    {
      heading: 'Advanced Output Options',
      paragraphs: ['Additional export settings:'],
      bullets: [
        'Filename: Custom filename for downloads.',
        'GIF Palette Size: 2-256 colors in GIF output.',
        'GIF Quantizer: Median Cut, NeuQuant, or Octree color reduction.',
        'GIF Dithering: Off, Floyd-Steinberg, or Ordered.',
        'GIF Transparent Color: Set a color to be transparent.',
        'SVG True Vector: Use paths instead of embedded raster.',
        'SVG Shape Precision: Pixel or Precise path rendering.',
        'SVG Embed Raster Overlay: Include overlay as embedded image.',
        'Background Override: Force a specific background color in output.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Validation Options',
      paragraphs: ['Input processing settings:'],
      bullets: [
        'Validate Input: Check content format before encoding.',
        'Trim Whitespace: Remove leading/trailing spaces.',
        'Normalize Newlines: Convert all line endings to LF.',
        'Max Length Guard: Warn if content exceeds QR capacity.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Professional Features',
      paragraphs: [
        'The Professional level adds watermarks, metadata, sharing options, safety analysis, payment QR codes, and enterprise features.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Watermark',
      paragraphs: ['Add watermarks to your QR codes:'],
      bullets: [
        'Kind: Text, Image, or Pattern watermark.',
        'Position: Center, Corners, Edges, Behind, or Quiet Zone.',
        'Opacity: Watermark transparency (0-100%).',
        'Blend Mode: Normal, Multiply, Screen, or Overlay blending.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Metadata',
      paragraphs: ['Embed metadata in exported files:'],
      bullets: [
        'Title, Author, Copyright, License, Description fields.',
        'Creation Time: Embed generation timestamp.',
        'Custom Key-Value: Add arbitrary metadata pairs.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Sharing',
      paragraphs: ['Share your QR code configurations:'],
      bullets: [
        'Direct Link: Generate a shareable URL with your current settings.',
        'Embed HTML: Get embed code for websites.',
        'Encode Parameters: Include all settings in the share URL.',
        'Note: Overlay images from local files cannot be shared via URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'See related guides and examples',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Safety Analysis',
      paragraphs: ['Ensure QR codes remain scannable:'],
      bullets: [
        'Safety Mode: Off, Balanced, or Strict scanning requirements.',
        'Min Module Size: Minimum pixel size per module.',
        'Min Quiet Zone: Minimum margin modules.',
        'Lock Finders/Timing/Align/Format/Version: Protect specific elements.',
        'Max Overlay Intensity by ECC: Automatic intensity limits based on error correction level.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'See related guides and examples',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Content Types (Professional)',
      paragraphs: ['Professional level adds payment and enterprise content types:'],
      bullets: [
        'EPC/SEPA (EU): European bank transfer QR codes with IBAN, BIC, amount, reference.',
        'UPI (India): Unified Payments Interface with VPA, payee name, amount.',
        'PayNow (Singapore): Singapore fast payment with UEN or mobile number.',
        'PromptPay (Thailand): Thai national payment system.',
        'PIX (Brazil): Brazilian instant payment with PIX key.',
        'Crypto: Bitcoin, Ethereum, Litecoin payment addresses with optional amount.',
        'Marketing Campaign Link: URLs with full UTM parameter (Marketing Tags) tracking.',
        'Short Link: For use with URL shorteners for dynamic/trackable QR codes.',
        'GS1 Digital Link: Product identification with GTIN, serial, batch, expiry.',
        'App Deep Link: iOS/Android app deep links with custom schemes.',
        'Custom Format: Raw data with no formatting or validation.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'See related guides and examples',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Language-Relevant Payments in Advanced Mode',
      paragraphs: [
        'When using Advanced mode, ANQR automatically shows payment methods relevant to your selected language. For example, Vietnamese users see VietQR, Thai users see PromptPay, and Indian language users see UPI and BharatQR. Global payment methods (cryptocurrency, PayPal, Cash App) are available to all languages. Professional mode unlocks all payment standards regardless of language.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'European Payment Standards',
      bullets: [
        'EPC/SEPA (EU): European bank transfer QR codes following the EPC QR Code Standard. Supports IBAN, BIC (optional for domestic), amount in EUR, and structured or unstructured payment references. Used across the SEPA zone including EU countries plus Switzerland, Norway, Iceland, Liechtenstein, Monaco, and San Marino.',
        'Swiss QR-bill: Swiss payment standard following SIX Implementation Guidelines. Supports CHF and EUR, QR-Reference (QRR), Creditor Reference (ISO 11649), structured creditor/debtor addresses, and bill information. Required for Swiss invoices since 2022.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Indian Payment Standards',
      bullets: [
        'UPI (India): Unified Payments Interface following NPCI Deep Linking Specification. Supports VPA (Virtual Payment Address), payee name, amount in INR, transaction note, reference ID, merchant category code, and transaction mode.',
        'BharatQR (India): Unified QR standard supporting both UPI and card-based payments. Combines UPI VPA with card PAN for maximum compatibility. Includes merchant name, city, MCC, GST details, and invoice/reference numbers.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Southeast Asian Payment Standards',
      bullets: [
        'PayNow (Singapore): Singapore fast payment system using EMVCo QR specification with SGQR profile. Supports UEN (business registration), mobile number, or NRIC as proxy identifiers. Includes amount editability flag and expiry date.',
        'PromptPay (Thailand): Thai national payment system following Bank of Thailand EMV profile. Supports mobile number, national ID, tax ID, e-wallet ID, and bill payment with multiple reference fields.',
        'QRIS (Indonesia): Quick Response Code Indonesian Standard. EMV-based national payment standard supporting merchant ID, NMID (National Merchant ID), merchant criteria classification, and convenience fees (fixed or percentage).',
        'DuitNow (Malaysia): Malaysian instant payment system. Supports multiple proxy types including NRIC, mobile, passport, army ID, and business registration numbers.',
        'VietQR (Vietnam): Vietnamese interbank transfer standard. Requires bank BIN (NAPAS identification) and account number. Supports multiple service codes for different transfer types (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Philippines): Philippine QR payment standard for InstaPay and PESONet. Uses account numbers with merchant identification for P2M (person-to-merchant) transactions.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'East Asian Payment Standards',
      bullets: [
        'TWQR (Taiwan): Taiwanese QR payment standard. Supports merchant ID, tax ID, and TWD amounts.',
        'HKQR/FPS (Hong Kong): Hong Kong Faster Payment System QR codes. Supports FPS ID, mobile number, or email as payment identifiers. Amounts in HKD.',
        'JPQR (Japan): Japanese unified QR code payment standard. Uses store ID for merchant identification with JPY amounts.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Other Regional Payment Standards',
      bullets: [
        'PIX (Brazil): Brazilian Central Bank instant payment system following BR Code specification. Supports PIX keys (CPF, CNPJ, email, phone, or random key), merchant name/city, transaction ID, and BRL amounts.',
        'AusPayNet/NPP PayID (Australia): Australian New Payments Platform PayID system. Supports PayID types (email, mobile, ABN, organisation ID) or traditional BSB + account number. Merchant name is optional as payers see the registered name from NPP lookup.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Cryptocurrency Payments',
      bullets: [
        'Bitcoin/Litecoin (BIP-21): Standard cryptocurrency payment URIs with wallet address, optional amount, and label. Compatible with all major Bitcoin and Litecoin wallets.',
        'Lightning Network (BOLT11): Lightning Network payment invoices. Paste a BOLT11 encoded invoice string for instant Bitcoin payments with minimal fees.',
        'Ethereum (EIP-681): Ethereum transaction request URIs supporting native ETH transfers and ERC-20 token transfers. Includes chain ID for multi-network support (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), gas parameters, and contract function calls.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Payment Link Services',
      bullets: [
        'PayPal.Me: PayPal payment links with username and optional pre-filled amount. Recipients can pay via PayPal balance, cards, or bank accounts.',
        'Cash App: Cash App payment links using $cashtag with optional amount. Popular in the United States for peer-to-peer payments.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Generic EMV QR',
      bullets: [
        'EMV Generic: Create custom EMV Merchant-Presented Mode QR codes for payment schemes not specifically listed. Configure merchant name, city, country code (ISO 3166-1), currency code (ISO 4217 numeric), MCC, tip/convenience fee options, and additional data fields. Useful for testing or custom integrations.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Overlay Blend Modes (Professional)',
      paragraphs: ['Additional blend modes in Professional level:'],
      bullets: [
        'Pixelate: Pixelated overlay effect.',
        'Outline: Edge detection overlay showing only contours.',
        'Wave: Wavy distortion effect.',
        'Subpixel Size: Variable subpixel sizing based on image.',
        'True Dither: Advanced dithering with ordered matrix selection.',
        'Extreme: Maximum image visibility, may affect scannability.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Protection Settings',
      paragraphs: [
        'Fine-grained control over which QR elements are protected from overlay modification:',
      ],
      bullets: [
        'Preserve Timing: Keep timing patterns unmodified.',
        'Preserve Alignment: Keep alignment patterns unmodified.',
        'Protect Format Info: Shield format information modules.',
        'Protect Version Info: Shield version information modules.',
      ],
    },
    {
      heading: 'ECC-Aware Mode',
      paragraphs: [
        'Intelligently distributes overlay intensity based on error correction capacity. The system analyzes which modules can be modified while maintaining scannability.',
      ],
      bullets: [
        'Risk Budget: Percentage of error correction capacity to use (0-100%).',
        'Higher budget = more visible overlay but riskier scannability.',
        'Lower budget = safer scanning but less visible overlay.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Professional Rendering Options',
      paragraphs: ['Advanced rendering controls:'],
      bullets: [
        'Crisp Edges: Use pixelated image rendering for sharp module edges.',
        'Pixel Snap: Floor, Round, or Ceil pixel alignment.',
        'Per-Module Color Mode: Solid, By Brightness, By Position, By Overlay, By Cluster.',
        'Color Palette: Define custom color palette for per-module coloring.',
        'Contrast Guard: Ensure minimum contrast ratio between colors.',
        'Min Contrast Ratio: WCAG-style contrast requirement (1:1 to 21:1).',
        'Extra Border Modules: Additional border beyond quiet zone.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Professional Output Options',
      paragraphs: ['Enterprise export settings:'],
      bullets: [
        'DPI: Set print resolution (72-600 DPI). 300 DPI recommended for print.',
        'Include Quiet Zone: Toggle quiet zone in output dimensions.',
        'Export As Additional: Generate PDF alongside primary format.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Animation Settings (Professional)',
      paragraphs: ['Additional professional animation features:'],
      bullets: [
        'Temporal Dither: Off, Blue Noise, or Flicker Safe per-frame dithering.',
        'Pattern: None, Pulse, Wave, Scanline, Shimmer, or Drift effects.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'See related guides and examples',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API Reference',
      paragraphs: [
        'ANQR provides a server-side API for generating QR codes via URL parameters. This is ideal for embedding QR codes in websites, emails, documents, or automated workflows without client-side JavaScript.',
        'Base URL: https://anqr.link/api/qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'View QR examples', type: 'example' }],
    },
    {
      heading: 'Basic Parameters',
      paragraphs: ['Required and common parameters (parameter names are not translated):'],
      bullets: [
        'data (required): The content to encode in the QR code. URL-encode special characters.',
        'size: Image size in pixels (default: 400, max: 2000). Used if w/h not specified.',
        'w, h: Output width and height in pixels. Overrides size parameter.',
        'format: Output format - png, webp, or gif (default: png).',
        'ec: Error correction level - L, M, Q, or H (default: H).',
        'fg: Foreground color as hex without # (default: 000000).',
        'bg: Background color as hex without # (default: ffffff).',
        'transparent: Set to 1 for transparent background.',
        'margin: Quiet zone in modules (default: 4).',
      ],
    },
    {
      heading: 'Styling Parameters',
      paragraphs: ['Module and pattern styling:'],
      bullets: [
        'style: Module style - square, rounded, dots, diamond, connected.',
        'finder: Finder pattern style - square, rounded, circle.',
        'align: Alignment pattern style - match_finder, square, rounded, circle.',
        'timing: Timing pattern style - match_module, solid, dashed.',
        'radius: Corner radius percentage 0-100.',
        'gap: Module gap percentage 0-50.',
        'gapMode: Gap mode - none, inset, stroke, negative_space.',
        'eyeOuter, eyeInner: Eye styles - square, rounded, circle.',
        'eyeScale: Eye scale percentage (default: 100).',
        'grad: Gradient type - none, linear, radial, conic.',
        'gradAngle: Gradient angle for linear gradients.',
        'gradStops: Gradient stops as color1,pos1,color2,pos2,... (e.g., ff0000,0,0000ff,1).',
      ],
    },
    {
      heading: 'Overlay Parameters',
      paragraphs: ['Image overlay options (overlay image is fetched server-side):'],
      bullets: [
        'img: URL to overlay image (must be publicly accessible).',
        'mode: Overlay mode - center, halftone, blend, brightness, mosaic, dithered, blue-noise, subpixel.',
        'intensity: Overlay intensity 0-100 (default: 100).',
        'colorMode: Overlay color mode - color, grayscale, bw.',
        'fit: How overlay fits - cover, contain, stretch.',
        'rot: Overlay rotation in degrees.',
        'flipX, flipY: Set to 1 to flip overlay.',
        'keepFinders: Preserve finder patterns (default: 1).',
        'keepTiming, keepAlign: Set to 1 to preserve timing/alignment patterns.',
      ],
    },
    {
      heading: 'Preprocessing Parameters',
      paragraphs: ['Image preprocessing applied to overlay:'],
      bullets: [
        'brightness: Adjustment -100 to 100 (default: 0).',
        'contrast: Adjustment -100 to 100 (default: 0).',
        'gamma: Value 0.1 to 3 (default: 1).',
        'saturation: Adjustment -100 to 100 (default: 0).',
        'hue: Hue rotation in degrees.',
        'blur: Blur in pixels.',
        'sharpen: Sharpen amount 0-100.',
        'posterize: Posterize levels.',
        'threshold: Binary threshold 0-255.',
        'edge: Edge detection - off, sobel, canny.',
        'invert: Set to 1 to invert colors.',
      ],
    },
    {
      heading: 'Watermark Parameters',
      paragraphs: ['Add watermarks to generated QR codes:'],
      bullets: [
        'wmEn: Set to 1 to enable watermark.',
        'wmKind: Watermark type - text, image, pattern.',
        'wmText: Watermark text (URL-encoded).',
        'wmImg: URL to watermark image.',
        'wmPos: Position - center, corners, edges, behind, quiet_zone.',
        'wmOpacity: Opacity 0-100 (default: 50).',
        'wmBlend: Blend mode - normal, multiply, screen, overlay.',
      ],
    },
    {
      heading: 'Animation Parameters',
      paragraphs: ['For animated GIF output (requires format=gif):'],
      bullets: [
        'animPattern: Animation pattern - none, pulse, wave, scanline, shimmer, drift, color_cycle.',
        'animFrames: Number of frames 1-60 (default: 24).',
        'animSpeed: Frame delay in milliseconds 10-1000 (default: 100).',
        'animSeed: Random seed for animation.',
        'easing: Animation easing - linear, ease_in, ease_out, ease_in_out, bounce.',
      ],
    },
    {
      heading: 'Output Parameters',
      paragraphs: ['Output format options:'],
      bullets: [
        'quality: WebP quality 0-1 (default: 0.9).',
        'webpQ: WebP quality 0-100 (default: 90).',
        'gifColors: GIF palette size 2-256 (default: 256).',
        'dpi: Output DPI for PNG (default: 72).',
        'metaTitle, metaAuthor, metaCopy, metaDesc: PNG metadata fields.',
      ],
    },
    // Crop Parameters
    {
      heading: 'Crop Parameters',
      paragraphs: ['Overlay image cropping options:'],
      bullets: [
        'cropEn: Enable overlay cropping 0/1 (default: 0).',
        'cropX: Crop center X as fraction 0-1 (default: 0.5).',
        'cropY: Crop center Y as fraction 0-1 (default: 0.5).',
        'cropSize: Crop size as fraction of image 0-1 (default: 1).',
      ],
    },
    // Safety Lock Parameters
    {
      heading: 'Safety Lock Parameters',
      paragraphs: ['Control which QR elements are protected from overlay modification:'],
      bullets: [
        'lockF: Lock finder patterns 0/1 (default: 1).',
        'lockT: Lock timing patterns 0/1 (default: 1).',
        'lockA: Lock alignment patterns 0/1 (default: 1).',
        'lockFmt: Lock format info 0/1 (default: 1).',
        'lockV: Lock version info 0/1 (default: 1).',
        'safeMode: Safety mode - off, balanced, strict (default: off).',
        'safeMinPx: Minimum module size in pixels (default: 2).',
        'safeMinQz: Minimum quiet zone modules (default: 4).',
      ],
    },
    // Auto-tuning Parameters
    {
      heading: 'Auto-tuning Parameters',
      paragraphs: ['Automatic optimization settings:'],
      bullets: [
        'autoVer: Auto-pick QR version 0/1 (default: 1).',
        'autoEcc: Auto-pick ECC level 0/1 (default: 0) - server-side hint only.',
        'autoReduce: [CLIENT-ONLY] Auto-reduce intensity until scannable - requires scan validation loop.',
      ],
    },
    // Additional Animation Parameters
    {
      heading: 'Additional Animation Parameters',
      paragraphs: ['Extended animation controls for GIF output:'],
      bullets: [
        'loop: Animation loops continuously 0/1 (default: 1).',
        'bounce: Ping-pong animation direction 0/1 (default: 0).',
        'reverse: Play animation in reverse 0/1 (default: 0).',
        'colorCycle: Enable color cycling effect 0/1 (default: 0).',
        'interp: Frame interpolation - none, crossfade, morph (default: none).',
        'tempDither: Temporal dithering - off, blue_noise, flicker_safe (default: off).',
        'startF: Animation start frame (default: 0).',
        'maxF: Maximum frames to render (default: 0 = auto).',
        'stepF: Frame step interval (default: 1).',
        'jitter: [CLIENT-ONLY] Module jitter in pixels - requires per-frame QR regeneration.',
      ],
    },
    // Dithering Parameters
    {
      heading: 'Dithering Parameters',
      paragraphs: ['Control dithering algorithms for overlay processing:'],
      bullets: [
        'ditherKind: Dither algorithm - error_diffusion, ordered_bayer, blue_noise, etc (default: ordered_bayer).',
        'diffusionKernel: Error diffusion kernel - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (default: floyd_steinberg).',
        'ditherStrength: Dither intensity 0-100 (default: 50).',
        'serpentine: Serpentine dithering 0/1 (default: 0).',
        'matrix: Ordered dither matrix - bayer2, bayer4, bayer8 (default: bayer4).',
        'bnTile: Blue noise tile size (default: 64).',
        'bnSeed: Blue noise random seed (default: 0).',
        'colorDither: Color dithering - none, per_channel, perceptual (default: none).',
      ],
    },
    // Subpixel Parameters
    {
      heading: 'Subpixel Parameters',
      paragraphs: ['Settings for subpixel blend mode:'],
      bullets: [
        'spGrid: Subpixel grid size - 2x2, 3x3, 4x4 (default: 3x3).',
        'spCenter: Center rule - strict, halftone_center (default: strict).',
        'spNeutral: Neutral color hex without # (default: 808080).',
        'spFinder: Finder override - solid, stylized (default: solid).',
      ],
    },
    // Halftone Parameters
    {
      heading: 'Halftone Parameters',
      paragraphs: ['Settings for halftone blend mode:'],
      bullets: [
        'htCell: Halftone cell size - per_module or nxn grid (default: per_module).',
        'htDot: Dot shape - circle, square, line (default: circle).',
        'htCurve: Brightness curve - linear, s-curve, gamma (default: linear).',
        'duo1: Duotone shadow color hex without # (default: 000000).',
        'duo2: Duotone highlight color hex without # (default: ffffff).',
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'ECC-Aware Mode Parameters',
      paragraphs: ['Intelligent overlay distribution based on error correction capacity:'],
      bullets: [
        'eccAware: Enable ECC-aware mode 0/1 (default: 0).',
        'eccRisk: Risk budget percentage 0-100 (default: 50).',
        'eccMap: Weight map - distance_to_finders, block_heatmap, empirical_scan_heatmap (default: distance_to_finders).',
      ],
    },
    // Frame Parameters
    {
      heading: 'Frame Parameters',
      paragraphs: ['Decorative frame settings:'],
      bullets: [
        'frame: Frame style - none, rounded_frame, sticker, tag (default: none).',
        'frameText: Text to display in frame (URL encoded).',
      ],
    },
    // Per-Module Color Parameters
    {
      heading: 'Per-Module Color Parameters',
      paragraphs: ['Individual module coloring options:'],
      bullets: [
        'modColor: Color mode - solid, by_brightness, by_position, by_overlay, by_cluster (default: solid).',
        'cGuard: Contrast guard 0/1 (default: 0).',
        'minContrast: Minimum contrast ratio 1-21 (default: 4.5).',
        'palette: Comma-separated hex colors for palette mode.',
        'paletteMode: Palette distribution - position, brightness, diagonal, radial, random, row, column (default: position).',
      ],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF Overlay Parameters',
      paragraphs: ['Settings for animated GIF overlay images:'],
      bullets: [
        'ovType: Overlay type - static, gif, apng, webp_anim, video (default: static).',
        'ovFramePick: Frame selection - all, every_n, max_frames, duration_limit (default: all).',
        'gifDelays: Use original GIF frame delays 0/1 (default: 1).',
        'gifDispH: GIF disposal handling - respect, simplify (default: respect).',
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Per-ECC Intensity Limits',
      paragraphs: ['Maximum overlay intensity per error correction level:'],
      bullets: [
        'maxIntL: Max intensity for ECC L 0-100 (default: 100).',
        'maxIntM: Max intensity for ECC M 0-100 (default: 100).',
        'maxIntQ: Max intensity for ECC Q 0-100 (default: 100).',
        'maxIntH: Max intensity for ECC H 0-100 (default: 100).',
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'QA Simulation Parameters (Client-Only)',
      paragraphs: [
        'These parameters are parsed for URL compatibility but only work in the browser:',
      ],
      bullets: [
        'qaContrast: Enable contrast check 0/1 - requires interactive validation.',
        'qaBlur: Simulate blur in pixels - for interactive testing only.',
        'qaNoise: Simulate noise level - for interactive testing only.',
        'qaHeatmap: Show readability heatmap 0/1 - requires canvas overlay UI.',
      ],
    },
    // Client-Only Parameters
    {
      heading: 'Client-Only Parameters',
      paragraphs: [
        'Most API parameters are fully supported server-side. Parameters marked [CLIENT-ONLY] are parsed for URL compatibility but require browser features:',
      ],
      bullets: [
        'jitter: Module jitter requires per-frame QR regeneration with randomness.',
        'autoReduce: Auto-reduce intensity requires iterative scan testing.',
        'qaContrast, qaBlur, qaNoise, qaHeatmap: QA simulation requires interactive canvas validation.',
      ],
    },
    // Additional Output Parameters
    {
      heading: 'Additional Output Parameters',
      paragraphs: ['Extended output and export settings:'],
      bullets: [
        'fname: Custom filename for downloads (default: anqr-qrcode).',
        'inclQz: Include quiet zone in output dimensions 0/1 (default: 1).',
        'bgOver: Background color override hex without # (overrides bg parameter).',
        'fmtExtra: Additional format output - none, eps, animated_webp (default: none). Note: eps is [PARTIAL].',
        'svgPrec: SVG shape precision - pixel, precise (default: pixel). [PARTIAL] SVG output limited server-side.',
        'svgEmbed: Embed raster overlay in SVG 0/1 (default: 1). [PARTIAL] SVG output limited server-side.',
        'modulePx: Module pixel size (default: auto-calculated from size).',
        'border: Extra border modules beyond quiet zone (default: 0).',
        'crisp: Enable crisp/pixelated image rendering 0/1 (default: 1).',
        'snap: Pixel snap mode - floor, round, ceil (default: floor).',
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Pattern Preservation Parameters',
      paragraphs: ['Control which structural elements are protected from overlay:'],
      bullets: [
        'keepFinders: Preserve finder patterns 0/1 (default: 1).',
        'keepTiming: Preserve timing patterns 0/1 (default: 0).',
        'keepAlign: Preserve alignment patterns 0/1 (default: 0).',
        'protectFmt: Protect format info modules 0/1 (default: 0).',
        'protectVer: Protect version info modules 0/1 (default: 0).',
      ],
    },
    {
      heading: 'Example Usage',
      paragraphs: [
        'Basic QR code:',
        'https://anqr.link/api/qr?data=https://example.com',
        'Styled QR code with custom colors:',
        'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30',
        'QR code with overlay image:',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70',
        'Animated GIF:',
        'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'View QR examples', type: 'example' }],
    },
    {
      heading: 'Embedding QR Codes',
      paragraphs: [
        'In Professional mode, the Share feature generates embeddable HTML and URLs. Here is how embedding works:',
      ],
      bullets: [
        'Share Link: Creates a URL to the ANQR app with all your settings encoded as URL parameters. Recipients can view and modify the QR code.',
        'Embed Image: Generates an <img> tag pointing to the server API. The QR code is rendered server-side and served as an image.',
        'Embed Markdown: Creates Markdown image syntax for documentation and README files.',
        'Direct API URL: The raw API URL for use in applications, scripts, or other integrations.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'HTML Example',
      paragraphs: [
        'To embed a QR code in your website:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR Code" />',
        'For responsive sizing:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR Code" style="max-width: 100%; height: auto;" />',
        'The server caches responses with long cache headers, so repeated requests for the same URL are fast.',
      ],
    },
    {
      heading: 'Share URL Format',
      paragraphs: [
        'When you click Share in Professional mode, ANQR encodes your current settings into URL parameters. The format is:',
        'https://anqr.link/?data=...&ec=H&style=rounded&....',
        'These parameters mirror the API parameters, so you can convert a share URL to an API URL by changing the base path from / to /api/qr and adjusting w/h parameters as needed.',
        'Note: Overlay images uploaded from local files cannot be shared via URL - only URL-based overlays (img parameter) work in shared links and API calls.',
      ],
    },
    {
      heading: 'Rate Limits and Usage',
      paragraphs: [
        'The API is free to use for reasonable volumes. For high-volume usage or commercial applications requiring guaranteed uptime, please contact us.',
        'API responses include aggressive caching headers. For best performance, cache responses on your end or use the same URL consistently for identical QR codes.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Best Practices',
      paragraphs: ['Follow these guidelines for reliable QR codes:'],
      bullets: [
        'Always test your QR codes with multiple scanner apps before printing.',
        'Use Error Correction H (High) when adding overlays.',
        'Keep at least 4 modules of quiet zone (margin).',
        'Ensure high contrast between foreground and background.',
        'For print, use at least 300 DPI and test at actual print size.',
        'Enable Preserve Finder Patterns when using overlays.',
        'Start with lower overlay intensity and increase gradually.',
        'For outdoor use, consider larger module sizes and higher error correction.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Browse Learn articles', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'View QR examples', type: 'example' },
      ],
    },
    {
      heading: 'Troubleshooting',
      paragraphs: ['Common issues and solutions:'],
      bullets: [
        "QR won't scan: Reduce overlay intensity, increase error correction, check contrast.",
        'Code too large: Reduce content length, use URL shortener, lower version.',
        'Blurry output: Increase module size, use PNG instead of compressed formats.',
        'Colors look wrong: Check color contrast, try grayscale overlay mode.',
        'GIF not animating: Ensure using GIF format output, check frame count.',
        'Image overlay not loading: Check CORS permissions on remote images.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'See related guides and examples',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Keyboard Shortcuts',
      paragraphs: [
        'ANQR supports standard keyboard shortcuts. Use Ctrl/Cmd+S to trigger export (when focused on the preview).',
      ],
    },
    {
      heading: 'Sharing & Embedding',
      paragraphs: [
        'In Professional mode, click the Share button to copy a URL with your current settings. Recipients can open this URL to see your exact configuration. Note: Overlay images from local files cannot be shared via URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Try this configuration directly in the ANQR generator.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Browse Learn articles', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'View QR examples', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'View QR examples', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Open the generator', type: 'generator' },
  ],
};

export default guide;
