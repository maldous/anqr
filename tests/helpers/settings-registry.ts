/**
 * Comprehensive Settings Registry
 * Maps ALL UI controls across all sections and tiers
 *
 * Each setting defines:
 * - section: Which accordion section it belongs to
 * - tier: Which tier level exposes this setting (basic/advanced/professional)
 * - type: The control type (switch, slider, select, input, textarea, color)
 * - selector: CSS selector to find the control
 * - label: Human-readable label (for finding by text)
 * - expectsQRChange: Whether changing this setting should change the QR output
 * - testValues: Values to test with
 * - conditional: Optional condition for when this setting is visible
 */

export type SettingType = 'switch' | 'slider' | 'select' | 'input' | 'textarea' | 'color' | 'file';
export type Tier = 'basic' | 'advanced' | 'professional';

export interface SettingDefinition {
  section: string;
  tier: Tier;
  type: SettingType;
  label: string;
  expectsQRChange: boolean;
  testValues?: string[] | number[] | boolean[];
  conditional?: string; // Description of when this is visible
  notes?: string; // Why QR may or may not change
}

export interface SettingsRegistry {
  [key: string]: SettingDefinition;
}

/**
 * COMPLETE settings registry covering ALL UI controls
 */
export const SETTINGS_REGISTRY: SettingsRegistry = {
  // ==========================================
  // PAYLOAD SECTION (Basic tier)
  // ==========================================
  'payload.kind': {
    section: 'Payload',
    tier: 'basic',
    type: 'select',
    label: 'Content Type',
    expectsQRChange: false, // Changing type alone doesn't change QR if data is same
    testValues: ['url', 'plain_text', 'wifi', 'email', 'sms', 'geo', 'tel'],
    notes: 'Content type change alone may not change QR - depends on actual data',
  },
  'payload.text': {
    section: 'Payload',
    tier: 'basic',
    type: 'textarea',
    label: 'Plain Text',
    expectsQRChange: true,
    testValues: ['Hello World', 'Test QR Code', 'ANQR Testing'],
    conditional: 'payload.kind === plain_text',
  },
  'payload.url.href': {
    section: 'Payload',
    tier: 'basic',
    type: 'input',
    label: 'URL',
    expectsQRChange: true,
    testValues: ['https://example.com', 'https://test.org', 'https://anqr.link'],
    conditional: 'payload.kind === url',
  },
  'payload.wifi.ssid': {
    section: 'Payload',
    tier: 'basic',
    type: 'input',
    label: 'Network Name',
    expectsQRChange: true,
    conditional: 'payload.kind === wifi',
  },
  'payload.wifi.password': {
    section: 'Payload',
    tier: 'basic',
    type: 'input',
    label: 'Password',
    expectsQRChange: true,
    conditional: 'payload.kind === wifi',
  },
  'payload.wifi.auth': {
    section: 'Payload',
    tier: 'basic',
    type: 'select',
    label: 'Security',
    expectsQRChange: true,
    testValues: ['WPA', 'WPA2', 'WPA3', 'WEP', 'nopass'],
    conditional: 'payload.kind === wifi',
  },
  'payload.wifi.hidden': {
    section: 'Payload',
    tier: 'basic',
    type: 'switch',
    label: 'Hidden Network',
    expectsQRChange: true,
    conditional: 'payload.kind === wifi',
  },
  'payload.email.to': {
    section: 'Payload',
    tier: 'basic',
    type: 'input',
    label: 'To',
    expectsQRChange: true,
    conditional: 'payload.kind === email',
  },
  'payload.email.subject': {
    section: 'Payload',
    tier: 'basic',
    type: 'input',
    label: 'Subject',
    expectsQRChange: true,
    conditional: 'payload.kind === email',
  },
  'payload.email.body': {
    section: 'Payload',
    tier: 'basic',
    type: 'textarea',
    label: 'Body',
    expectsQRChange: true,
    conditional: 'payload.kind === email',
  },
  'payload.sms.number': {
    section: 'Payload',
    tier: 'basic',
    type: 'input',
    label: 'Phone Number',
    expectsQRChange: true,
    conditional: 'payload.kind === sms',
  },
  'payload.sms.body': {
    section: 'Payload',
    tier: 'basic',
    type: 'textarea',
    label: 'Message',
    expectsQRChange: true,
    conditional: 'payload.kind === sms',
  },
  'payload.tel.number': {
    section: 'Payload',
    tier: 'basic',
    type: 'input',
    label: 'Phone Number',
    expectsQRChange: true,
    conditional: 'payload.kind === tel',
  },
  'payload.geo.lat': {
    section: 'Payload',
    tier: 'basic',
    type: 'input',
    label: 'Latitude',
    expectsQRChange: true,
    conditional: 'payload.kind === geo',
  },
  'payload.geo.lon': {
    section: 'Payload',
    tier: 'basic',
    type: 'input',
    label: 'Longitude',
    expectsQRChange: true,
    conditional: 'payload.kind === geo',
  },

  // ==========================================
  // OVERLAY SECTION (Basic tier basics)
  // ==========================================
  'overlay.enabled': {
    section: 'Overlay',
    tier: 'basic',
    type: 'switch',
    label: 'Enable Overlay',
    expectsQRChange: true,
    notes: 'Requires image to be loaded first',
  },
  'overlay.mode': {
    section: 'Overlay',
    tier: 'basic',
    type: 'select',
    label: 'Mode',
    expectsQRChange: true,
    testValues: [
      'center',
      'blend',
      'halftone',
      'mosaic',
      'gapfill',
      'brightness',
      'duotone',
      'subpixel',
      'dithered',
      'blue-noise',
    ],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.intensity': {
    section: 'Overlay',
    tier: 'basic',
    type: 'slider',
    label: 'Intensity',
    expectsQRChange: true,
    testValues: [25, 50, 75, 100],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.colorMode': {
    section: 'Overlay',
    tier: 'basic',
    type: 'select',
    label: 'Color Mode',
    expectsQRChange: true,
    testValues: ['color', 'grayscale', 'bw'],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.preserveFinders': {
    section: 'Overlay',
    tier: 'basic',
    type: 'switch',
    label: 'Preserve Finders',
    expectsQRChange: true,
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.fit': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'select',
    label: 'Fit Mode',
    expectsQRChange: true,
    testValues: ['cover', 'contain', 'stretch'],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.rotateDeg': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'slider',
    label: 'Rotation',
    expectsQRChange: true,
    testValues: [0, 45, 90, 180],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.flipX': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'switch',
    label: 'Flip Horizontal',
    expectsQRChange: true,
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.flipY': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'switch',
    label: 'Flip Vertical',
    expectsQRChange: true,
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.preserveTiming': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'switch',
    label: 'Preserve Timing',
    expectsQRChange: true,
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.preserveAlignment': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'switch',
    label: 'Preserve Alignment',
    expectsQRChange: true,
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.protectFormatInfo': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'switch',
    label: 'Protect Format Info',
    expectsQRChange: true,
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.protectVersionInfo': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'switch',
    label: 'Protect Version Info',
    expectsQRChange: true,
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.brightness': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'slider',
    label: 'Brightness',
    expectsQRChange: true,
    testValues: [-50, 0, 50],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.contrast': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'slider',
    label: 'Contrast',
    expectsQRChange: true,
    testValues: [-50, 0, 50],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.gamma': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'slider',
    label: 'Gamma',
    expectsQRChange: true,
    testValues: [0.5, 1.0, 2.0],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.saturation': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'slider',
    label: 'Saturation',
    expectsQRChange: true,
    testValues: [-100, 0, 100],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.hueRotateDeg': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'slider',
    label: 'Hue Rotation',
    expectsQRChange: true,
    testValues: [0, 90, 180],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.blurPx': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'slider',
    label: 'Blur',
    expectsQRChange: true,
    testValues: [0, 2, 5],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.sharpen': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'slider',
    label: 'Sharpen',
    expectsQRChange: true,
    testValues: [0, 50, 100],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.posterizeLevels': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'slider',
    label: 'Posterize',
    expectsQRChange: true,
    testValues: [0, 4, 8],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.threshold': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'slider',
    label: 'Threshold',
    expectsQRChange: true,
    testValues: [64, 128, 192],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.edgeDetect': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'select',
    label: 'Edge Detection',
    expectsQRChange: true,
    testValues: ['off', 'sobel', 'canny'],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.invert': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'switch',
    label: 'Invert Colors',
    expectsQRChange: true,
    conditional: 'overlay.enabled && image loaded',
  },
  // Dithering options
  'overlay.ditherKind': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'select',
    label: 'Dither Algorithm',
    expectsQRChange: true,
    testValues: ['error_diffusion', 'ordered_bayer', 'blue_noise', 'white_noise'],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.diffusionKernel': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'select',
    label: 'Diffusion Kernel',
    expectsQRChange: true,
    testValues: [
      'floyd_steinberg',
      'jarvis_judice_ninke',
      'stucki',
      'atkinson',
      'burkes',
      'sierra',
    ],
    conditional: 'overlay.enabled && ditherKind === error_diffusion',
  },
  'overlay.ditherStrength': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'slider',
    label: 'Dither Strength',
    expectsQRChange: true,
    testValues: [25, 50, 75, 100],
    conditional: 'overlay.enabled && image loaded',
  },
  'overlay.ditherSerpentine': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'switch',
    label: 'Serpentine Scanning',
    expectsQRChange: true,
    conditional: 'overlay.enabled && ditherKind === error_diffusion',
  },
  'overlay.orderedMatrix': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'select',
    label: 'Ordered Matrix',
    expectsQRChange: true,
    testValues: ['bayer2', 'bayer4', 'bayer8'],
    conditional: 'overlay.enabled && ditherKind === ordered',
  },
  'overlay.blueNoiseTileSize': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'slider',
    label: 'Blue Noise Tile Size',
    expectsQRChange: true,
    testValues: [32, 64, 128],
    conditional: 'overlay.enabled && ditherKind === blue_noise',
  },
  'overlay.blueNoiseSeed': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'input',
    label: 'Blue Noise Seed',
    expectsQRChange: true,
    conditional: 'overlay.enabled && ditherKind === blue_noise',
  },
  'overlay.colorDither': {
    section: 'Overlay',
    tier: 'advanced',
    type: 'select',
    label: 'Color Dither',
    expectsQRChange: true,
    testValues: ['none', 'per_channel', 'perceptual'],
    conditional: 'overlay.enabled && image loaded',
  },
  // Subpixel options
  'overlay.subpixelGridSize': {
    section: 'Overlay',
    tier: 'professional',
    type: 'select',
    label: 'Subpixel Grid',
    expectsQRChange: true,
    testValues: ['2x2', '3x3', '4x4'],
    conditional: 'overlay.enabled && mode === subpixel',
  },
  'overlay.subpixelCenterRule': {
    section: 'Overlay',
    tier: 'professional',
    type: 'select',
    label: 'Center Rule',
    expectsQRChange: true,
    testValues: ['strict', 'halftone_center'],
    conditional: 'overlay.enabled && mode === subpixel',
  },
  'overlay.subpixelNeutralColor': {
    section: 'Overlay',
    tier: 'professional',
    type: 'color',
    label: 'Neutral Color',
    expectsQRChange: true,
    conditional: 'overlay.enabled && mode === subpixel',
  },
  'overlay.subpixelFinderOverride': {
    section: 'Overlay',
    tier: 'professional',
    type: 'select',
    label: 'Finder Override',
    expectsQRChange: true,
    testValues: ['solid', 'stylized'],
    conditional: 'overlay.enabled && mode === subpixel',
  },
  // Halftone options
  'overlay.halftoneCell': {
    section: 'Overlay',
    tier: 'professional',
    type: 'select',
    label: 'Cell Mode',
    expectsQRChange: true,
    testValues: ['per_module', 'n×n'],
    conditional: 'overlay.enabled && mode === halftone',
  },
  'overlay.halftoneDotShape': {
    section: 'Overlay',
    tier: 'professional',
    type: 'select',
    label: 'Dot Shape',
    expectsQRChange: true,
    testValues: ['circle', 'square', 'line'],
    conditional: 'overlay.enabled && mode === halftone',
  },
  'overlay.brightnessCurve': {
    section: 'Overlay',
    tier: 'professional',
    type: 'select',
    label: 'Brightness Curve',
    expectsQRChange: true,
    testValues: ['linear', 's-curve', 'gamma'],
    conditional: 'overlay.enabled && mode === halftone',
  },
  // Duotone options - store uses duotoneColors: [string, string] array
  // Individual color controls are handled via UI that sets array elements

  // ==========================================
  // QR ENCODING SECTION (Advanced tier)
  // ==========================================
  'qr.version': {
    section: 'QR Encoding',
    tier: 'advanced',
    type: 'slider',
    label: 'Version',
    expectsQRChange: true,
    testValues: [0, 1, 5, 10], // 0 = auto
    notes: 'Higher version = more data capacity, larger QR',
  },
  'qr.ecc': {
    section: 'QR Encoding',
    tier: 'advanced',
    type: 'select',
    label: 'Error Correction',
    expectsQRChange: true,
    testValues: ['L', 'M', 'Q', 'H'],
    notes: 'Higher ECC = more redundancy',
  },
  'qr.encodingMode': {
    section: 'QR Encoding',
    tier: 'advanced',
    type: 'select',
    label: 'Encoding Mode',
    expectsQRChange: true,
    testValues: ['auto', 'numeric', 'alphanumeric', 'byte', 'kanji'],
    notes: 'Auto usually picks optimal',
  },
  // Note: maskPattern is not exposed in UI - QR library auto-selects optimal mask
  'qr.quietZoneModules': {
    section: 'QR Encoding',
    tier: 'advanced',
    type: 'slider',
    label: 'Quiet Zone',
    expectsQRChange: true,
    testValues: [0, 2, 4, 6],
  },
  'qr.borderModulesExtra': {
    section: 'QR Encoding',
    tier: 'advanced',
    type: 'slider',
    label: 'Extra Border',
    expectsQRChange: true,
    testValues: [0, 1, 2, 4],
  },
  'qr.quietZoneMinEnforce': {
    section: 'QR Encoding',
    tier: 'advanced',
    type: 'switch',
    label: 'Enforce Min Quiet Zone',
    expectsQRChange: false,
    notes: 'Only affects validation warnings',
  },

  // ==========================================
  // RENDER SECTION (Advanced tier)
  // ==========================================
  'render.modulePx': {
    section: 'Render',
    tier: 'advanced',
    type: 'slider',
    label: 'Module Size',
    expectsQRChange: true,
    testValues: [10, 15, 20, 25],
  },
  'render.moduleStyle': {
    section: 'Render',
    tier: 'advanced',
    type: 'select',
    label: 'Module Style',
    expectsQRChange: true,
    testValues: ['square', 'rounded', 'dots', 'diamond', 'connected'],
  },
  'render.finderStyle': {
    section: 'Render',
    tier: 'advanced',
    type: 'select',
    label: 'Finder Style',
    expectsQRChange: true,
    testValues: ['square', 'rounded', 'circle'],
  },
  'render.alignmentStyle': {
    section: 'Render',
    tier: 'advanced',
    type: 'select',
    label: 'Alignment Style',
    expectsQRChange: true,
    testValues: ['match_finder', 'square', 'rounded', 'circle'],
  },
  'render.timingStyle': {
    section: 'Render',
    tier: 'advanced',
    type: 'select',
    label: 'Timing Style',
    expectsQRChange: true,
    testValues: ['match_module', 'solid', 'dashed'],
  },
  'render.eyeOuterStyle': {
    section: 'Render',
    tier: 'advanced',
    type: 'select',
    label: 'Eye Outer Style',
    expectsQRChange: true,
    testValues: ['square', 'rounded', 'circle'],
  },
  'render.eyeInnerStyle': {
    section: 'Render',
    tier: 'advanced',
    type: 'select',
    label: 'Eye Inner Style',
    expectsQRChange: true,
    testValues: ['square', 'rounded', 'circle'],
  },
  'render.eyeScale': {
    section: 'Render',
    tier: 'advanced',
    type: 'slider',
    label: 'Eye Scale',
    expectsQRChange: true,
    testValues: [80, 100, 120],
  },
  'render.moduleGapPercent': {
    section: 'Render',
    tier: 'advanced',
    type: 'slider',
    label: 'Module Gap',
    expectsQRChange: true,
    testValues: [0, 10, 20, 30],
  },
  'render.gapMode': {
    section: 'Render',
    tier: 'advanced',
    type: 'select',
    label: 'Gap Mode',
    expectsQRChange: true,
    testValues: ['none', 'inset', 'stroke', 'negative_space'],
  },
  'render.cornerRadius': {
    section: 'Render',
    tier: 'advanced',
    type: 'slider',
    label: 'Corner Radius',
    expectsQRChange: true,
    testValues: [0, 25, 50],
  },
  'render.dotRotationDeg': {
    section: 'Render',
    tier: 'advanced',
    type: 'slider',
    label: 'Dot Rotation',
    expectsQRChange: true,
    testValues: [0, 15, 45],
  },
  'render.fgColor': {
    section: 'Render',
    tier: 'advanced',
    type: 'color',
    label: 'Foreground Color',
    expectsQRChange: true,
    testValues: ['#000000', '#FF0000', '#0000FF'],
  },
  'render.bgColor': {
    section: 'Render',
    tier: 'advanced',
    type: 'color',
    label: 'Background Color',
    expectsQRChange: true,
    testValues: ['#FFFFFF', '#FFFF00', '#00FF00'],
  },
  'render.bgTransparent': {
    section: 'Render',
    tier: 'advanced',
    type: 'switch',
    label: 'Transparent Background',
    expectsQRChange: true,
  },
  'render.gradient.type': {
    section: 'Render',
    tier: 'advanced',
    type: 'select',
    label: 'Gradient Type',
    expectsQRChange: true,
    testValues: ['none', 'linear', 'radial', 'conic'],
  },
  // Note: gradient.angle is not a separate field - gradient config uses stops array
  'render.perModuleColorMode': {
    section: 'Render',
    tier: 'advanced',
    type: 'select',
    label: 'Per-Module Color',
    expectsQRChange: true,
    testValues: ['solid', 'by_brightness', 'by_position', 'by_overlay', 'by_cluster'],
  },
  'render.frameStyle': {
    section: 'Render',
    tier: 'advanced',
    type: 'select',
    label: 'Frame Style',
    expectsQRChange: true,
    testValues: ['none', 'rounded_frame', 'sticker', 'tag'],
  },
  'render.frameText': {
    section: 'Render',
    tier: 'advanced',
    type: 'input',
    label: 'Frame Text',
    expectsQRChange: true,
    conditional: 'frameStyle !== none',
  },
  'render.crispEdges': {
    section: 'Render',
    tier: 'advanced',
    type: 'switch',
    label: 'Crisp Edges',
    expectsQRChange: true,
    notes: 'Affects canvas rendering hint',
  },
  'render.pixelSnap': {
    section: 'Render',
    tier: 'advanced',
    type: 'select',
    label: 'Pixel Snap',
    expectsQRChange: true,
    testValues: ['floor', 'round', 'ceil', 'none'],
  },
  'render.contrastGuard': {
    section: 'Render',
    tier: 'advanced',
    type: 'switch',
    label: 'Contrast Guard',
    expectsQRChange: false,
    notes: 'Affects warnings only',
  },
  'render.minContrastRatio': {
    section: 'Render',
    tier: 'advanced',
    type: 'slider',
    label: 'Min Contrast Ratio',
    expectsQRChange: false,
    testValues: [3, 4.5, 7],
    conditional: 'contrastGuard enabled',
    notes: 'Affects warnings only',
  },

  // ==========================================
  // ANIMATION SECTION
  // ==========================================
  'animation.speedMs': {
    section: 'Animation',
    tier: 'basic',
    type: 'slider',
    label: 'Speed',
    expectsQRChange: false,
    testValues: [50, 100, 200],
    notes: 'Playback speed only, does not change static QR',
  },
  'animation.loop': {
    section: 'Animation',
    tier: 'basic',
    type: 'switch',
    label: 'Loop',
    expectsQRChange: false,
    notes: 'Playback setting only',
  },
  'animation.bounce': {
    section: 'Animation',
    tier: 'basic',
    type: 'switch',
    label: 'Bounce',
    expectsQRChange: false,
    notes: 'Playback setting only',
  },
  'animation.startFrame': {
    section: 'Animation',
    tier: 'advanced',
    type: 'slider',
    label: 'Start Frame',
    expectsQRChange: true,
    testValues: [0, 5, 10],
    conditional: 'animated source loaded',
  },
  'animation.maxFrames': {
    section: 'Animation',
    tier: 'advanced',
    type: 'slider',
    label: 'Max Frames',
    expectsQRChange: true,
    testValues: [0, 10, 50],
    conditional: 'animated source loaded',
  },
  'animation.frameStep': {
    section: 'Animation',
    tier: 'advanced',
    type: 'slider',
    label: 'Frame Step',
    expectsQRChange: true,
    testValues: [1, 2, 5],
    conditional: 'animated source loaded',
  },
  'animation.interpolate': {
    section: 'Animation',
    tier: 'advanced',
    type: 'select',
    label: 'Interpolation',
    expectsQRChange: true,
    testValues: ['none', 'crossfade', 'morph'],
    conditional: 'animated source loaded',
  },
  'animation.temporalDither': {
    section: 'Animation',
    tier: 'professional',
    type: 'select',
    label: 'Temporal Dither',
    expectsQRChange: true,
    testValues: ['off', 'blue_noise', 'flicker_safe'],
    conditional: 'animated source loaded',
  },
  'animation.pattern': {
    section: 'Animation',
    tier: 'professional',
    type: 'select',
    label: 'Animation Pattern',
    expectsQRChange: true,
    testValues: ['none', 'pulse', 'wave', 'scanline', 'shimmer', 'drift'],
  },
  'animation.moduleJitterPx': {
    section: 'Animation',
    tier: 'professional',
    type: 'slider',
    label: 'Module Jitter',
    expectsQRChange: true,
    testValues: [0, 1, 3],
  },
  'animation.colorCycle': {
    section: 'Animation',
    tier: 'professional',
    type: 'switch',
    label: 'Color Cycle',
    expectsQRChange: true,
  },
  'animation.seed': {
    section: 'Animation',
    tier: 'professional',
    type: 'input',
    label: 'Random Seed',
    expectsQRChange: true,
    notes: 'Changes random-based effects',
  },

  // ==========================================
  // OUTPUT SECTION
  // ==========================================
  'output.format': {
    section: 'Output',
    tier: 'basic',
    type: 'select',
    label: 'Format',
    expectsQRChange: false,
    testValues: ['png', 'webp', 'gif', 'svg'],
    notes: 'Export format only, does not affect preview',
  },
  'output.widthPx': {
    section: 'Output',
    tier: 'basic',
    type: 'input',
    label: 'Width',
    expectsQRChange: false,
    notes: 'Export dimension only',
  },
  'output.heightPx': {
    section: 'Output',
    tier: 'basic',
    type: 'input',
    label: 'Height',
    expectsQRChange: false,
    notes: 'Export dimension only',
  },
  'output.quality': {
    section: 'Output',
    tier: 'basic',
    type: 'slider',
    label: 'Quality',
    expectsQRChange: false,
    testValues: [0.5, 0.8, 1.0],
    conditional: 'format === webp',
    notes: 'Export quality only',
  },
  'output.filename': {
    section: 'Output',
    tier: 'advanced',
    type: 'input',
    label: 'Filename',
    expectsQRChange: false,
    notes: 'Export filename only',
  },
  'output.gifPaletteSize': {
    section: 'Output',
    tier: 'advanced',
    type: 'slider',
    label: 'GIF Palette Size',
    expectsQRChange: false,
    testValues: [16, 64, 256],
    conditional: 'format === gif',
    notes: 'Export setting only',
  },
  'output.gifQuantizer': {
    section: 'Output',
    tier: 'advanced',
    type: 'select',
    label: 'GIF Quantizer',
    expectsQRChange: false,
    testValues: ['median_cut', 'neuquant', 'octree'],
    conditional: 'format === gif',
    notes: 'Export setting only',
  },
  'output.gifDither': {
    section: 'Output',
    tier: 'advanced',
    type: 'select',
    label: 'GIF Dither',
    expectsQRChange: false,
    testValues: ['off', 'floyd', 'ordered'],
    conditional: 'format === gif',
    notes: 'Export setting only',
  },
  'output.svgTrueVector': {
    section: 'Output',
    tier: 'advanced',
    type: 'switch',
    label: 'True Vector SVG',
    expectsQRChange: false,
    conditional: 'format === svg',
    notes: 'Export setting only',
  },
  'output.svgShapePrecision': {
    section: 'Output',
    tier: 'advanced',
    type: 'select',
    label: 'SVG Shape Precision',
    expectsQRChange: false,
    testValues: ['pixel', 'precise'],
    conditional: 'format === svg && svgTrueVector',
    notes: 'Export setting only',
  },
  'output.svgEmbedRasterOverlay': {
    section: 'Output',
    tier: 'advanced',
    type: 'switch',
    label: 'Embed Raster Overlay',
    expectsQRChange: false,
    conditional: 'format === svg',
    notes: 'Export setting only',
  },
  'output.bgOverride': {
    section: 'Output',
    tier: 'advanced',
    type: 'color',
    label: 'Background Override',
    expectsQRChange: false,
    notes: 'Export setting only',
  },
  'output.gifTransparentColor': {
    section: 'Output',
    tier: 'advanced',
    type: 'color',
    label: 'GIF Transparent Color',
    expectsQRChange: false,
    conditional: 'format === gif',
    notes: 'Export setting only',
  },
  'output.dpi': {
    section: 'Output',
    tier: 'professional',
    type: 'slider',
    label: 'DPI',
    expectsQRChange: false,
    testValues: [72, 150, 300],
    notes: 'Export metadata only',
  },
  'output.includeQuietZone': {
    section: 'Output',
    tier: 'professional',
    type: 'switch',
    label: 'Include Quiet Zone',
    expectsQRChange: false,
    notes: 'Export setting only',
  },
  'output.formatExtra': {
    section: 'Output',
    tier: 'professional',
    type: 'select',
    label: 'Additional Format',
    expectsQRChange: false,
    testValues: ['none', 'eps', 'animated_webp'],
    notes: 'Export setting only',
  },

  // ==========================================
  // WATERMARK SECTION (Professional tier)
  // ==========================================
  'watermark.enabled': {
    section: 'Watermark',
    tier: 'professional',
    type: 'switch',
    label: 'Enable Watermark',
    expectsQRChange: true,
  },
  'watermark.kind': {
    section: 'Watermark',
    tier: 'professional',
    type: 'select',
    label: 'Watermark Type',
    expectsQRChange: true,
    testValues: ['text', 'image', 'pattern'],
    conditional: 'watermark.enabled',
  },
  'watermark.text': {
    section: 'Watermark',
    tier: 'professional',
    type: 'input',
    label: 'Watermark Text',
    expectsQRChange: true,
    conditional: 'watermark.enabled && kind === text',
  },
  'watermark.position': {
    section: 'Watermark',
    tier: 'professional',
    type: 'select',
    label: 'Position',
    expectsQRChange: true,
    testValues: ['center', 'corners', 'edges', 'behind', 'quiet_zone'],
    conditional: 'watermark.enabled',
  },
  'watermark.opacity': {
    section: 'Watermark',
    tier: 'professional',
    type: 'slider',
    label: 'Opacity',
    expectsQRChange: true,
    testValues: [25, 50, 75, 100],
    conditional: 'watermark.enabled',
  },
  'watermark.blend': {
    section: 'Watermark',
    tier: 'professional',
    type: 'select',
    label: 'Blend Mode',
    expectsQRChange: true,
    testValues: ['normal', 'multiply', 'screen', 'overlay'],
    conditional: 'watermark.enabled',
  },

  // ==========================================
  // SAFETY SECTION (Professional tier)
  // ==========================================
  'safety.mode': {
    section: 'Safety',
    tier: 'professional',
    type: 'select',
    label: 'Safety Mode',
    expectsQRChange: false,
    testValues: ['off', 'balanced', 'strict'],
    notes: 'May trigger auto-adjustments but not direct QR change',
  },
  'safety.minModulePx': {
    section: 'Safety',
    tier: 'professional',
    type: 'slider',
    label: 'Min Module Size',
    expectsQRChange: false,
    testValues: [1, 2, 4],
    conditional: 'safety.mode !== off',
    notes: 'Validation threshold only',
  },
  'safety.minQuietZoneModules': {
    section: 'Safety',
    tier: 'professional',
    type: 'slider',
    label: 'Min Quiet Zone',
    expectsQRChange: false,
    testValues: [2, 4, 6],
    conditional: 'safety.mode !== off',
    notes: 'Validation threshold only',
  },
  'safety.lockFinders': {
    section: 'Safety',
    tier: 'professional',
    type: 'switch',
    label: 'Lock Finders',
    expectsQRChange: true,
    conditional: 'safety.mode !== off',
    notes: 'Affects overlay behavior',
  },
  'safety.lockTiming': {
    section: 'Safety',
    tier: 'professional',
    type: 'switch',
    label: 'Lock Timing',
    expectsQRChange: true,
    conditional: 'safety.mode !== off',
    notes: 'Affects overlay behavior',
  },
  'safety.lockAlign': {
    section: 'Safety',
    tier: 'professional',
    type: 'switch',
    label: 'Lock Alignment',
    expectsQRChange: true,
    conditional: 'safety.mode !== off',
    notes: 'Affects overlay behavior',
  },
  'safety.lockFormat': {
    section: 'Safety',
    tier: 'professional',
    type: 'switch',
    label: 'Lock Format',
    expectsQRChange: true,
    conditional: 'safety.mode !== off',
    notes: 'Affects overlay behavior',
  },
  'safety.lockVersion': {
    section: 'Safety',
    tier: 'professional',
    type: 'switch',
    label: 'Lock Version',
    expectsQRChange: true,
    conditional: 'safety.mode !== off',
    notes: 'Affects overlay behavior',
  },
  // QA section
  'qa.contrastCheck': {
    section: 'Safety',
    tier: 'professional',
    type: 'switch',
    label: 'Contrast Check',
    expectsQRChange: false,
    notes: 'Diagnostic only',
  },
  'qa.showHeatmap': {
    section: 'Safety',
    tier: 'professional',
    type: 'switch',
    label: 'Show Heatmap',
    expectsQRChange: true,
    notes: 'Visual overlay for debugging',
  },
  'qa.simulateBlurPx': {
    section: 'Safety',
    tier: 'professional',
    type: 'slider',
    label: 'Simulate Blur',
    expectsQRChange: true,
    testValues: [0, 2, 5],
    notes: 'Preview simulation effect',
  },
  'qa.simulateNoise': {
    section: 'Safety',
    tier: 'professional',
    type: 'slider',
    label: 'Simulate Noise',
    expectsQRChange: true,
    testValues: [0, 10, 25],
    notes: 'Preview simulation effect',
  },
  'qa.simulateRotationDeg': {
    section: 'Safety',
    tier: 'professional',
    type: 'slider',
    label: 'Simulate Rotation',
    expectsQRChange: true,
    testValues: [0, 15, 30],
    notes: 'Preview simulation effect',
  },
  // Auto-tuning
  'auto.pickVersion': {
    section: 'Safety',
    tier: 'professional',
    type: 'switch',
    label: 'Auto Pick Version',
    expectsQRChange: true,
    notes: 'May change QR if version auto-adjusted',
  },
  'auto.pickEcc': {
    section: 'Safety',
    tier: 'professional',
    type: 'switch',
    label: 'Auto Pick ECC',
    expectsQRChange: true,
    notes: 'May change QR if ECC auto-adjusted',
  },
  'auto.reduceIntensityUntilSafe': {
    section: 'Safety',
    tier: 'professional',
    type: 'switch',
    label: 'Auto Reduce Intensity',
    expectsQRChange: true,
    notes: 'May reduce overlay intensity',
  },
  // ECC-Aware
  'overlay.eccAwareEnabled': {
    section: 'Safety',
    tier: 'professional',
    type: 'switch',
    label: 'ECC-Aware Mode',
    expectsQRChange: true,
    notes: 'Changes how overlay is applied',
  },
  'overlay.eccAwareRiskBudget': {
    section: 'Safety',
    tier: 'professional',
    type: 'slider',
    label: 'ECC Risk Budget',
    expectsQRChange: true,
    testValues: [25, 50, 75],
    conditional: 'overlay.eccAwareEnabled',
  },
  'overlay.eccAwareWeightMap': {
    section: 'Safety',
    tier: 'professional',
    type: 'select',
    label: 'ECC Weight Map',
    expectsQRChange: true,
    testValues: ['distance_to_finders', 'block_heatmap', 'empirical_scan_heatmap'],
    conditional: 'overlay.eccAwareEnabled',
  },

  // ==========================================
  // METADATA SECTION (Professional tier)
  // ==========================================
  'metadata.title': {
    section: 'Metadata',
    tier: 'professional',
    type: 'input',
    label: 'Title',
    expectsQRChange: false,
    notes: 'Export metadata only',
  },
  'metadata.author': {
    section: 'Metadata',
    tier: 'professional',
    type: 'input',
    label: 'Author',
    expectsQRChange: false,
    notes: 'Export metadata only',
  },
  'metadata.copyright': {
    section: 'Metadata',
    tier: 'professional',
    type: 'input',
    label: 'Copyright',
    expectsQRChange: false,
    notes: 'Export metadata only',
  },
  'metadata.license': {
    section: 'Metadata',
    tier: 'professional',
    type: 'input',
    label: 'License',
    expectsQRChange: false,
    notes: 'Export metadata only',
  },
  'metadata.description': {
    section: 'Metadata',
    tier: 'professional',
    type: 'textarea',
    label: 'Description',
    expectsQRChange: false,
    notes: 'Export metadata only',
  },
  'metadata.creationTime': {
    section: 'Metadata',
    tier: 'professional',
    type: 'switch',
    label: 'Include Creation Time',
    expectsQRChange: false,
    notes: 'Export metadata only',
  },

  // ==========================================
  // SHARE SECTION (Professional tier)
  // ==========================================
  'share.directLink': {
    section: 'Share',
    tier: 'professional',
    type: 'switch',
    label: 'Direct Link',
    expectsQRChange: false,
    notes: 'URL generation only',
  },
  'share.embedHtml': {
    section: 'Share',
    tier: 'professional',
    type: 'switch',
    label: 'Embed HTML',
    expectsQRChange: false,
    notes: 'URL generation only',
  },
  'share.encodeMoreParams': {
    section: 'Share',
    tier: 'professional',
    type: 'switch',
    label: 'Encode All Params',
    expectsQRChange: false,
    notes: 'URL generation only',
  },
};

/**
 * Get all settings for a specific tier
 */
export function getSettingsForTier(tier: Tier): SettingsRegistry {
  const result: SettingsRegistry = {};
  const tierOrder = ['basic', 'advanced', 'professional'];
  const tierIndex = tierOrder.indexOf(tier);

  for (const [key, setting] of Object.entries(SETTINGS_REGISTRY)) {
    const settingTierIndex = tierOrder.indexOf(setting.tier);
    if (settingTierIndex <= tierIndex) {
      result[key] = setting;
    }
  }
  return result;
}

/**
 * Get all settings for a specific section
 */
export function getSettingsForSection(section: string): SettingsRegistry {
  const result: SettingsRegistry = {};
  for (const [key, setting] of Object.entries(SETTINGS_REGISTRY)) {
    if (setting.section === section) {
      result[key] = setting;
    }
  }
  return result;
}

/**
 * Get settings that expect QR changes
 */
export function getQRChangingSettings(): SettingsRegistry {
  const result: SettingsRegistry = {};
  for (const [key, setting] of Object.entries(SETTINGS_REGISTRY)) {
    if (setting.expectsQRChange) {
      result[key] = setting;
    }
  }
  return result;
}

/**
 * Get settings that don't expect QR changes
 */
export function getNonQRChangingSettings(): SettingsRegistry {
  const result: SettingsRegistry = {};
  for (const [key, setting] of Object.entries(SETTINGS_REGISTRY)) {
    if (!setting.expectsQRChange) {
      result[key] = setting;
    }
  }
  return result;
}

/**
 * Get unique sections
 */
export function getSections(): string[] {
  const sections = new Set<string>();
  for (const setting of Object.values(SETTINGS_REGISTRY)) {
    sections.add(setting.section);
  }
  return Array.from(sections);
}

/**
 * Get statistics about the registry
 */
export function getRegistryStats(): {
  total: number;
  byTier: Record<Tier, number>;
  bySection: Record<string, number>;
  byType: Record<SettingType, number>;
  expectsQRChange: number;
  noQRChange: number;
} {
  const stats = {
    total: 0,
    byTier: { basic: 0, advanced: 0, professional: 0 } as Record<Tier, number>,
    bySection: {} as Record<string, number>,
    byType: {} as Record<SettingType, number>,
    expectsQRChange: 0,
    noQRChange: 0,
  };

  for (const setting of Object.values(SETTINGS_REGISTRY)) {
    stats.total++;
    stats.byTier[setting.tier]++;
    stats.bySection[setting.section] = (stats.bySection[setting.section] || 0) + 1;
    stats.byType[setting.type] = (stats.byType[setting.type] || 0) + 1;
    if (setting.expectsQRChange) {
      stats.expectsQRChange++;
    } else {
      stats.noQRChange++;
    }
  }

  return stats;
}

/**
 * Get all settings as an array with their IDs
 */
export function getAllSettingsWithIds(): Array<SettingDefinition & { id: string }> {
  return Object.entries(SETTINGS_REGISTRY).map(([id, def]) => ({ ...def, id }));
}

/**
 * Get exhaustive test cases for a setting
 * Returns all test values to iterate through
 */
export function getExhaustiveTestCases(settingId: string): Array<string | number | boolean> {
  const setting = SETTINGS_REGISTRY[settingId];
  if (!setting) return [];
  return setting.testValues || [];
}
