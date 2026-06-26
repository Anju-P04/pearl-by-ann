"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminProcessRefund,
} from "@/lib/admin/firestore";
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/orders/firestore";
import StatusChangeConfirmationModal from "@/components/admin/StatusChangeConfirmationModal";
import RefundConfirmationModal from "@/components/admin/RefundConfirmationModal";
import {
  getValidNextStatuses,
  isStatusLocked,
  convertToWhatsAppPhone,
  buildConfirmationMessage,
  buildShippedMessage,
  buildDeliveredMessage,
  buildWhatsAppUrl,
} from "@/lib/orders/statusTransitions";

const STATUS_OPTIONS: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-100",
  Shipped: "bg-indigo-50 text-indigo-700 border-indigo-100",
  Delivered: "bg-green-50 text-green-700 border-green-100",
  Cancelled: "bg-red-50 text-red-700 border-red-100",
};

function formatItemsSummary(items: Order["items"]) {
  return items.map((item) => `${item.size} × ${item.quantity}`).join("\n");
}

function formatDate(date: string) {
  try {
    const dateObj = new Date(date);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(dateObj);
  } catch {
    return date;
  }
}

function formatTime(date: string) {
  try {
    const dateObj = new Date(date);
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(dateObj);
  } catch {
    return "";
  }
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function isToday(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === getToday().getTime();
  } catch {
    return false;
  }
}

function isThisMonth(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  } catch {
    return false;
  }
}

interface OrderAnalytics {
  totalOrders: number;
  statusCounts: Record<OrderStatus, number>;
  totalRevenue: number;
  deliveredRevenue: number;
  ordersToday: number;
  ordersThisMonth: number;
  recentOrders: Order[];
  codOrders: number;
  onlineOrders: number;
}

function computeAnalytics(orders: Order[]): OrderAnalytics {
  const statusCounts: Record<OrderStatus, number> = {
    Pending: 0,
    Confirmed: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };

  let totalRevenue = 0;
  let deliveredRevenue = 0;
  let ordersToday = 0;
  let ordersThisMonth = 0;
  let codOrders = 0;
  let onlineOrders = 0;

  orders.forEach((order) => {
    statusCounts[order.status]++;

    if (order.status !== "Cancelled") {
      totalRevenue += order.totalPrice;
    }

    if (order.status === "Delivered") {
      deliveredRevenue += order.totalPrice;
    }

    if (isToday(order.createdAt)) {
      ordersToday++;
    }

    if (isThisMonth(order.createdAt)) {
      ordersThisMonth++;
    }

    if (order.paymentMethod === "COD") {
      codOrders++;
    } else if (order.paymentMethod === "ONLINE") {
      onlineOrders++;
    }
  });

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return {
    totalOrders: orders.length,
    statusCounts,
    totalRevenue,
    deliveredRevenue,
    ordersToday,
    ordersThisMonth,
    recentOrders,
    codOrders,
    onlineOrders,
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusChangeModal, setStatusChangeModal] = useState<{
    orderId: string;
    currentStatus: OrderStatus;
    nextStatus: OrderStatus;
  } | null>(null);
  const [refundModal, setRefundModal] = useState<{
    orderId: string;
    orderAmount: number;
    paymentId: string;
  } | null>(null);
  const [refundLoading, setRefundLoading] = useState<Record<string, boolean>>({});
  const [refundSuccess, setRefundSuccess] = useState<Record<string, boolean>>({});

  useEffect(() => {
    adminGetAllOrders()
      .then(setOrders)
      .catch(() => setError("Unable to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const analytics = useMemo(() => computeAnalytics(orders), [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCustomerName = order.customerName.toLowerCase().includes(q);
        const matchPhone = order.customerPhone.includes(q);
        const matchProduct = order.productName.toLowerCase().includes(q);
        return matchCustomerName || matchPhone || matchProduct;
      }

      return true;
    });
  }, [orders, search, statusFilter]);

  const summaryCount = useMemo(() => filteredOrders.length, [filteredOrders]);

  function isRefundEligible(order: Order): boolean {
    return (
      order.paymentMethod === "ONLINE" &&
      order.paymentStatus === "Paid" &&
      order.status === "Cancelled" &&
      order.refundStatus !== "Processed"
    );
  }

  function handleRefundClick(orderId: string, orderAmount: number, paymentId: string) {
    setRefundModal({ orderId, orderAmount, paymentId });
  }

  async function processRefund() {
    if (!refundModal) return;

    const { orderId, orderAmount, paymentId } = refundModal;
    setRefundLoading(prev => ({ ...prev, [orderId]: true }));
    
    try {
      // Call Razorpay refund API
      const refundResponse = await fetch('/api/razorpay/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, amount: orderAmount }),
      });
      
      const refundResult = await refundResponse.json();
      
      if (!refundResult.success) {
        throw new Error(refundResult.details || 'Refund failed');
      }
      
      // Update Firestore with refund information
      await adminProcessRefund(orderId, {
        refundId: refundResult.refundId,
        refundAmount: refundResult.amount,
        refundedAt: new Date().toISOString(),
      });
      
      // Update local state
      setOrders(prev =>
        prev.map(o => 
          o.id === orderId 
            ? {
                ...o,
                refundId: refundResult.refundId,
                refundStatus: "Processed" as const,
                refundAmount: refundResult.amount,
                refundedAt: new Date().toISOString(),
                paymentStatus: "Refunded" as PaymentStatus,
              }
            : o
        )
      );
      
      setRefundSuccess(prev => ({ ...prev, [orderId]: true }));
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setRefundSuccess(prev => ({ ...prev, [orderId]: false }));
      }, 3000);
      
    } catch (error: any) {
      console.error('Refund processing failed:', error);
      setError(`Refund failed: ${error.message}`);
    } finally {
      setRefundLoading(prev => ({ ...prev, [orderId]: false }));
      setRefundModal(null);
    }
  }

  function handleStatusChangeClick(orderId: string, nextStatus: OrderStatus) {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    setStatusChangeModal({
      orderId,
      currentStatus: order.status,
      nextStatus,
    });
  }

  async function handleStatusChange(orderId: string, nextStatus: OrderStatus) {
    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      await adminUpdateOrderStatus(orderId, nextStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
    } catch {
      setError("Failed to update order status.");
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  async function confirmStatusChange() {
    if (!statusChangeModal) return;
    setStatusChangeModal(null);
    await handleStatusChange(statusChangeModal.orderId, statusChangeModal.nextStatus);
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h2 className="font-heading text-2xl font-semibold text-gray-800">
              Orders Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage all customer orders.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Analytics Cards */}
          {!loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-olive text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6h6v6m-3-6v6" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-800">{analytics.totalOrders}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-800">{analytics.statusCounts.Pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-800">{analytics.statusCounts.Confirmed}</p>
                <p className="text-xs text-gray-500">Confirmed</p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-800">{analytics.statusCounts.Shipped}</p>
                <p className="text-xs text-gray-500">Shipped</p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-800">{analytics.statusCounts.Delivered}</p>
                <p className="text-xs text-gray-500">Delivered</p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-800">{analytics.statusCounts.Cancelled}</p>
                <p className="text-xs text-gray-500">Cancelled</p>
              </div>
            </div>
          )}

          {/* Revenue & Time Analytics */}
          {!loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-bold text-olive">₹{analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-400">All non-cancelled orders</p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Delivered Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{analytics.deliveredRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Delivered orders only</p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Orders Today</p>
                <p className="text-2xl font-bold text-gray-800">{analytics.ordersToday}</p>
                <p className="text-xs text-gray-400">Created today</p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Orders This Month</p>
                <p className="text-2xl font-bold text-gray-800">{analytics.ordersThisMonth}</p>
                <p className="text-xs text-gray-400">Current month</p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider">COD Orders</p>
                <p className="text-2xl font-bold text-gray-800">{analytics.codOrders}</p>
                <p className="text-xs text-gray-400">Cash on Delivery</p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Online Orders</p>
                <p className="text-2xl font-bold text-gray-800">{analytics.onlineOrders}</p>
                <p className="text-xs text-gray-400">Pay Online</p>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search by name, phone, or product…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-64 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-olive focus:outline-none focus:ring-1 focus:ring-olive"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  statusFilter === "all"
                    ? "bg-olive text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                All Orders
              </button>
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    statusFilter === status
                      ? "bg-olive text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">
                {statusFilter === "all" ? "All Orders" : `${statusFilter} Orders`}
                <span className="ml-2 text-gray-500">({summaryCount})</span>
              </h3>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-olive border-t-transparent" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-20 text-center text-sm text-gray-400">
                  {search || statusFilter !== "all" ? "No orders match your filters." : "No orders available."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <th className="px-5 py-3">Customer</th>
                        <th className="px-5 py-3">Phone</th>
                        <th className="px-5 py-3">Product</th>
                        <th className="px-5 py-3">Items</th>
                        <th className="px-5 py-3">Total</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Payment</th>
                        <th className="px-5 py-3">Created</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-5 py-4">
                              <div className="font-medium text-gray-900">{order.customerName}</div>
                            </td>
                            <td className="px-5 py-4 text-gray-600 text-xs font-mono">{order.customerPhone}</td>
                            <td className="px-5 py-4 text-gray-600">{order.productName}</td>
                            <td className="px-5 py-4 whitespace-pre-line text-gray-600 text-xs">
                              {formatItemsSummary(order.items)}
                            </td>
                            <td className="px-5 py-4 font-semibold text-olive">₹{order.totalPrice}</td>
                            <td className="px-5 py-4">
                              {isStatusLocked(order.status) ? (
                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${STATUS_COLORS[order.status]}`}>
                                  {order.status}
                                </span>
                              ) : (
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    handleStatusChangeClick(order.id, e.target.value as OrderStatus)
                                  }
                                  disabled={updating[order.id]}
                                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-olive ${
                                    STATUS_COLORS[order.status]
                                  }`}
                                >
                                  <option value={order.status}>{order.status}</option>
                                  {getValidNextStatuses(order.status).map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium border ${
                                  order.paymentMethod === "COD"
                                    ? "bg-gray-50 text-gray-600 border-gray-200"
                                    : "bg-purple-50 text-purple-700 border-purple-100"
                                }`}>
                                  {order.paymentMethod}
                                </span>
                                <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium border ${
                                  order.paymentStatus === "Paid"
                                    ? "bg-green-50 text-green-700 border-green-100"
                                    : order.paymentStatus === "Failed"
                                    ? "bg-red-50 text-red-700 border-red-100"
                                    : order.paymentStatus === "Refunded"
                                    ? "bg-orange-50 text-orange-700 border-orange-100"
                                    : "bg-yellow-50 text-yellow-700 border-yellow-100"
                                }`}>
                                  {order.paymentStatus}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-gray-600 text-xs">
                              <div className="flex flex-col">
                                <span className="font-medium">{formatDate(order.createdAt)}</span>
                                <span className="text-gray-400">{formatTime(order.createdAt)}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex flex-wrap items-center justify-end gap-1.5">
                                {order.paymentMethod === "ONLINE" && (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                    className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-xs font-medium text-purple-700 transition hover:bg-purple-100"
                                  >
                                    {expandedOrder === order.id ? "Hide" : "Payment"} Details
                                  </button>
                                )}
                                {isRefundEligible(order) && order.razorpayPaymentId && (
                                  <button
                                    type="button"
                                    onClick={() => handleRefundClick(order.id, order.totalPrice, order.razorpayPaymentId!)}
                                    disabled={refundLoading[order.id]}
                                    className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                  >
                                    {refundLoading[order.id] ? "Processing..." : "Refund"}
                                  </button>
                                )}
                                {order.refundStatus === "Processed" && (
                                  <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-medium text-orange-700">
                                    Refund Completed
                                  </span>
                                )}
                                {refundSuccess[order.id] && (
                                  <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700">
                                    Refund Successful
                                  </span>
                                )}
                                {order.status === "Confirmed" && (
                                  <a
                                    href={buildWhatsAppUrl(
                                      convertToWhatsAppPhone(order.customerPhone),
                                      buildConfirmationMessage(
                                        order.customerName,
                                        order.productName,
                                        formatItemsSummary(order.items),
                                        order.totalItems,
                                        order.totalPrice
                                      )
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100"
                                    title="WhatsApp Confirm"
                                  >
                                    WA Confirm
                                  </a>
                                )}
                                {order.status === "Shipped" && (
                                  <a
                                    href={buildWhatsAppUrl(
                                      convertToWhatsAppPhone(order.customerPhone),
                                      buildShippedMessage(
                                        order.customerName,
                                        order.productName,
                                        formatItemsSummary(order.items)
                                      )
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                                    title="WhatsApp Shipped"
                                  >
                                    WA Shipped
                                  </a>
                                )}
                                {order.status === "Delivered" && (
                                  <a
                                    href={buildWhatsAppUrl(
                                      convertToWhatsAppPhone(order.customerPhone),
                                      buildDeliveredMessage(order.customerName)
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100"
                                    title="WhatsApp Delivered"
                                  >
                                    WA Delivered
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => adminGetAllOrders().then(setOrders)}
                                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                  Refresh
                                </button>
                              </div>
                            </td>
                          </tr>
                          {/* Payment Details Expansion Row */}
                          {expandedOrder === order.id && order.paymentMethod === "ONLINE" && (
                            <tr>
                              <td colSpan={9} className="px-5 py-4 bg-purple-50 border-t border-purple-100">
                                <div className="rounded-lg bg-white p-4 shadow-sm">
                                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Payment Details</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div>
                                      <p className="text-gray-500 font-medium mb-1">Payment Method</p>
                                      <p className="text-gray-800 font-mono">{order.paymentMethod}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 font-medium mb-1">Payment Status</p>
                                      <p className="text-gray-800 font-mono">{order.paymentStatus}</p>
                                    </div>
                                    {order.razorpayOrderId && (
                                      <div>
                                        <p className="text-gray-500 font-medium mb-1">Razorpay Order ID</p>
                                        <p className="text-gray-800 font-mono text-xs break-all">{order.razorpayOrderId}</p>
                                      </div>
                                    )}
                                    {order.razorpayPaymentId && (
                                      <div>
                                        <p className="text-gray-500 font-medium mb-1">Razorpay Payment ID</p>
                                        <p className="text-gray-800 font-mono text-xs break-all">{order.razorpayPaymentId}</p>
                                      </div>
                                    )}
                                    {order.razorpaySignature && (
                                      <div className="md:col-span-2">
                                        <p className="text-gray-500 font-medium mb-1">Razorpay Signature</p>
                                        <p className="text-gray-800 font-mono text-xs break-all">{order.razorpaySignature}</p>
                                      </div>
                                    )}
                                    {order.paidAt && (
                                      <div>
                                        <p className="text-gray-500 font-medium mb-1">Paid At</p>
                                        <div className="text-gray-800 font-mono text-xs">
                                          <div>{formatDate(order.paidAt)}</div>
                                          <div className="text-gray-600">{formatTime(order.paidAt)}</div>
                                        </div>
                                      </div>
                                    )}
                                    {order.refundStatus && (
                                      <div>
                                        <p className="text-gray-500 font-medium mb-1">Refund Status</p>
                                        <p className="text-gray-800 font-mono">{order.refundStatus}</p>
                                      </div>
                                    )}
                                    {order.refundAmount && (
                                      <div>
                                        <p className="text-gray-500 font-medium mb-1">Refund Amount</p>
                                        <p className="text-gray-800 font-mono">₹{order.refundAmount}</p>
                                      </div>
                                    )}
                                    {order.refundId && (
                                      <div>
                                        <p className="text-gray-500 font-medium mb-1">Refund ID</p>
                                        <p className="text-gray-800 font-mono text-xs break-all">{order.refundId}</p>
                                      </div>
                                    )}
                                    {order.refundedAt && (
                                      <div>
                                        <p className="text-gray-500 font-medium mb-1">Refund Date</p>
                                        <div className="text-gray-800 font-mono text-xs">
                                          <div>{formatDate(order.refundedAt)}</div>
                                          <div className="text-gray-600">{formatTime(order.refundedAt)}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {statusChangeModal && (
          <StatusChangeConfirmationModal
            currentStatus={statusChangeModal.currentStatus}
            nextStatus={statusChangeModal.nextStatus}
            onConfirm={confirmStatusChange}
            onCancel={() => setStatusChangeModal(null)}
            loading={updating[statusChangeModal.orderId]}
          />
        )}

        {refundModal && (
          <RefundConfirmationModal
            orderAmount={refundModal.orderAmount}
            onConfirm={processRefund}
            onCancel={() => setRefundModal(null)}
            loading={refundLoading[refundModal.orderId]}
          />
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
