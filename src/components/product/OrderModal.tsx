"use client";

import { useState, type FormEvent } from "react";
import { createOrder, type OrderItem, type PaymentMethod } from "@/lib/orders/firestore";

interface OrderModalProps {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  items: OrderItem[];
  unitPrice: number;
  totalItems: number;
  totalPrice: number;
  onClose: () => void;
}

function isValidIndianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
}

export default function OrderModal({
  productId,
  productName,
  productSlug,
  productImage,
  items,
  unitPrice,
  totalItems,
  totalPrice,
  onClose,
}: OrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; payment?: string; submit?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: typeof errors = {};

    if (!customerName.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!customerPhone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (!isValidIndianPhone(customerPhone.trim())) {
      nextErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!paymentMethod) {
      nextErrors.payment = "Please select a payment method.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const id = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        productId,
        productName,
        productSlug,
        productImage,
        items,
        totalItems,
        unitPrice,
        totalPrice,
        paymentMethod: paymentMethod as PaymentMethod,
      });

      setOrderId(id);
      setSuccess(true);
    } catch (error) {
      setErrors({ submit: "Unable to place order. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Place Your Order</h2>
            <p className="mt-1 text-sm text-gray-500">
              Product: <span className="font-medium text-gray-800">{productName}</span>
            </p>
            <p className="text-sm text-gray-500">Total items: {totalItems}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <img
              src={productImage}
              alt={productName}
              className="h-16 w-16 rounded-xl object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">{productName}</p>
              <p className="text-sm text-gray-500">Unit price: ₹{unitPrice}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-800">Order summary</p>
            <div className="mt-3 space-y-1">
              {items.map((item) => (
                <p key={item.size}>
                  {item.size} × {item.quantity}
                </p>
              ))}
            </div>
            <p className="mt-3">Total: {totalItems} items</p>
            <p className="font-semibold">Total price: ₹{totalPrice}</p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-800">Payment Method</p>
            <div className="mt-3 flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="accent-olive"
                />
                <span className="text-sm text-gray-700">Cash on Delivery</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE"
                  checked={paymentMethod === "ONLINE"}
                  onChange={() => setPaymentMethod("ONLINE")}
                  className="accent-olive"
                />
                <span className="text-sm text-gray-700">Pay Online</span>
              </label>
            </div>
            {errors.payment && <p className="mt-2 text-xs text-red-600">{errors.payment}</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Customer Name</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-olive focus:outline-none focus:ring-1 focus:ring-olive"
                placeholder="Enter your name"
                type="text"
              />
              {errors.name && <p className="mt-2 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-olive focus:outline-none focus:ring-1 focus:ring-olive"
                placeholder="10-digit mobile number"
                type="tel"
              />
              {errors.phone && <p className="mt-2 text-xs text-red-600">{errors.phone}</p>}
            </div>

            {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}

            {success ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <p className="font-semibold">Order placed successfully!</p>
                <p className="mt-1">Your order ID is {orderId}.</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 inline-flex rounded-full bg-olive px-6 py-3 text-sm font-medium text-white transition hover:bg-olive-light"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-full bg-olive px-6 py-3 text-sm font-semibold text-white transition hover:bg-olive-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Placing order…" : "Confirm Order"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
