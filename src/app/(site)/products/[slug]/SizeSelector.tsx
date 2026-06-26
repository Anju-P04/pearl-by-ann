"use client";

import { useState } from "react";
import { WHATSAPP } from "@/lib/constants";
import type { SizeStock } from "@/lib/data/products";
import { PRODUCT_SIZES } from "@/lib/data/products";
import OrderModal from "@/components/product/OrderModal";

interface SizeSelectorProps {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  productPrice: number;
  sizeStock: SizeStock;
}

interface OrderItem {
  size: string;
  quantity: number;
}

function stockLabel(qty: number): string {
  if (qty === 0) return "Out of Stock";
  if (qty <= 2) return `Only ${qty} left`;
  return "In Stock";
}

export default function SizeSelector({
  productId,
  productName,
  productSlug,
  productImage,
  productPrice,
  sizeStock,
}: SizeSelectorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    PRODUCT_SIZES.reduce((acc, size) => {
      acc[size] = 0;
      return acc;
    }, {} as Record<string, number>)
  );
  const [showOrderModal, setShowOrderModal] = useState(false);

  const items: OrderItem[] = PRODUCT_SIZES.map((size) => ({
    size,
    quantity: quantities[size] ?? 0,
  })).filter((item) => item.quantity > 0);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = totalItems * productPrice;

  const orderLines = items.map((item) => `${item.size} × ${item.quantity}`).join("\n");

  const orderMessage = totalItems
    ? `Hello Pearl by Ann,\n\nI would like to order:\n\n${orderLines}\n\nTotal Items: ${totalItems}\nTotal Price: ₹${totalPrice}\n\nPlease assist me with this order.`
    : `Hello Pearl by Ann,\n\nI would like to order a product.\n\nPlease assist me with this order.`;

  function updateQuantity(size: string, delta: number) {
    const current = quantities[size] ?? 0;
    const max = sizeStock[size] ?? 0;
    const next = current + delta;
    if (next < 0 || next > max) return;
    setQuantities((prev) => ({ ...prev, [size]: next }));
  }

  const hasSelection = totalItems > 0;

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-600">
        Select Sizes
      </h2>

      <div className="grid gap-3">
        {PRODUCT_SIZES.map((size) => {
          const stock = sizeStock[size] ?? 0;
          const quantity = quantities[size] ?? 0;
          const canIncrement = quantity < stock && stock > 0;
          const canDecrement = quantity > 0;
          const isOutOfStock = stock === 0;

          return (
            <div key={size} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
              isOutOfStock ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'
            }`}>
              <div>
                <p className={`text-sm font-semibold ${
                  isOutOfStock ? 'text-gray-400' : 'text-gray-900'
                }`}>{size}</p>
                <p className={`text-xs ${
                  isOutOfStock ? 'text-red-500' : 'text-gray-500'
                }`}>{stockLabel(stock)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(size, -1)}
                  disabled={!canDecrement || isOutOfStock}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-lg font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  -
                </button>
                <span className="min-w-[2rem] text-center text-sm font-medium text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(size, 1)}
                  disabled={!canIncrement || isOutOfStock}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-lg font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-3">
        {!hasSelection && (
          <p className="text-center text-xs text-gray-400">
            Select quantities for one or more sizes to order.
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowOrderModal(true)}
          disabled={!hasSelection}
          className="flex w-full items-center justify-center rounded-full bg-olive px-8 py-3.5 text-base font-medium text-white transition hover:bg-olive-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          Order Now
        </button>

        <a
          href={WHATSAPP.getUrl(orderMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex w-full items-center justify-center gap-3 rounded-full px-8 py-3.5 text-base font-medium transition-all ${
            hasSelection
              ? "bg-olive text-white hover:bg-olive-light"
              : "bg-gray-300 text-white cursor-not-allowed opacity-60"
          }`}
          aria-disabled={!hasSelection}
        >
          Order on WhatsApp
        </a>
      </div>

      {showOrderModal && (
        <OrderModal
          productId={productId}
          productName={productName}
          productSlug={productSlug}
          productImage={productImage}
          items={items}
          unitPrice={productPrice}
          totalItems={totalItems}
          totalPrice={totalPrice}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </div>
  );
}
