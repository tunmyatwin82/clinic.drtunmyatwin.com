/** Client-side prep for booking uploads — keeps payloads small for Zustand/localStorage. */

export const MAX_HEALTH_RECORD_FILES = 5;
export const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3 MB per file before compression
const MAX_IMAGE_EDGE = 1280;
const JPEG_QUALITY = 0.72;
const PAYMENT_MAX_EDGE = 1600;

export type HealthRecordMeta = { kind: 'file'; name: string; type: string; size: number };

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageDataUrl(value: string): boolean {
  return value.startsWith('data:image');
}

export function parseHealthRecordMeta(value: string): HealthRecordMeta | null {
  if (!value.startsWith('meta:')) return null;
  try {
    return JSON.parse(value.slice(5)) as HealthRecordMeta;
  } catch {
    return null;
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

/** Resize photos in-browser so booking + localStorage stay fast. */
export async function compressImageToDataUrl(
  file: File,
  maxEdge = MAX_IMAGE_EDGE,
  quality = JPEG_QUALITY,
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return readFileAsDataUrl(file);
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return readFileAsDataUrl(file);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality),
  );
  if (!blob) return readFileAsDataUrl(file);

  return readFileAsDataUrl(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
}

export async function prepareHealthRecordForStorage(file: File): Promise<string> {
  if (file.type.startsWith('image/')) {
    return compressImageToDataUrl(file);
  }
  const meta: HealthRecordMeta = { kind: 'file', name: file.name, type: file.type, size: file.size };
  return `meta:${JSON.stringify(meta)}`;
}

export async function preparePaymentScreenshot(file: File): Promise<string> {
  return compressImageToDataUrl(file, PAYMENT_MAX_EDGE, 0.8);
}

export function healthRecordLabel(value: string, fallbackIndex: number): string {
  const meta = parseHealthRecordMeta(value);
  if (meta) return meta.name;
  return `Record ${fallbackIndex + 1}`;
}
