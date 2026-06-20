"use client";

import { useEffect, useMemo, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  adminGetAllOrders,
  adminUpdateOrderStatus,
} from "@/lib/admin/firestore";
import type { Order, OrderStatus } from "@/lib/orders/firestore";
import StatusChangeConfirmationModal from "@/components/admin/StatusChangeConfirmationModal";
import {
  getValidNextStatuses,
  isStatusLocked,
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
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return date;
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
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [statusChangeModal, setStatusChangeModal] = useState<{
    orderId: string;
    currentStatus: OrderStatus;
    nextStatus: OrderStatus;
  } | null>(null);

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
                        <th className="px-5 py-3">Created</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
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
                          <td className="px-5 py-4 text-gray-600 text-xs">{formatDate(order.createdAt)}</td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => adminGetAllOrders().then(setOrders)}
                              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                              Refresh
                            </button>
                          </td>
                        </tr>
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
      </AdminLayout>
    </AdminGuard>
  );
}
