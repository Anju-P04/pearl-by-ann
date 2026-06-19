import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "./data/products";
import { PRODUCT_COLLECTION, mapProductDoc } from "./data/products";

const COL = PRODUCT_COLLECTION;

export async function getProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, COL));
  return snapshot.docs.map((doc) =>
    mapProductDoc(doc.id, doc.data() as Record<string, unknown>)
  );
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const q = query(collection(db, COL), where("featured", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) =>
    mapProductDoc(doc.id, doc.data() as Record<string, unknown>)
  );
}

export async function getProductsByCategory(
  category: Product["category"]
): Promise<Product[]> {
  const q = query(collection(db, COL), where("category", "==", category));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) =>
    mapProductDoc(doc.id, doc.data() as Record<string, unknown>)
  );
}

function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const q = query(collection(db, COL), where("slug", "==", slug));
  const snapshot = await getDocs(q);
  const doc = snapshot.docs[0];
  if (doc) {
    return mapProductDoc(doc.id, doc.data() as Record<string, unknown>);
  }

  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return null;

  const fallbackSnapshot = await getDocs(collection(db, COL));
  const fallbackDoc = fallbackSnapshot.docs.find((candidate) => {
    const data = candidate.data() as Record<string, unknown>;
    const storedSlug = typeof data.slug === "string" ? data.slug : "";
    return (
      storedSlug === slug ||
      storedSlug.trim() === slug ||
      normalizeSlug(storedSlug) === normalizedSlug
    );
  });

  if (!fallbackDoc) return null;
  return mapProductDoc(fallbackDoc.id, fallbackDoc.data() as Record<string, unknown>);
}

export async function getProductsGroupedByCategory(): Promise<
  Record<string, Product[]>
> {
  const products = await getProducts();
  return products.reduce((acc, product) => {
    const cat = product.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
}
