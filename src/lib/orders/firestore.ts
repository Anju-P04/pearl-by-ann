import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";
import { deductInventoryForOrder, restoreInventoryForOrder } from "../inventory/firestore";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type PaymentMethod = "COD" | "ONLINE";

export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";

export type RefundStatus = "Processed";

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
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  // Razorpay transaction details (optional for COD orders)
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: string;
  // Refund fields (optional)
  refundId?: string;
  refundStatus?: RefundStatus;
  refundAmount?: number;
  refundedAt?: string;
  // Inventory tracking
  inventoryRestored?: boolean;
}

export type CreateOrderData = Omit<Order, "id" | "status" | "paymentStatus" | "createdAt"> & {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: string;
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
    paymentMethod: (data.paymentMethod === "COD" || data.paymentMethod === "ONLINE") ? data.paymentMethod as PaymentMethod : "COD",
    paymentStatus: (data.paymentStatus === "Pending" || data.paymentStatus === "Paid" || data.paymentStatus === "Failed" || data.paymentStatus === "Refunded") ? data.paymentStatus as PaymentStatus : "Pending",
    createdAt: typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString(),
    // Optional Razorpay fields
    ...(typeof data.razorpayOrderId === "string" && { razorpayOrderId: data.razorpayOrderId }),
    ...(typeof data.razorpayPaymentId === "string" && { razorpayPaymentId: data.razorpayPaymentId }),
    ...(typeof data.razorpaySignature === "string" && { razorpaySignature: data.razorpaySignature }),
    ...(typeof data.paidAt === "string" && { paidAt: data.paidAt }),
    // Optional refund fields
    ...(typeof data.refundId === "string" && { refundId: data.refundId }),
    ...(data.refundStatus === "Processed" && { refundStatus: data.refundStatus }),
    ...(typeof data.refundAmount === "number" && { refundAmount: data.refundAmount }),
    ...(typeof data.refundedAt === "string" && { refundedAt: data.refundedAt }),
    // Inventory tracking field (defaults to false for existing orders)
    inventoryRestored: Boolean(data.inventoryRestored),
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
    paymentStatus: data.paymentStatus ?? "Pending",
    createdAt: new Date().toISOString(),
  };

  // Create the order first
  const ref = await addDoc(collection(db, COL), payload as Omit<Order, "id">);
  const orderId = ref.id;

  // After successful order creation, deduct inventory
  try {
    const inventoryResult = await deductInventoryForOrder(data.productId, data.items);
    
    if (!inventoryResult.success) {
      // If inventory deduction fails, we should ideally rollback the order
      // For now, we'll throw an error to prevent the order from being considered successful
      throw new Error(`Inventory deduction failed: ${inventoryResult.error}`);
    }
  } catch (inventoryError) {
    // Log the error but don't fail the order creation to avoid data inconsistency
    // In a production system, you might want to implement a compensation pattern
    console.error("Failed to deduct inventory for order:", orderId, inventoryError);
    throw inventoryError;
  }

  return orderId;
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

export async function getAllOrdersSortedByDate(): Promise<Order[]> {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) =>
    mapOrderDoc(doc.id, doc.data() as Record<string, unknown>)
  );
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<void> {
  const orderRef = doc(db, COL, id);
  
  // Use transaction to ensure consistent updates
  await runTransaction(db, async (transaction) => {
    // Read current order data
    const orderDoc = await transaction.get(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error("Order not found");
    }
    
    const orderData = orderDoc.data();
    const currentStatus = orderData.status as OrderStatus;
    const inventoryRestored = Boolean(orderData.inventoryRestored);
    
    // Check if we're cancelling an order and need to restore inventory
    const shouldRestoreInventory = 
      status === "Cancelled" && 
      (currentStatus === "Pending" || currentStatus === "Confirmed") &&
      !inventoryRestored;
    
    if (shouldRestoreInventory) {
      // Restore inventory first
      const restoreResult = await restoreInventoryForOrder(
        orderData.productId,
        orderData.items
      );
      
      if (!restoreResult.success) {
        throw new Error(`Failed to restore inventory: ${restoreResult.error}`);
      }
      
      // Update order with new status and mark inventory as restored
      transaction.update(orderRef, {
        status,
        inventoryRestored: true,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Update only status
      transaction.update(orderRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
    }
  });
}

export async function deleteOrder(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
