import { PngMetadata } from "./png-metadata.types.ts";

export function buildPngMetadata(
  metaTitle: string | undefined,
  metaAuthor: string | undefined,
  metaCopyright: string | undefined,
  metaDescription: string | undefined,
  metaLicense: string | undefined,
  metaCreationTime: boolean,
  metaCustomKv: string | undefined,
): PngMetadata | undefined {
  if (
    !metaTitle &&
    !metaAuthor &&
    !metaCopyright &&
    !metaDescription &&
    !metaLicense &&
    !metaCreationTime &&
    !metaCustomKv
  ) {
    return undefined;
  }
  return {
    title: metaTitle,
    author: metaAuthor,
    copyright: metaCopyright,
    description: metaDescription,
    creationTime: metaCreationTime ? new Date().toISOString() : undefined,
    software: "ANQR - anqr.link",
    ...(metaCustomKv && !metaDescription ? { description: metaCustomKv } : {}),
  };
}
