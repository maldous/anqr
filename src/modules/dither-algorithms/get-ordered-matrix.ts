import {
  BAYER_2,
  BAYER_4,
  BAYER_8,
  CLUSTERED_DOT,
  VOID_CLUSTER,
} from "../../domain/render/dither/matrices";
import type { OrderedMatrix } from "./types";

/** Get ordered dithering matrix by name */
export function getOrderedMatrix(name: OrderedMatrix): number[][] {
  switch (name) {
    case "bayer2":
      return BAYER_2;
    case "bayer4":
      return BAYER_4;
    case "bayer8":
      return BAYER_8;
    case "clustered_dot":
      return CLUSTERED_DOT;
    case "void_cluster":
      return VOID_CLUSTER;
    default:
      return BAYER_4;
  }
}
