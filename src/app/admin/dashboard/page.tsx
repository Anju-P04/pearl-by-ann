"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { getDashboardStats, type DashboardStats } from "@/lib/admin/firestore";

const STAT_CONFIG = [
  {
    key: "total" as keyof DashboardStats,
    label: "Total Products",
    color: "bg-olive",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    key: "categories" as keyof DashboardStats,
    label: "Categories",
    color: "bg-indigo-500",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    key: "featured" as keyof DashboardStats,
    label: "Featured",
    color: "bg-yellow-500",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    key: "newArrivals" as keyof DashboardStats,
    label: "New Arrivals",
    color: "bg-green-600",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    key: "outOfStock" as keyof DashboardStats,
    label: "Out of Stock",
    color: "bg-red-500",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-gray-800">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Overview of your Pearl by Ann store.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STAT_CONFIG.map((s) => (
              <div
                key={s.key}
                className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color} text-white`}
                >
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {loading ? "—" : stats?.[s.key] ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

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
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
