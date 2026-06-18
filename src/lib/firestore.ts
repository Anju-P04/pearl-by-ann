import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "./data/products";

const COL = "Products";

function mapProduct(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    slug: (data.slug as string)?.trim(),
    name: data.name as string,
    category: data.category as Product["category"],
    price: data.price as number,
    fabric: data.fabric as string,
    color: data.color as string,
    sizes: data.sizes as Product["sizes"],

    // Supports both single image and multiple images
    images: Array.isArray(data.image)
      ? (data.image as string[])
      : data.image
      ? [data.image as string]
      : [],

    featured: Boolean(data.featured),
    stock: Number(data.stock ?? 0),
  };
}

export async function getProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, COL));

  return snapshot.docs.map((doc) =>
    mapProduct(doc.id, doc.data() as Record<string, unknown>)
  );
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const q = query(collection(db, COL), where("featured", "==", true));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) =>
    mapProduct(doc.id, doc.data() as Record<string, unknown>)
  );
}

export async function getProductsByCategory(
  category: string
): Promise<Product[]> {
  const q = query(collection(db, COL), where("category", "==", category));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) =>
    mapProduct(doc.id, doc.data() as Record<string, unknown>)
  );
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const snapshot = await getDocs(collection(db, COL));

  const product = snapshot.docs.find((doc) => {
    const data = doc.data();
    return (data.slug as string)?.trim() === slug.trim();
  });

  if (!product) return null;

  return mapProduct(
    product.id,
    product.data() as Record<string, unknown>
  );
}

export async function getProductsGroupedByCategory(): Promise<
  Record<string, Product[]>
> {
  const products = await getProducts();

  return products.reduce((acc, product) => {
    const category = product.category || "other";

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(product);

    return acc;
  }, {} as Record<string, Product[]>);
}