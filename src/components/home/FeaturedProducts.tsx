import { getFeaturedProducts } from "@/lib/data/products";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";

export default function FeaturedProducts() {
  const products = getFeaturedProducts().slice(0, 4);

  return (
    <section className="bg-warm-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-olive sm:text-4xl font-heading">
            Featured Collection
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">
            Discover our most loved kurtas and short kurtas, handpicked just for you.
          </p>
        </div>

        {/* Product Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border-2 border-olive px-8 py-3 text-sm font-medium text-olive transition-all hover:bg-olive hover:text-white"
          >
            View All Products
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}