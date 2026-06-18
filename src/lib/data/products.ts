export type ProductCategory = "kurta" | "kurti-set";

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  fabric: string;
  color: string;
  sizes: ProductSize[];
  images: string[];
  featured: boolean;
  stock: number;
}

const products: Product[] = [
  {
    id: "1",
    slug: "thread-worked-brocade-kurti",
    name: "Thread Worked Brocade Kurti",
    category: "kurta",
    price: 699,
    description:
      "Elegant brocade kurti with intricate thread work detailing. The rich purple tone and fine craftsmanship make it a perfect festive pick.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Purple"],
    images: [
      "/Images/Products/brocade-kurti/1.jpeg",
      "/Images/Products/brocade-kurti/2.jpeg",
      "/Images/Products/brocade-kurti/3.jpeg",
    ],
    badge: "bestseller",
    isAvailable: true,
  },
  {
    id: "2",
    slug: "a-line-kurti",
    name: "A Line Kurti",
    category: "kurta",
    price: 850,
    description:
      "Graceful A-line silhouette in airy Mul Chanderi fabric. Blue with white tones make this a versatile everyday and occasion wear.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Blue with White"],
    images: [
      "/Images/Products/a-line-kurti/1.jpeg",
      "/Images/Products/a-line-kurti/2.jpeg",
    ],
    isAvailable: true,
  },
  {
    id: "3",
    slug: "flattering-flared-fit-kurti",
    name: "Flattering Flared Fit Kurti",
    category: "kurta",
    price: 799,
    description:
      "Flowy flared fit kurti crafted in Crushed Chiffon for a lightweight, breezy feel. Drapes beautifully and flatters all body types.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Multicolor"],
    images: [
      "/Images/Products/flarred-kurti/1.jpeg",
      "/Images/Products/flarred-kurti/2.jpeg",
    ],
    isAvailable: true,
  },
  {
    id: "4",
    slug: "pleated-kurti",
    name: "Pleated Kurti",
    category: "kurta",
    price: 859,
    description:
      "Soft Mul Chanderi pleated kurti in a delightful butter yellow. The pleated front adds structure and movement to a classic silhouette.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Butter Yellow"],
    images: [
      "/Images/Products/crushed-kurti/1.jpeg",
      "/Images/Products/crushed-kurti/2.jpeg",
    ],
    badge: "new",
    isAvailable: true,
  },
  {
    id: "5",
    slug: "office-wear-3-piece-kurti-set",
    name: "Office Wear 3 Piece Kurti Set",
    category: "kurti-set",
    price: 1199,
    description:
      "A polished 3-piece cotton kurti set designed for the modern workplace. Breathable, structured, and effortlessly put-together.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Multicolor"],
    images: [
      "/Images/Products/ofz-kurti/1.jpeg",
    ],
    badge: "new",
    isAvailable: true,
  },
  {
    id: "6",
    slug: "3-piece-kurti-set",
    name: "3 Piece Kurti Set",
    category: "kurti-set",
    price: 1259,
    description:
      "Complete 3-piece cotton kurti set — kurti, dupatta, and bottom. A coordinated look that takes you from casual outings to festive gatherings.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Multicolor"],
    images: [
      "/Images/Products/three-piece/1.jpeg",
      "/Images/Products/three-piece/2.jpeg",
    ],
    badge: "new",
    isAvailable: true,
  },
];

export function getAllProducts(): Product[] {
  return products;
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.badge === "bestseller" || p.badge === "new");
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter((p) => p.category === category);
}