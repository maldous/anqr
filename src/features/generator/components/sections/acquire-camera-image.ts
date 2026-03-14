import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { downscaleCameraBlob } from './downscale-camera-blob';

export async function acquireCameraImage(): Promise<File> {
  const permissions = await Camera.checkPermissions();
  if (permissions.camera === 'denied') {
    const requested = await Camera.requestPermissions();
    if (requested.camera === 'denied') throw new Error('Camera permission denied');
  }
  const image = await Camera.getPhoto({
    quality: 70,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
  });
  if (!image.webPath) throw new Error('No camera image path available');
  const response = await fetch(image.webPath);
  if (!response.ok) throw new Error(`Camera image fetch failed: ${response.status}`);
  let blob = await response.blob();
  blob = await downscaleCameraBlob(blob, 1920);
  const mimeType = blob.type || 'image/jpeg';
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  return new File([blob], `camera-${Date.now()}.${ext}`, { type: mimeType });
}
