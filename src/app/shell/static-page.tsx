import { lazy } from "react";

export const StaticPage = lazy(() =>
  import("@/app/pages/static-page").then((m) => ({ default: m.StaticPage })),
);
