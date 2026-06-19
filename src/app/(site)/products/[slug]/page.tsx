import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/firestore";
import { formatCategoryLabel } from "@/lib/data/products";
import SizeSelector from "./SizeSelector";
import ImageGallery from "./ImageGallery";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

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
          {/* Left — Image Gallery */}
          <ImageGallery
            images={product.images}
            productName={product.name}
            badge={product.featured ? "bestseller" : undefined}
          />

          {/* Right — Product Info */}
          <div className="flex flex-col gap-6">
            {/* Category */}
            <span className="inline-block rounded-full bg-cream px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-olive">
              {formatCategoryLabel(product.category)}
            </span>

            {/* Name */}
            <h1 className="font-heading text-3xl font-bold text-charcoal sm:text-4xl">
              {product.name}
            </h1>

            {/* Price */}
            <span className="text-3xl font-bold text-olive">₹{product.price}</span>

            <div className="h-px bg-cream" />

            {/* Details */}
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-600">
                Details
              </h2>
              <p className="text-sm leading-relaxed text-gray-500">
                {product.fabric} · {product.color}
              </p>
            </div>

            {/* Size selector */}
            <SizeSelector
              productName={product.name}
              productPrice={product.price}
              sizeStock={product.sizeStock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
