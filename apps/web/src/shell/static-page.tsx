import { lazy } from "react";

export const StaticPage = lazy(() =>
  import("../pages/static-page").then((m) => ({ default: m.StaticPage })),
);
