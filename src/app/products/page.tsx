
import { getProductsGroupedByCategory } from "@/lib/firestore";
import ProductCard from "@/components/product/ProductCard";

export const metadata = { title: "Products — Pearl by Ann" };

function formatCategory(category: string) {
  return category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function ProductsPage() {
  const categories = await getProductsGroupedByCategory();

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="bg-cream py-12 text-center">
        <h1 className="font-heading text-4xl font-bold text-olive sm:text-5xl">
          Our Collection
        </h1>

        <p className="mt-3 text-sm text-gray-500 sm:text-base">
          Handpicked ethnic wear crafted with love — from traditional to contemporary.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 space-y-16">
        {Object.entries(categories).map(([category, products]) => (
          <section key={category}>
            <div className="mb-8 flex items-center gap-4">
              <h2 className="font-heading text-2xl font-bold text-olive sm:text-3xl">
                {formatCategory(category)}
              </h2>

              <div className="h-px flex-1 bg-cream" />

              <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-olive">
                {products.length} styles
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}