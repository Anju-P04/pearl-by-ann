"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  productName: string;
  badge?: "new" | "bestseller";
}

export default function ImageGallery({
  images,
  productName,
  badge,
}: ImageGalleryProps) {
  const [active, setActive] = useState(0);

  const nextImage = () => {
    setActive((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image */}
      <div
        onClick={nextImage}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-cream cursor-pointer"
      >
        <Image
          src={images[active]}
          alt={`${productName} — image ${active + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />

        {badge && (
          <div className="absolute left-4 top-4 rounded-full bg-gold px-4 py-1.5 text-sm font-medium uppercase tracking-wider text-white">
            {badge === "bestseller" ? "Best Seller" : "New"}
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative aspect-square w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                active === i
                  ? "border-olive"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}