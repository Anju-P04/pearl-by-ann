"use client";

import Image from "next/image";
import Link from "next/link";
import { WHATSAPP } from "@/lib/constants";
import type { Product } from "@/lib/data/products";
import { isProductAvailable, getTotalStock } from "@/lib/data/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const available = isProductAvailable(product);
  const totalStock = getTotalStock(product);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const message = available
      ? `Hi Pearl by Ann,\n\nI'm interested in:\n\n${product.name}\n\nPlease share more details.`
      : `Hello Pearl by Ann,\n\nPlease notify me when this product is restocked.\n\nProduct: ${product.name}\nPrice: ₹${product.price}\n\nThank you.`;

    window.open(WHATSAPP.getUrl(message), "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md ${
        !available ? "opacity-70" : ""
      }`}
    >
      <Link href={`/products/${product.slug}`} className="cursor-pointer">
        <div className="relative aspect-[3/4] overflow-hidden bg-cream">
          <Image
            src={product.images?.[0] || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Out of Stock overlay */}
          {!available && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-red-600/90 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg">
                Out of Stock
              </div>
            </div>
          )}

          {/* Badge — New Arrival takes priority over Featured */}
          {available && product.newArrival && (
            <div className="absolute left-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white">
              New Arrival
            </div>
          )}
          {available && !product.newArrival && product.featured && (
            <div className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-medium uppercase tracking-wider text-white">
              Featured
            </div>
          )}

          {/* Category tag */}
          <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-olive backdrop-blur">
            {product.category === "kurta" ? "Kurti" : "Kurti Set"}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-heading text-base font-semibold text-charcoal transition-colors hover:text-olive">
            {product.name}
          </h3>
        </Link>

        <span className="text-lg font-bold text-olive">₹{product.price}</span>

        <p className="text-xs leading-relaxed text-gray-500">
          {product.fabric} · {product.color}
        </p>

        {/* Stock status hint */}
        {available && totalStock <= 2 && (
          <p className="text-xs font-medium text-red-500">
            Only {totalStock} left
          </p>
        )}
        {available && totalStock > 2 && (
          <p className="text-xs font-medium text-green-600">In Stock</p>
        )}

        <div className="mt-auto pt-2">
          <button
            onClick={handleWhatsAppClick}
            className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white transition-colors ${
              !available
                ? "bg-orange-500 hover:bg-orange-600"
                : "cursor-pointer bg-olive hover:bg-olive-light"
            }`}
          >
            {!available ? "Notify Me When Restocked" : "View & Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
