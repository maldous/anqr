export function buildPngMetadata(metadataState: {
  title: string;
  author: string;
  copyright: string;
  description: string;
  creationTime: boolean;
}): Record<string, string | undefined> | undefined {
  if (
    !metadataState.title &&
    !metadataState.author &&
    !metadataState.copyright &&
    !metadataState.description
  ) {
    return undefined;
  }
  return {
    title: metadataState.title || undefined,
    author: metadataState.author || undefined,
    copyright: metadataState.copyright || undefined,
    description: metadataState.description || undefined,
    creationTime: metadataState.creationTime ? new Date().toISOString() : undefined,
    software: 'ANQR - https://anqr.link',
  };
}
