import type { CanonicalFixtureId } from './canonical-fixture-id';

export interface CanonicalFixture {
  id: CanonicalFixtureId;
  filePath: string;
  publicPath: string;
  isAnimated: boolean;
}
