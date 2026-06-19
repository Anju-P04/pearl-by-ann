export const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

console.log("Cloudinary preset:", UPLOAD_PRESET);

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
export interface UploadProgressCallback {
  (progress: number): void;
}

/** Validates file type and size. Returns an error string or null. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `"${file.name}" exceeds the 5 MB size limit.`;
  }
  return null;
}

/**
 * Uploads a single image to Cloudinary using an unsigned upload preset.
 * Uses XHR so real upload progress is available via onProgress (0–100).
 * Returns the secure_url from Cloudinary.
 */
export function uploadProductImage(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "pearl-by-ann/products");

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText) as { secure_url: string };
          resolve(res.secure_url);
        } catch {
          reject(new Error("Invalid response from Cloudinary."));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText) as { error?: { message?: string } };
          reject(new Error(err?.error?.message ?? `Upload failed (${xhr.status}).`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}.`));
        }
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Network error — check your connection and try again."))
    );
    xhr.addEventListener("abort", () =>
      reject(new Error("Upload was aborted."))
    );

    xhr.open("POST", UPLOAD_URL);
    xhr.send(formData);
  });
}
