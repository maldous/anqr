interface ImageTrackList {
  ready: Promise<undefined>;
  selectedIndex: number;
  selectedTrack: ImageTrack | null;
  length: number;
  [index: number]: ImageTrack;
}
