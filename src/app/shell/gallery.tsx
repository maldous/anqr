import { lazy } from "react";

export const Gallery = lazy(() =>
  import("@/components/gallery").then((m) => ({ default: m.Gallery })),
);
