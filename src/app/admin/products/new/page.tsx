"use client";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductForm from "@/components/admin/ProductForm";
import { adminAddProduct, type ProductFormData } from "@/lib/admin/firestore";

export default function NewProductPage() {
  async function handleSubmit(data: ProductFormData) {
    await adminAddProduct(data);
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-gray-800">
              Add Product
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Create a new product in your store.
            </p>
          </div>
          <ProductForm
            onSubmit={handleSubmit}
            submitLabel="Add Product"
          />
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
