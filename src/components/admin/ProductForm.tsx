"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductFormData } from "@/lib/admin/firestore";
import ImageUploader from "./ImageUploader";
import { PRODUCT_SIZES } from "@/lib/data/products";

const SIZES = ["S", "M", "L", "XL", "XXL"];
const CATEGORIES = [
  { value: "kurta", label: "Kurti" },
  { value: "kurti-set", label: "Kurti Set" },
  { value: "short-kurta", label: "Short Kurta" },
  { value: "crop-top", label: "Crop Top" },
];

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel: string;
}

// Local form state allows `price` to be empty string when creating a new product
type LocalForm = Omit<ProductFormData, "price"> & { price: number | ""; category: ProductFormData['category'] | "" };

const empty: LocalForm = {
  name: "",
  slug: "",
  category: "kurta",
  price: "",
  fabric: "",
  color: "",
  featured: false,
  newArrival: false,
  sizeStock: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
  images: [],
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function ProductForm({
  initialData,
  onSubmit,
  submitLabel,
}: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<LocalForm>(() => {
    // Build empty sizeStock from PRODUCT_SIZES for new products
    const emptySizeStock = Object.fromEntries(
      PRODUCT_SIZES.map((s) => [s, 0])
    ) as Record<string, number>;

    // If editing an existing product, preserve its sizeStock exactly (do not add new sizes automatically)
    const sizeStock = initialData?.sizeStock && Object.keys(initialData.sizeStock).length > 0
      ? (initialData.sizeStock as Record<string, number>)
      : emptySizeStock;

    return {
      ...empty,
      ...(initialData ? { ...initialData, price: initialData.price } : {}),
      // for new products, prefer empty category so placeholder shows
      category: initialData?.category ?? "",
      sizeStock,
      images: initialData?.images ?? [],
    } as LocalForm;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"name"|"price"|"category"|"slug"|"images", string>>>({});

  function set<K extends keyof LocalForm>(key: K, value: LocalForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug:
        prev.slug === "" || prev.slug === slugify(prev.name)
          ? slugify(name)
          : prev.slug,
    }));
    setFieldErrors((f) => ({ ...f, name: undefined }));
  }

  function setSizeStock(size: string, qty: number) {
    setForm((prev) => ({
      ...prev,
      sizeStock: { ...prev.sizeStock, [size]: isNaN(qty) ? 0 : qty },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors: Partial<Record<"name"|"price"|"category"|"slug"|"images", string>> = {};

    if (!form.name.trim()) errors.name = "Product name is required.";
    if (!form.slug.trim()) errors.slug = "Slug is required.";
    // Validate price: must be present and > 0
    if (form.price === "" || Number(form.price) <= 0)
      errors.price = "Price must be provided and greater than 0.";

    // Category must be explicitly selected and must be one of the allowed values
    if (!form.category || !CATEGORIES.some((c) => c.value === form.category)) {
      errors.category = "Please select a valid category.";
    }

    // Images must have at least one entry
    if (!Array.isArray(form.images) || form.images.length === 0) {
      errors.images = "Upload at least one product image.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return setError("Please fix the highlighted fields.");
    }

    setSaving(true);
    try {
      // Convert LocalForm -> ProductFormData by ensuring price is a number
      const payload: ProductFormData = {
        ...(form as unknown as ProductFormData),
        price: Number(form.price),
      };
      await onSubmit(payload);
      router.push("/admin/products");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Basic Information ───────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-5 font-heading text-base font-semibold text-gray-800">
          Basic Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="label">Product Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input"
              placeholder="Thread Worked Brocade Kurti"
            />
          </div>
          <div>
            <label className="label">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              className="input font-mono text-sm"
              placeholder="thread-worked-brocade-kurti"
            />
            <p className="mt-1 text-xs text-gray-400">
              Used in the product URL. Auto-generated from name.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  set("category", e.target.value as LocalForm["category"])
                }
                className="input"
              >
                <option value="" disabled>
                  Select Category
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.category}</p>
              )}
            </div>
            <div>
              <label className="label">Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  set(
                    "price",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="input"
                min={0}
                placeholder="e.g. 1299"
              />
              {fieldErrors.price && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fabric</label>
              <input
                type="text"
                value={form.fabric}
                onChange={(e) => set("fabric", e.target.value)}
                className="input"
                placeholder="Mul Chanderi"
              />
            </div>
            <div>
              <label className="label">Color</label>
              <input
                type="text"
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
                className="input"
                placeholder="Butter Yellow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Visibility ─────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-5 font-heading text-base font-semibold text-gray-800">
          Visibility
        </h2>
        <div className="flex gap-8">
          <label className="flex cursor-pointer items-center gap-3">
            <div
              onClick={() => set("featured", !form.featured)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.featured ? "bg-olive" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.featured ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">Featured</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <div
              onClick={() => set("newArrival", !form.newArrival)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.newArrival ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.newArrival ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">New Arrival</span>
          </label>
        </div>
      </section>

      {/* ── Size-wise Inventory ─────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-5 font-heading text-base font-semibold text-gray-800">
          Size-wise Inventory
        </h2>
        <div className="grid grid-cols-5 gap-3">
          {/**
           * Display sizes in the shared PRODUCT_SIZES order.
           * For existing products, show only sizes present in the product's `sizeStock`.
           * For new products, show all PRODUCT_SIZES.
           */}
          {(
            (initialData && initialData.sizeStock && Object.keys(initialData.sizeStock).length > 0)
              ? PRODUCT_SIZES.filter((s) => s in form.sizeStock)
              : PRODUCT_SIZES
          ).map((size) => (
            <div key={size} className="text-center">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                {size}
              </label>
              <input
                type="number"
                min={0}
                value={form.sizeStock[size] ?? 0}
                onChange={(e) => setSizeStock(size, parseInt(e.target.value))}
                className="input text-center"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Product Images ─────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-1 font-heading text-base font-semibold text-gray-800">
          Product Images
        </h2>
        <p className="mb-5 text-xs text-gray-400">
          Images are uploaded to Cloudinary. URLs are saved in Firestore under the{" "}
          <span className="font-mono">images</span> field.
        </p>
        <ImageUploader
          existingUrls={form.images}
          onChange={(urls) => set("images", urls)}
        />
        {fieldErrors.images && (
          <p className="mt-2 text-xs text-red-600">{fieldErrors.images}</p>
        )}
      </section>

      {/* ── Submit ─────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-olive px-8 py-3 text-sm font-medium text-white transition hover:bg-olive-light disabled:opacity-50"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-full border border-gray-300 px-8 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
