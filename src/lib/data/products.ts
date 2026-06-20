export type ProductCategory = "kurta" | "kurti-set" | "short-kurta";

export const PRODUCT_CATEGORIES = [
  { value: "kurta", label: "Kurti" },
  { value: "kurti-set", label: "Kurti Set" },
  { value: "short-kurta", label: "Short Kurta" },
  { value: "crop-top", label: "Crop Top" },
] as const;

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

// Map of size -> quantity in stock
export type SizeStock = {
  [size: string]: number;
};

export const PRODUCT_COLLECTION = "Products" as const;

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  fabric: string;
  color: string;
  sizeStock: SizeStock;
  images: string[];
  featured: boolean;
  newArrival?: boolean;
}

export function formatCategoryLabel(category: ProductCategory): string {
  return PRODUCT_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

function isProductCategory(value: unknown): value is ProductCategory {
  return (
    value === "kurta" ||
    value === "kurti-set" ||
    value === "short-kurta"
  );
}

export function mapProductDoc(
  id: string,
  data: Record<string, unknown>
): Product {
  const imagesField = data.images ?? data.image;
  const images = Array.isArray(imagesField)
    ? (imagesField as unknown[])
        .filter((item) => typeof item === "string")
        .map((item) => item as string)
    : typeof imagesField === "string"
    ? [imagesField]
    : [];

  return {
    id,
    slug: typeof data.slug === "string" ? data.slug.trim() : "",
    name: typeof data.name === "string" ? data.name : "",
    category: isProductCategory(data.category) ? data.category : "kurta",
    price: Number(data.price ?? 0),
    fabric: typeof data.fabric === "string" ? data.fabric : "",
    color: typeof data.color === "string" ? data.color : "",
    sizeStock:
      typeof data.sizeStock === "object" && data.sizeStock !== null
        ? (data.sizeStock as SizeStock)
        : {},
    images,
    featured: Boolean(data.featured),
    newArrival: Boolean(data.newArrival),
  };
}

// ---------------------------------------------------------------------------
// Helper functions — used by UI now, ready for Razorpay / admin later
// ---------------------------------------------------------------------------

/** Returns stock count for a specific size. */
export function getSizeStock(product: Product, size: string): number {
  return product.sizeStock?.[size] ?? 0;
}

/** Returns all sizes that have stock > 0. */
export function getAvailableSizes(product: Product): string[] {
  return Object.entries(product.sizeStock ?? {})
    .filter(([, qty]) => qty > 0)
    .map(([size]) => size);
}

/** Returns true if a specific size has stock > 0. */
export function isSizeAvailable(product: Product, size: string): boolean {
  return getSizeStock(product, size) > 0;
}

/** Returns total stock across all sizes. */
export function getTotalStock(product: Product): number {
  return Object.values(product.sizeStock ?? {}).reduce(
    (sum, qty) => sum + qty,
    0
  );
}

/** Returns true if at least one size is in stock. */
export function isProductAvailable(product: Product): boolean {
  return getTotalStock(product) > 0;
}
