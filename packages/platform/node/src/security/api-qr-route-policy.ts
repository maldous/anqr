import type { RouteAccessClassification } from "./route-access-classification.types";

export const API_QR_ROUTE_POLICY: {
  route: "/api/contract/qr";
  classification: RouteAccessClassification;
  cacheControl: "no-store";
  perimeterControls: readonly ["rate-limit"];
} = {
  route: "/api/contract/qr",
  classification: "public",
  cacheControl: "no-store",
  perimeterControls: ["rate-limit"],
};
