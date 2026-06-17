import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data/products";
import { WHATSAPP } from "@/lib/constants";
import SizeSelector from "./SizeSelector";
import ImageGallery from "./ImageGallery";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-warm-white min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-olive"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </Link>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left Column — Image Gallery */}
          <ImageGallery
            images={product.images}
            productName={product.name}
            badge={product.badge}
          />

          {/* Right Column — Product Info */}
          <div className="flex flex-col gap-6">
            {/* Category */}
            <span className="inline-block rounded-full bg-cream px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-olive">
              {product.category === "kurta" ? "Kurti" : "Kurti Set"}
            </span>

            {/* Name */}
            <h1 className="text-3xl font-bold text-charcoal sm:text-4xl font-heading">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-olive">₹{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="rounded-full bg-red-50 px-3 py-0.5 text-xs font-medium text-red-500">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-cream" />

            {/* Description */}
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-600">
                Description
              </h2>
              <p className="text-sm leading-relaxed text-gray-500">
                {product.description}
              </p>
            </div>

            {/* Colors */}
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-600">
                Available Colors
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <span
                    key={color}
                    className="rounded-full border border-cream bg-white px-3 py-1 text-xs font-medium text-gray-600"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>

            {/* Sizes — Interactive Selector */}
            <SizeSelector
              productName={product.name}
              productPrice={product.price}
              sizes={product.sizes}
              slug={product.slug}
            />
          </div>
        </div>
      </div>
    </div>
  );
}