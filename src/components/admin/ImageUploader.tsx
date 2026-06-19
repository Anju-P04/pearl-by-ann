"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadProductImage, validateImageFile } from "@/lib/admin/storage";

interface UploadedImage {
  url: string;       // Cloudinary secure_url once uploaded, or pre-existing URL
  file?: File;       // present only while uploading
  progress?: number; // 0–100 while uploading, undefined when done
  error?: string;
}

interface ImageUploaderProps {
  existingUrls: string[];
  onChange: (urls: string[]) => void;
}

export default function ImageUploader({ existingUrls, onChange }: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    existingUrls.map((url) => ({ url }))
  );
  const [uploading, setUploading] = useState<UploadedImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Push committed images list to parent
  function commit(updated: UploadedImage[]) {
    setImages(updated);
    onChange(updated.map((i) => i.url).filter(Boolean));
  }

  async function processFiles(files: FileList | File[]) {
    const list = Array.from(files);

    const validated = list.map((f) => ({
      file: f,
      error: validateImageFile(f) ?? undefined,
    }));

    const invalid = validated.filter((v) => v.error);
    if (invalid.length) {
      alert(invalid.map((v) => v.error).join("\n"));
    }

    const valid = validated.filter((v) => !v.error);
    if (!valid.length) return;

    // Add pending entries immediately so thumbnails appear
    const pending: UploadedImage[] = valid.map((v) => ({
      url: "",
      file: v.file,
      progress: 0,
    }));
    setUploading((prev) => [...prev, ...pending]);

    await Promise.all(
      valid.map(async (v) => {
        try {
          const url = await uploadProductImage(v.file, (pct) => {
            setUploading((prev) =>
              prev.map((item) =>
                item.file === v.file ? { ...item, progress: pct } : item
              )
            );
          });

          // Move from uploading → committed
          setUploading((prev) => prev.filter((item) => item.file !== v.file));
         setImages((prev) => {
  const next = [...prev, { url }];

  setTimeout(() => {
    onChange(next.map((i) => i.url));
  }, 0);

  return next;
});
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Upload failed. Try again.";
          setUploading((prev) =>
            prev.map((item) =>
              item.file === v.file
                ? { ...item, error: message, progress: undefined }
                : item
            )
          );
        }
      })
    );
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  }

  function removeCommitted(index: number) {
    commit(images.filter((_, i) => i !== index));
  }

  function removeUploading(item: UploadedImage) {
    setUploading((prev) => prev.filter((u) => u.file !== item.file));
  }

  function retryUpload(item: UploadedImage) {
    if (!item.file) return;
    removeUploading(item);
    processFiles([item.file]);
  }

  const hasAny = images.length > 0 || uploading.length > 0;

  return (
    <div className="space-y-4">

      {/* ── Drop zone ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition-colors ${
          dragOver
            ? "border-olive bg-olive/5"
            : "border-gray-200 bg-gray-50 hover:border-olive/50 hover:bg-olive/5"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-olive/10">
          <svg
            className="h-6 w-6 text-olive"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Drag &amp; drop images here, or{" "}
            <span className="text-olive underline">browse</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            JPG, PNG, WEBP · Max 5 MB each · Multiple allowed
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* ── Thumbnail grid ── */}
      {hasAny && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">

          {/* Committed / existing images */}
          {images.map((img, i) => (
            <div
              key={img.url + i}
              className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
            >
              <Image
                src={img.url}
                alt={`Product image ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              {/* Always-visible remove button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeCommitted(i); }}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 shadow transition-transform hover:scale-110"
                title="Remove image"
              >
                <svg
                  className="h-3.5 w-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* In-progress and failed uploads */}
          {uploading.map((item, i) => (
            <div
              key={`up-${i}`}
              className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
            >
              {/* Blurred local preview */}
              {item.file && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={URL.createObjectURL(item.file)}
                  alt="Uploading preview"
                  className="h-full w-full object-cover opacity-40"
                />
              )}

              {item.error ? (
                /* ── Error state ── */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-red-50/95 p-2">
                  <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-center text-[10px] font-medium leading-tight text-red-600">
                    {item.error}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => retryUpload(item)}
                      className="text-[10px] font-semibold text-red-700 underline"
                    >
                      Retry
                    </button>
                    <span className="text-[10px] text-red-300">·</span>
                    <button
                      type="button"
                      onClick={() => removeUploading(item)}
                      className="text-[10px] font-semibold text-red-700 underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Upload progress overlay ── */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/35">
                  {/* Circular progress ring */}
                  <div className="relative h-10 w-10">
                    <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18" cy="18" r="15"
                        fill="none"
                        stroke="white"
                        strokeOpacity="0.25"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18" cy="18" r="15"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${(item.progress ?? 0) * 0.942} 94.2`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                      {item.progress ?? 0}%
                    </span>
                  </div>
                  {/* Cancel upload */}
                  <button
                    type="button"
                    onClick={() => removeUploading(item)}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 shadow transition-transform hover:scale-110"
                    title="Cancel upload"
                  >
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
