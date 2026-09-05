/**
 * Compresses an image file client-side using an offscreen HTML Canvas
 * to prevent uploading bloated multi-megabyte camera photos over Egyptian
 * mobile data connections (3G/4G/ADSL).
 *
 * Compression strategy:
 * - Max dimension: 1600px (sufficient for clear workbook page reading)
 * - JPEG quality: 0.78 (optimal balance between clarity and file size)
 * - Estimated output: 48MP photo (8-12 MB) → ~150-300 KB compressed
 */
export function compressImage(
  file: File,
  maxDimension = 1600,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Only downscale if image exceeds max dimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Canvas context unavailable — return original data URL
          resolve(e.target?.result as string);
          return;
        }

        // Use high-quality image smoothing for downscaled images
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Estimates the byte size of a base64 data URL string.
 * Useful for displaying upload size feedback to students on limited data plans.
 */
export function estimateDataUrlSizeKB(dataUrl: string): number {
  // Remove the data:image/jpeg;base64, prefix
  const base64 = dataUrl.split(",")[1] || dataUrl;
  // Base64 encodes 3 bytes as 4 characters, so decode ratio is 3/4
  const sizeBytes = Math.ceil((base64.length * 3) / 4);
  return Math.round(sizeBytes / 1024);
}
