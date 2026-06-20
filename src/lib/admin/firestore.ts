import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Product, SizeStock } from "../data/products";
import { PRODUCT_COLLECTION, PRODUCT_CATEGORIES, mapProductDoc } from "../data/products";

const COL = PRODUCT_COLLECTION;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductFormData {
  name: string;
  slug: string;
  category: Product["category"];
  price: number;
  fabric: string;
  color: string;
  featured: boolean;
  newArrival: boolean;
  sizeStock: SizeStock;
  images: string[]; // Cloudinary URLs — written to Firestore as the "images" field
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function adminGetAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, COL));
  return snapshot.docs.map((d) =>
    mapProductDoc(d.id, d.data() as Record<string, unknown>)
  );
}

export async function adminGetProductById(id: string): Promise<Product | null> {
  const ref = doc(db, COL, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return mapProductDoc(snapshot.id, snapshot.data() as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// Write — always stores image URLs under the "images" key in Firestore
// ---------------------------------------------------------------------------

export async function adminAddProduct(data: ProductFormData): Promise<string> {
  const { images, ...rest } = data;
  const ref = await addDoc(collection(db, COL), {
    ...rest,
    images,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function adminUpdateProduct(
  id: string,
  data: Partial<ProductFormData>
): Promise<void> {
  const { images, ...rest } = data;
  await updateDoc(doc(db, COL, id), {
    ...rest,
    ...(images !== undefined ? { images } : {}),
    updatedAt: new Date().toISOString(),
  });
}

export async function adminDeleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------

export interface DashboardStats {
  total: number;
  featured: number;
  newArrivals: number;
  outOfStock: number;
  categories: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const products = await adminGetAllProducts();
  const categorySet = new Set(products.map((p) => p.category));

  return {
    total: products.length,
    featured: products.filter((p) => p.featured).length,
    newArrivals: products.filter((p) => p.newArrival).length,
    outOfStock: products.filter(
      (p) => Object.values(p.sizeStock ?? {}).reduce((s, q) => s + q, 0) === 0
    ).length,
    categories: PRODUCT_CATEGORIES.length,
  };
}
