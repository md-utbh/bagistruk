/**
 * Image Compression Utility
 *
 * Client-side image processing using Canvas API.
 * Resizes images to max 1600px dimension and compresses to target < 800KB.
 * Returns base64 data URL — no raw files are ever sent to the server.
 */

export interface CompressedImage {
  /** Base64-encoded data URL (e.g. data:image/webp;base64,...) */
  dataUrl: string;
  /** MIME type of the output (image/webp or image/jpeg) */
  mimeType: "image/webp" | "image/jpeg";
  /** Original file size in bytes */
  originalSize: number;
  /** Compressed file size in bytes (estimated from base64) */
  compressedSize: number;
  /** Original image dimensions */
  originalWidth: number;
  originalHeight: number;
  /** Compressed image dimensions */
  width: number;
  height: number;
  /** Compression ratio (e.g. 0.35 means 35% of original size) */
  compressionRatio: number;
}

const MAX_DIMENSION = 1600;
const TARGET_SIZE_BYTES = 800 * 1024; // 800KB
const INITIAL_QUALITY = 0.8;
const MIN_QUALITY = 0.4;
const QUALITY_STEP = 0.1;

/**
 * Loads a File into an HTMLImageElement.
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Gagal memuat gambar. Pastikan file adalah gambar yang valid."));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Calculates new dimensions while maintaining aspect ratio.
 * Ensures the longest side does not exceed MAX_DIMENSION.
 */
function calculateDimensions(
  width: number,
  height: number,
  maxDim: number
): { width: number; height: number } {
  if (width <= maxDim && height <= maxDim) {
    return { width, height };
  }

  const ratio = Math.min(maxDim / width, maxDim / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

/**
 * Estimates the byte size of a base64 data URL string.
 */
function estimateBase64Size(dataUrl: string): number {
  // Remove the data:image/xxx;base64, prefix
  const base64 = dataUrl.split(",")[1] ?? "";
  // Base64 encodes 3 bytes into 4 chars, with potential padding
  const padding = (base64.match(/=+$/) ?? [""])[0].length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Determines if the browser supports WebP encoding via canvas.
 */
function supportsWebP(): boolean {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}

/**
 * Compresses an image file using Canvas API.
 *
 * 1. Reads the file and loads it into an Image element
 * 2. Draws it onto a Canvas, resized to max 1600px on longest side
 * 3. Exports as WebP (with JPEG fallback) at quality 0.8
 * 4. If result exceeds 800KB, iteratively reduces quality
 *
 * @param file - The image File from an <input type="file">
 * @returns CompressedImage with base64 data URL and metadata
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const img = await loadImageFromFile(file);
  const originalWidth = img.naturalWidth;
  const originalHeight = img.naturalHeight;

  const { width, height } = calculateDimensions(originalWidth, originalHeight, MAX_DIMENSION);

  // Create an offscreen canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context tidak tersedia.");
  }

  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw the image scaled to fit the canvas
  ctx.drawImage(img, 0, 0, width, height);

  // Determine output format
  const useWebP = supportsWebP();
  const mimeType: "image/webp" | "image/jpeg" = useWebP ? "image/webp" : "image/jpeg";

  // Iteratively compress until under target size
  let quality = INITIAL_QUALITY;
  let dataUrl = canvas.toDataURL(mimeType, quality);
  let compressedSize = estimateBase64Size(dataUrl);

  while (compressedSize > TARGET_SIZE_BYTES && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    quality = Math.max(quality, MIN_QUALITY);
    dataUrl = canvas.toDataURL(mimeType, quality);
    compressedSize = estimateBase64Size(dataUrl);
  }

  // If still too large with WebP, try JPEG as a fallback
  if (compressedSize > TARGET_SIZE_BYTES && useWebP) {
    quality = INITIAL_QUALITY;
    const jpegMime = "image/jpeg" as const;
    let jpegDataUrl = canvas.toDataURL(jpegMime, quality);
    let jpegSize = estimateBase64Size(jpegDataUrl);

    while (jpegSize > TARGET_SIZE_BYTES && quality > MIN_QUALITY) {
      quality -= QUALITY_STEP;
      quality = Math.max(quality, MIN_QUALITY);
      jpegDataUrl = canvas.toDataURL(jpegMime, quality);
      jpegSize = estimateBase64Size(jpegDataUrl);
    }

    if (jpegSize < compressedSize) {
      return {
        dataUrl: jpegDataUrl,
        mimeType: jpegMime,
        originalSize: file.size,
        compressedSize: jpegSize,
        originalWidth,
        originalHeight,
        width,
        height,
        compressionRatio: jpegSize / file.size,
      };
    }
  }

  return {
    dataUrl,
    mimeType,
    originalSize: file.size,
    compressedSize,
    originalWidth,
    originalHeight,
    width,
    height,
    compressionRatio: compressedSize / file.size,
  };
}

/**
 * Extracts the pure base64 string from a data URL (without the prefix).
 * Useful for sending to the Gemini API which expects raw base64.
 */
export function extractBase64(dataUrl: string): string {
  return dataUrl.split(",")[1] ?? "";
}

/**
 * Formats byte size into human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
