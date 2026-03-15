import type { CanonicalFixture } from './gallery-scan-scenario-types/canonical-fixture';

export const CANONICAL_FIXTURES: readonly CanonicalFixture[] = [
  { id: 'tsunami', filePath: 'public/tsunami.jpg', publicPath: '/tsunami.jpg', isAnimated: false },
  { id: 'king', filePath: 'public/king.gif', publicPath: '/king.gif', isAnimated: true },
  { id: 'logo', filePath: 'public/logo.png', publicPath: '/logo.png', isAnimated: false },
  { id: 'test', filePath: 'public/test.png', publicPath: '/test.png', isAnimated: false },
  { id: 'santa', filePath: 'public/santa.png', publicPath: '/santa.png', isAnimated: false },
  { id: 'dance', filePath: 'public/dance.gif', publicPath: '/dance.gif', isAnimated: true },
];
