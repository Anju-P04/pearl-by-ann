"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductForm from "@/components/admin/ProductForm";
import {
  adminGetProductById,
  adminUpdateProduct,
  type ProductFormData,
} from "@/lib/admin/firestore";
import type { Product } from "@/lib/data/products";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      const fetched = await adminGetProductById(id);
      if (!fetched) {
        setNotFound(true);
      } else {
        setProduct(fetched);
      }
      setLoading(false);
    }

    loadProduct();
  }, [id]);

  async function handleSubmit(data: ProductFormData) {
    await adminUpdateProduct(id, data);
  }

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-olive border-t-transparent" />
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  if (notFound) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="py-20 text-center text-sm text-gray-400">
            Product not found.
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  const initialData: Partial<ProductFormData> = {
    name: product!.name,
    slug: product!.slug,
    category: product!.category,
    price: product!.price,
    fabric: product!.fabric,
    color: product!.color,
    featured: product!.featured,
    newArrival: product!.newArrival ?? false,
    sizeStock: product!.sizeStock,
    images: product!.images ?? [],
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-gray-800">
              Edit Product
            </h2>
            <p className="mt-1 text-sm text-gray-500">{product!.name}</p>
          </div>
          <ProductForm
            initialData={initialData}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
          />
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
