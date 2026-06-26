import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Product, SizeStock } from "../data/products";
import {
  PRODUCT_COLLECTION,
  PRODUCT_CATEGORIES,
  mapProductDoc,
} from "../data/products";
import type { Order } from "../orders/firestore";
import { ORDER_COLLECTION } from "../orders/firestore";
import {
  getAllOrders as getAllOrdersFromOrders,
  getAllOrdersSortedByDate as getAllOrdersSortedByDateFromOrders,
  updateOrderStatus as updateOrderStatusFromOrders,
} from "../orders/firestore";
import { getOrderById } from "../orders/firestore";
import { isValidTransition } from "../orders/statusTransitions";

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

export async function adminGetAllOrders(): Promise<Order[]> {
  return getAllOrdersSortedByDateFromOrders();
}

export async function adminUpdateOrderStatus(
  id: string,
  nextStatus: Order["status"]
): Promise<void> {
  // Fetch current order to validate transition
  const order = await getOrderById(id);
  if (!order) {
    throw new Error("Order not found.");
  }

  // Validate transition
  if (!isValidTransition(order.status, nextStatus)) {
    throw new Error(
      `Invalid status transition from ${order.status} to ${nextStatus}.`
    );
  }

  // Perform update
  await updateOrderStatusFromOrders(id, nextStatus);
}

export interface OrderDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

export interface BusinessAnalytics {
  totalOrders: number;
  todaysOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todaysRevenue: number;
  onlinePayments: number;
  codOrders: number;
  totalProducts: number;
}

export interface LowStockItem {
  productId: string;
  productName: string;
  size: string;
  stock: number;
  isOutOfStock: boolean;
}

export interface LowStockData {
  items: LowStockItem[];
  totalCount: number;
  outOfStockCount: number;
  lowStockCount: number;
}

export interface SalesAnalytics {
  bestSellingProduct: {
    name: string;
    unitsSold: number;
  } | null;
  bestSellingSize: {
    size: string;
    unitsSold: number;
  } | null;
  totalUnitsSold: number;
  totalRevenue: number;
  averageOrderValue: number;
  paymentMethodStats: {
    codPercentage: number;
    onlinePercentage: number;
    codRevenue: number;
    onlineRevenue: number;
  };
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
  dailyRevenue: {
    date: string;
    revenue: number;
  }[];
}

export async function getOrderDashboardStats(): Promise<OrderDashboardStats> {
  const orders = await adminGetAllOrders();

  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === "Pending").length,
    deliveredOrders: orders.filter((order) => order.status === "Delivered").length,
    cancelledOrders: orders.filter((order) => order.status === "Cancelled").length,
  };
}

// Helper function to check if a date is today
function isToday(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
}

export async function adminProcessRefund(
  orderId: string,
  refundData: {
    refundId: string;
    refundAmount: number;
    refundedAt: string;
  }
): Promise<void> {
  const orderRef = doc(db, ORDER_COLLECTION, orderId);
  
  await runTransaction(db, async (transaction) => {
    // Read current order data
    const orderDoc = await transaction.get(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error("Order not found");
    }
    
    const orderData = orderDoc.data();
    
    // Prevent duplicate refunds
    if (orderData.refundStatus === "Processed") {
      throw new Error("Order has already been refunded");
    }
    
    // Validate order is eligible for refund
    if (
      orderData.paymentMethod !== "ONLINE" ||
      orderData.paymentStatus !== "Paid" ||
      orderData.status !== "Cancelled"
    ) {
      throw new Error("Order is not eligible for refund");
    }
    
    // Update order with refund information
    transaction.update(orderRef, {
      refundId: refundData.refundId,
      refundStatus: "Processed",
      refundAmount: refundData.refundAmount,
      refundedAt: refundData.refundedAt,
      paymentStatus: "Refunded",
      updatedAt: new Date().toISOString(),
    });
  });
}

// Helper function to calculate revenue from orders (updated to exclude refunded orders)
function calculateRevenue(orders: Order[]): number {
  return orders.reduce((total, order) => {
    // Include revenue only for:
    // 1. Orders with paymentStatus = "Paid" (ONLINE payments) - but not refunded
    // 2. Delivered COD orders
    // 3. Exclude cancelled orders
    // 4. Exclude refunded orders
    if (order.status === "Cancelled" || order.paymentStatus === "Refunded") {
      return total;
    }
    
    if (
      order.paymentStatus === "Paid" || 
      (order.paymentMethod === "COD" && order.status === "Delivered")
    ) {
      return total + order.totalPrice;
    }
    
    return total;
  }, 0);
}

export async function getBusinessAnalytics(): Promise<BusinessAnalytics> {
  const [orders, products] = await Promise.all([
    adminGetAllOrders(),
    adminGetAllProducts(),
  ]);

  const todaysOrders = orders.filter(order => isToday(order.createdAt));

  return {
    totalOrders: orders.length,
    todaysOrders: todaysOrders.length,
    pendingOrders: orders.filter(order => order.status === "Pending").length,
    deliveredOrders: orders.filter(order => order.status === "Delivered").length,
    cancelledOrders: orders.filter(order => order.status === "Cancelled").length,
    totalRevenue: calculateRevenue(orders),
    todaysRevenue: calculateRevenue(todaysOrders),
    onlinePayments: orders.filter(order => order.paymentMethod === "ONLINE").length,
    codOrders: orders.filter(order => order.paymentMethod === "COD").length,
    totalProducts: products.length,
  };
}

export async function getLowStockData(): Promise<LowStockData> {
  const products = await adminGetAllProducts();
  const lowStockItems: LowStockItem[] = [];

  products.forEach(product => {
    Object.entries(product.sizeStock || {}).forEach(([size, stock]) => {
      if (stock <= 2) {
        lowStockItems.push({
          productId: product.id,
          productName: product.name,
          size,
          stock,
          isOutOfStock: stock === 0,
        });
      }
    });
  });

  // Sort: Out of stock first, then by lowest stock
  lowStockItems.sort((a, b) => {
    if (a.isOutOfStock && !b.isOutOfStock) return -1;
    if (!a.isOutOfStock && b.isOutOfStock) return 1;
    return a.stock - b.stock;
  });

  const outOfStockCount = lowStockItems.filter(item => item.isOutOfStock).length;
  const lowStockCount = lowStockItems.filter(item => !item.isOutOfStock).length;

  return {
    items: lowStockItems,
    totalCount: lowStockItems.length,
    outOfStockCount,
    lowStockCount,
  };
}

// Helper function to get successful orders (exclude cancelled and refunded)
function getSuccessfulOrders(orders: Order[]): Order[] {
  return orders.filter(order => 
    order.status !== "Cancelled" && 
    order.paymentStatus !== "Refunded"
  );
}

// Helper function to format month from date
function formatMonth(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short'
    }).format(date);
  } catch {
    return 'Unknown';
  }
}

// Helper function to format date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch {
    return 'Unknown';
  }
}

export async function getSalesAnalytics(): Promise<SalesAnalytics> {
  const orders = await adminGetAllOrders();
  const successfulOrders = getSuccessfulOrders(orders);
  
  // Calculate product sales
  const productSales = new Map<string, number>();
  const sizeSales = new Map<string, number>();
  let totalUnitsSold = 0;
  let totalRevenue = 0;
  let codRevenue = 0;
  let onlineRevenue = 0;
  
  successfulOrders.forEach(order => {
    // Count units sold per product
    const currentProductSales = productSales.get(order.productName) || 0;
    productSales.set(order.productName, currentProductSales + order.totalItems);
    
    // Count units sold per size
    order.items.forEach(item => {
      const currentSizeSales = sizeSales.get(item.size) || 0;
      sizeSales.set(item.size, currentSizeSales + item.quantity);
      totalUnitsSold += item.quantity;
    });
    
    // Calculate revenue (only for paid orders)
    const orderRevenue = calculateRevenue([order]);
    totalRevenue += orderRevenue;
    
    if (orderRevenue > 0) {
      if (order.paymentMethod === "COD") {
        codRevenue += orderRevenue;
      } else {
        onlineRevenue += orderRevenue;
      }
    }
  });
  
  // Find best selling product
  let bestSellingProduct = null;
  if (productSales.size > 0) {
    const [name, unitsSold] = Array.from(productSales.entries())
      .reduce((max, current) => current[1] > max[1] ? current : max);
    bestSellingProduct = { name, unitsSold };
  }
  
  // Find best selling size
  let bestSellingSize = null;
  if (sizeSales.size > 0) {
    const [size, unitsSold] = Array.from(sizeSales.entries())
      .reduce((max, current) => current[1] > max[1] ? current : max);
    bestSellingSize = { size, unitsSold };
  }
  
  // Calculate payment method percentages
  const totalPaymentRevenue = codRevenue + onlineRevenue;
  const codPercentage = totalPaymentRevenue > 0 ? Math.round((codRevenue / totalPaymentRevenue) * 100) : 0;
  const onlinePercentage = totalPaymentRevenue > 0 ? Math.round((onlineRevenue / totalPaymentRevenue) * 100) : 0;
  
  // Calculate monthly revenue (last 6 months)
  const monthlyRevenueMap = new Map<string, number>();
  successfulOrders.forEach(order => {
    const month = formatMonth(order.createdAt);
    const orderRevenue = calculateRevenue([order]);
    const currentRevenue = monthlyRevenueMap.get(month) || 0;
    monthlyRevenueMap.set(month, currentRevenue + orderRevenue);
  });
  
  const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6); // Last 6 months
  
  // Calculate daily revenue (last 7 days)
  const dailyRevenueMap = new Map<string, number>();
  const last7Days = successfulOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return orderDate >= sevenDaysAgo;
  });
  
  last7Days.forEach(order => {
    const date = formatDate(order.createdAt);
    const orderRevenue = calculateRevenue([order]);
    const currentRevenue = dailyRevenueMap.get(date) || 0;
    dailyRevenueMap.set(date, currentRevenue + orderRevenue);
  });
  
  const dailyRevenue = Array.from(dailyRevenueMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate average order value
  const revenueGeneratingOrders = successfulOrders.filter(order => calculateRevenue([order]) > 0);
  const averageOrderValue = revenueGeneratingOrders.length > 0 
    ? Math.round(totalRevenue / revenueGeneratingOrders.length) 
    : 0;
  
  return {
    bestSellingProduct,
    bestSellingSize,
    totalUnitsSold,
    totalRevenue,
    averageOrderValue,
    paymentMethodStats: {
      codPercentage,
      onlinePercentage,
      codRevenue,
      onlineRevenue,
    },
    monthlyRevenue,
    dailyRevenue,
  };
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
