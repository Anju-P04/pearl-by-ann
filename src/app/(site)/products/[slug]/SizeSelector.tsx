"use client";

import { useState } from "react";
import { WHATSAPP } from "@/lib/constants";
import type { SizeStock } from "@/lib/data/products";
import { getSizeStock, isSizeAvailable, PRODUCT_SIZES } from "@/lib/data/products";

interface SizeSelectorProps {
  productName: string;
  productPrice: number;
  sizeStock: SizeStock;
}

function stockLabel(qty: number): string {
  if (qty === 0) return "Out of Stock";
  if (qty <= 2) return `Only ${qty} left`;
  return "In Stock";
}

export default function SizeSelector({
  productName,
  productPrice,
  sizeStock,
}: SizeSelectorProps) {
  // Fixed display order: S, M, L, XL, XXL — use shared PRODUCT_SIZES to avoid hardcoding unsupported sizes
  const DISPLAY_ORDER = ["S", "M", "L", "XL", "XXL"] as const;
  const sizes = DISPLAY_ORDER.filter((s) =>
    PRODUCT_SIZES.includes(s as typeof PRODUCT_SIZES[number])
  ) as typeof PRODUCT_SIZES[number][];
  const [selectedSize, setSelectedSize] = useState("");

  const selectedQty = selectedSize ? getSizeStock({ sizeStock } as never, selectedSize) : -1;
  const selectedAvailable = selectedSize ? isSizeAvailable({ sizeStock } as never, selectedSize) : false;

  const orderMessage = `Hello Pearl by Ann,\n\nI would like to order:\n\nProduct: ${productName}\nSize: ${selectedSize}\nPrice: ₹${productPrice}\n\nPlease assist me with this order.`;

  const notifyMessage = `Hello Pearl by Ann,\n\nPlease notify me when size ${selectedSize} is available again.\n\nProduct:\n${productName}\n\nThank you.`;

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-600">
        Select Size
      </h2>

      {/* Size dropdown */}
      <select
        value={selectedSize}
        onChange={(e) => setSelectedSize(e.target.value)}
        className="w-full rounded-lg border border-cream bg-white px-4 py-3 text-sm font-medium text-charcoal focus:border-olive focus:outline-none focus:ring-1 focus:ring-olive"
      >
        <option value="">Select a size</option>
        {sizes.map((size) => {
          const qty = sizeStock[size] ?? 0;
          return (
            <option key={size} value={size}>
              {size} — {stockLabel(qty)}
            </option>
          );
        })}
      </select>

      {/* Per-size stock hint after selection */}
      {selectedSize && (
        <p
          className={`mt-2 text-xs font-medium ${
            selectedAvailable
              ? selectedQty <= 2
                ? "text-red-500"
                : "text-green-600"
              : "text-gray-400"
          }`}
        >
          {selectedAvailable
            ? selectedQty <= 2
              ? `Only ${selectedQty} left in size ${selectedSize}`
              : `Size ${selectedSize} is available`
            : `Size ${selectedSize} is currently out of stock`}
        </p>
      )}

      {/* CTA */}
      <div className="mt-8 space-y-3">
        {!selectedSize && (
          <button
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center rounded-full bg-gray-300 px-8 py-3.5 text-base font-medium text-white"
          >
            Order on WhatsApp
          </button>
        )}

        {selectedSize && selectedAvailable && (
          <a
            href={WHATSAPP.getUrl(orderMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-3 rounded-full bg-olive px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-olive-light hover:shadow-lg"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Order on WhatsApp
          </a>
        )}

        {selectedSize && !selectedAvailable && (
          <a
            href={WHATSAPP.getUrl(notifyMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-full bg-orange-500 px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-orange-600"
          >
            Notify Me When This Size Is Restocked
          </a>
        )}

        {!selectedSize && (
          <p className="text-center text-xs text-gray-400">
            Please select a size before ordering.
          </p>
        )}
      </div>
    </div>
  );
}
