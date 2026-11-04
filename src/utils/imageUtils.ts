/**
 * Client-side image compression and resizing utility.
 * Ensures uploaded images look sharp while staying well within Firestore document size limits.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize image canvas context');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  // Prefer WebP for smaller byte size; fallback to JPEG
  let dataUrl = canvas.toDataURL('image/webp', quality);
  if (!dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  // If still larger than ~320KB, step down quality slightly to guarantee Firestore safety
  if (dataUrl.length > 320000) {
    dataUrl = canvas.toDataURL('image/jpeg', 0.65);
  }
  if (dataUrl.length > 350000) {
    const smallerCanvas = document.createElement('canvas');
    smallerCanvas.width = Math.round(width * 0.75);
    smallerCanvas.height = Math.round(height * 0.75);
    const sCtx = smallerCanvas.getContext('2d');
    if (sCtx) {
      sCtx.drawImage(bitmap, 0, 0, smallerCanvas.width, smallerCanvas.height);
      dataUrl = smallerCanvas.toDataURL('image/jpeg', 0.65);
    }
  }

  return dataUrl;
}
