"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getBusinessAnalytics,
  getLowStockData,
  getSalesAnalytics,
  type BusinessAnalytics,
  type LowStockData,
  type SalesAnalytics,
} from "@/lib/admin/firestore";

interface StatCard {
  key: keyof BusinessAnalytics;
  label: string;
  color: string;
  icon: React.JSX.Element;
  formatter?: (value: number) => string;
}

const BUSINESS_STATS: StatCard[] = [
  {
    key: "totalOrders",
    label: "Total Orders",
    color: "bg-olive",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6h6v6m-3-6v6" />
      </svg>
    ),
  },
  {
    key: "todaysOrders",
    label: "Today's Orders",
    color: "bg-blue-500",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "pendingOrders",
    label: "Pending Orders",
    color: "bg-yellow-500",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "deliveredOrders",
    label: "Delivered Orders",
    color: "bg-green-600",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    key: "cancelledOrders",
    label: "Cancelled Orders",
    color: "bg-red-500",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    color: "bg-purple-600",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    formatter: (value) => `₹${value.toLocaleString()}`,
  },
  {
    key: "todaysRevenue",
    label: "Today's Revenue",
    color: "bg-indigo-600",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    formatter: (value) => `₹${value.toLocaleString()}`,
  },
  {
    key: "onlinePayments",
    label: "Online Payments",
    color: "bg-teal-600",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    key: "codOrders",
    label: "COD Orders",
    color: "bg-amber-600",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    key: "totalProducts",
    label: "Total Products",
    color: "bg-rose-600",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [lowStockData, setLowStockData] = useState<LowStockData | null>(null);
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getBusinessAnalytics(), getLowStockData(), getSalesAnalytics()])
      .then(([analyticsData, lowStock, salesData]) => {
        setAnalytics(analyticsData);
        setLowStockData(lowStock);
        setSalesAnalytics(salesData);
      })
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-gray-800">
              Business Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Real-time analytics and insights for Pearl by Ann.
            </p>
          </div>

          {/* Business Analytics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {BUSINESS_STATS.map((stat) => {
              const value = analytics?.[stat.key] ?? 0;
              const displayValue = stat.formatter ? stat.formatter(value) : value.toString();
              
              return (
                <div
                  key={stat.key}
                  className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} text-white`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {loading ? "—" : displayValue}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue Insights */}
          {!loading && analytics && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-heading text-lg font-semibold text-gray-800">
                Revenue Insights
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Revenue per Order</p>
                  <p className="text-xl font-bold text-olive">
                    ₹{analytics.totalOrders > 0 ? Math.round(analytics.totalRevenue / analytics.totalOrders).toLocaleString() : 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Online vs COD</p>
                  <div className="flex justify-center gap-4 text-sm">
                    <span className="text-teal-600">{analytics.onlinePayments} Online</span>
                    <span className="text-amber-600">{analytics.codOrders} COD</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Completion Rate</p>
                  <p className="text-xl font-bold text-green-600">
                    {analytics.totalOrders > 0 ? Math.round((analytics.deliveredOrders / analytics.totalOrders) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sales Analytics */}
          {!loading && salesAnalytics && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-xl font-semibold text-gray-800">
                  Sales Analytics
                </h3>
                <p className="text-sm text-gray-500">
                  Insights from successful orders (excluding cancelled orders).
                </p>
              </div>
              
              {/* Key Sales Metrics */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white mb-3">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{salesAnalytics.totalUnitsSold}</p>
                  <p className="text-xs text-gray-500">Total Units Sold</p>
                </div>
                
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white mb-3">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">₹{salesAnalytics.averageOrderValue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Average Order Value</p>
                </div>
                
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white mb-3">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      {salesAnalytics.bestSellingProduct?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Best Product ({salesAnalytics.bestSellingProduct?.unitsSold || 0} sold)
                    </p>
                  </div>
                </div>
                
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white mb-3">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      {salesAnalytics.bestSellingSize?.size || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Best Size ({salesAnalytics.bestSellingSize?.unitsSold || 0} sold)
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Payment Method Analytics */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h4 className="mb-4 font-heading text-lg font-semibold text-gray-800">
                  Payment Method Distribution
                </h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-600">{salesAnalytics.paymentMethodStats.codPercentage}%</p>
                    <p className="text-sm text-gray-600">COD Orders</p>
                    <p className="text-xs text-gray-400">₹{salesAnalytics.paymentMethodStats.codRevenue.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-teal-600">{salesAnalytics.paymentMethodStats.onlinePercentage}%</p>
                    <p className="text-sm text-gray-600">Online Payments</p>
                    <p className="text-xs text-gray-400">₹{salesAnalytics.paymentMethodStats.onlineRevenue.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-800">₹{(salesAnalytics.paymentMethodStats.codRevenue + salesAnalytics.paymentMethodStats.onlineRevenue).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-xs text-gray-400">From successful orders</p>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 h-4 w-full rounded-full bg-gray-200">
                      <div 
                        className="h-4 rounded-full bg-gradient-to-r from-amber-500 to-teal-500"
                        style={{ width: `${Math.max(salesAnalytics.paymentMethodStats.codPercentage, salesAnalytics.paymentMethodStats.onlinePercentage)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">Payment Split</p>
                  </div>
                </div>
              </div>
              
              {/* Recent Revenue Trends */}
              {(salesAnalytics.dailyRevenue.length > 0 || salesAnalytics.monthlyRevenue.length > 0) && (
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Daily Revenue */}
                  {salesAnalytics.dailyRevenue.length > 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                      <h4 className="mb-4 font-heading text-lg font-semibold text-gray-800">
                        Daily Revenue (Last 7 Days)
                      </h4>
                      <div className="space-y-3">
                        {salesAnalytics.dailyRevenue.map(day => (
                          <div key={day.date} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
                            <span className="text-sm font-medium text-gray-700">{day.date}</span>
                            <span className="text-sm font-bold text-green-600">₹{day.revenue.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Monthly Revenue */}
                  {salesAnalytics.monthlyRevenue.length > 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                      <h4 className="mb-4 font-heading text-lg font-semibold text-gray-800">
                        Monthly Revenue (Last 6 Months)
                      </h4>
                      <div className="space-y-3">
                        {salesAnalytics.monthlyRevenue.map(month => (
                          <div key={month.month} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
                            <span className="text-sm font-medium text-gray-700">{month.month}</span>
                            <span className="text-sm font-bold text-blue-600">₹{month.revenue.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Low Stock Monitoring */}
          {!loading && lowStockData && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-gray-800">
                    Low Stock ({lowStockData.totalCount})
                  </h3>
                  <p className="text-sm text-gray-500">
                    {lowStockData.outOfStockCount} out of stock, {lowStockData.lowStockCount} low stock
                  </p>
                </div>
                {lowStockData.totalCount > 0 && (
                  <Link
                    href="/admin/products"
                    className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Manage Stock
                  </Link>
                )}
              </div>
              
              {lowStockData.totalCount === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">All products are well stocked!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lowStockData.items.map((item, index) => (
                    <div key={`${item.productId}-${item.size}`} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full ${
                            item.isOutOfStock ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-500">Size: {item.size}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          item.isOutOfStock ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {item.isOutOfStock ? 'Out of Stock' : `${item.stock} left`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.isOutOfStock ? 'Restock needed' : 'Low stock'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/products/new"
                className="rounded-full bg-olive px-5 py-2.5 text-sm font-medium text-white transition hover:bg-olive-light"
              >
                + Add Product
              </Link>
              <Link
                href="/admin/products"
                className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Manage Products
              </Link>
              <Link
                href="/admin/orders"
                className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}