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

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface OrderItem {
  size: string;
  quantity: number;
}

export const ORDER_COLLECTION = "Orders" as const;

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  items: OrderItem[];
  totalItems: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export type CreateOrderData = Omit<Order, "id" | "status" | "createdAt"> & {
  status?: OrderStatus;
};

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    value === "Pending" ||
    value === "Confirmed" ||
    value === "Shipped" ||
    value === "Delivered" ||
    value === "Cancelled"
  );
}

function isOrderItem(value: unknown): value is OrderItem {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).size === "string" &&
    typeof (value as Record<string, unknown>).quantity === "number"
  );
}

function normalizeOrderItems(data: Record<string, unknown>): OrderItem[] {
  const rawItems = data.items;
  if (Array.isArray(rawItems)) {
    return rawItems
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map((item) => ({
        size: typeof item.size === "string" ? item.size : "",
        quantity: Number(item.quantity ?? 0),
      }))
      .filter((item) => item.size !== "" && item.quantity > 0);
  }

  const legacySize = typeof data.size === "string" ? data.size : "";
  const legacyQuantity = Number(data.quantity ?? 0);
  if (legacySize && legacyQuantity > 0) {
    return [{ size: legacySize, quantity: legacyQuantity }];
  }

  return [];
}

function mapOrderDoc(id: string, data: Record<string, unknown>): Order {
  const items = normalizeOrderItems(data);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id,
    customerName: typeof data.customerName === "string" ? data.customerName : "",
    customerPhone: typeof data.customerPhone === "string" ? data.customerPhone : "",
    productId: typeof data.productId === "string" ? data.productId : "",
    productName: typeof data.productName === "string" ? data.productName : "",
    productSlug: typeof data.productSlug === "string" ? data.productSlug : "",
    productImage: typeof data.productImage === "string" ? data.productImage : "",
    items,
    totalItems,
    unitPrice: Number(data.unitPrice ?? 0),
    totalPrice: Number(data.totalPrice ?? totalItems * Number(data.unitPrice ?? 0)),
    status: isOrderStatus(data.status) ? data.status : "Pending",
    createdAt: typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString(),
  };
}

const COL = ORDER_COLLECTION;

export async function createOrder(data: CreateOrderData): Promise<string> {
  const totalItems = data.totalItems ?? data.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = data.totalPrice ?? totalItems * data.unitPrice;

  const payload = {
    ...data,
    totalItems,
    totalPrice,
    status: data.status ?? "Pending",
    createdAt: new Date().toISOString(),
  };

  const ref = await addDoc(collection(db, COL), payload as Omit<Order, "id">);
  return ref.id;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const ref = doc(db, COL, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return mapOrderDoc(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function getAllOrders(): Promise<Order[]> {
  const snapshot = await getDocs(collection(db, COL));
  return snapshot.docs.map((doc) =>
    mapOrderDoc(doc.id, doc.data() as Record<string, unknown>)
  );
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<void> {
  await updateDoc(doc(db, COL, id), { status });
}

export async function deleteOrder(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
