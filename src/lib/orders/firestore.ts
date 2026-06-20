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

export const ORDER_COLLECTION = "Orders" as const;

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  size: string;
  quantity: number;
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

function mapOrderDoc(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    customerName: typeof data.customerName === "string" ? data.customerName : "",
    customerPhone: typeof data.customerPhone === "string" ? data.customerPhone : "",
    productId: typeof data.productId === "string" ? data.productId : "",
    productName: typeof data.productName === "string" ? data.productName : "",
    productSlug: typeof data.productSlug === "string" ? data.productSlug : "",
    productImage: typeof data.productImage === "string" ? data.productImage : "",
    size: typeof data.size === "string" ? data.size : "",
    quantity: Number(data.quantity ?? 0),
    unitPrice: Number(data.unitPrice ?? 0),
    totalPrice: Number(data.totalPrice ?? 0),
    status: isOrderStatus(data.status) ? data.status : "Pending",
    createdAt: typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString(),
  };
}

const COL = ORDER_COLLECTION;

export async function createOrder(data: CreateOrderData): Promise<string> {
  const payload = {
    ...data,
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
