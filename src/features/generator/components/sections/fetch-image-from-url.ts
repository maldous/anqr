export async function fetchImageFromUrl(urlInput: string): Promise<File> {
  const response = await fetch(urlInput, { mode: 'cors' });
  if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) throw new Error('URL does not point to an image');
  const blob = await response.blob();
  const filename = urlInput.split('/').pop()?.split('?')[0] || 'image';
  return new File([blob], filename, { type: blob.type });
}
