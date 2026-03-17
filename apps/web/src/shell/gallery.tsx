import { lazy } from "react";

export const Gallery = lazy(() =>
  import("@/features/gallery/components/gallery").then((m) => ({ default: m.Gallery })),
);
