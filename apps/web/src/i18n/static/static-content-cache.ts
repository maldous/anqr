import type { PageDefinition, StaticPageType } from "./types";
import * as enGB from "./en-GB";

export const contentCache = new Map<string, Record<StaticPageType, PageDefinition>>();

contentCache.set("en-GB", enGB);
