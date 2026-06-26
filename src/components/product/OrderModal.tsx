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
  const [errors, setErrors] = useState<{ name?: string; phone?: string; payment?: string; submit?: string; verification?: string; inventory?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");

  async function verifyPayment(paymentResponse: any) {
  setVerifying(true);
  setErrors({});

  console.log("======================================");
  console.log("verifyPayment() called");
  console.log("Payment Response:", paymentResponse);
  console.log("======================================");

  try {
    const response = await fetch("/api/razorpay/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      }),
    });

    const result = await response.json();

    console.log("Verification API Response:", result);

    if (result.success) {
      console.log("Verification successful. Creating Firestore order...");

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
          paymentMethod: "ONLINE",
          paymentStatus: "Paid",
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
          paidAt: new Date().toISOString(),
        });

        console.log("======================================");
        console.log("FIRESTORE ORDER CREATED SUCCESSFULLY");
        console.log("Order ID:", id);
        console.log("======================================");

        setOrderId(id);
        setSuccess(true);
      } catch (orderError) {
        console.error("======================================");
        console.error("CREATE ORDER FAILED");
        console.error(orderError);
        console.error("Customer:", customerName);
        console.error("Phone:", customerPhone);
        console.error("Product:", productName);
        console.error("Items:", items);
        console.error("======================================");

        const errorMessage = orderError instanceof Error ? orderError.message : "Unknown error";
        
        if (errorMessage.includes("Insufficient stock") || errorMessage.includes("Inventory deduction failed")) {
          setErrors({
            inventory: errorMessage,
          });
        } else {
          setErrors({
            verification: "Payment verified but failed to create order. Please contact support.",
          });
        }
      }
    } else {
      console.error("Verification Failed:", result);

      setErrors({
        verification: result.message || "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("VERIFY PAYMENT API ERROR:", error);

    setErrors({
      verification: "Unable to verify payment. Please contact support.",
    });
  } finally {
    setVerifying(false);
    setSubmitting(false);
  }
}

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
      if (paymentMethod === "COD") {
        // COD flow remains unchanged
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
      } else {
        // ONLINE payment flow with Razorpay
        const response = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalPrice }),
        });

        if (!response.ok) {
          throw new Error('Failed to create Razorpay order');
        }

        const { razorpayOrderId, amount, currency } = await response.json();

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount,
          currency,
          name: 'Pearl by Ann',
          description: `Order for ${productName}`,
          order_id: razorpayOrderId,
          prefill: {
            name: customerName.trim(),
            contact: customerPhone.trim(),
          },
          handler: function (response: any) {
            // Payment reported as successful by Razorpay
            // Now verify the payment on the server
            verifyPayment(response);
          },
          modal: {
            ondismiss: function () {
              // User closed the Razorpay popup - cancel payment
              setSubmitting(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to place order. Please try again.";
      
      if (errorMessage.includes("Insufficient stock") || errorMessage.includes("Inventory deduction failed")) {
        setErrors({ inventory: errorMessage });
      } else {
        setErrors({ submit: errorMessage });
      }
      setSubmitting(false);
    } finally {
      if (paymentMethod === "COD") {
        setSubmitting(false);
      }
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
            {errors.verification && <p className="text-sm text-red-600">{errors.verification}</p>}
            {errors.inventory && <p className="text-sm text-red-600">{errors.inventory}</p>}
            {verifying && <p className="text-sm text-blue-600">Processing payment and creating order...</p>}

            {success ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {paymentMethod === "COD" ? (
                  <>
                    <p className="font-semibold">Order placed successfully!</p>
                    <p className="mt-1">Your order ID is {orderId}.</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">Payment successful. Your order has been placed.</p>
                    <p className="mt-1">Your order ID is {orderId}.</p>
                  </>
                )}
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
                  disabled={submitting || verifying}
                  className="flex-1 rounded-full bg-olive px-6 py-3 text-sm font-semibold text-white transition hover:bg-olive-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {verifying ? "Creating order..." : submitting ? "Processing..." : "Confirm Order"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting || verifying}
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
