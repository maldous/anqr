import { lazy } from "react";

export const StaticPage = lazy(() =>
  import("@/components/static-page").then((m) => ({ default: m.StaticPage })),
);
